import * as path from 'path';
import { expect, Locator, Page } from '@playwright/test';
import {
  APPLIANCE_FIELDS,
  APPLIANCE_SECTIONS,
  ApplianceSection,
  FieldSpec,
} from '../test-data/assessment-tasks';
import {
  InsulationSectionSpec,
  insulationFields,
} from '../test-data/energyAssessmentData';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function labelPattern(label: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(label)}\\s*\\*?\\s*$`);
}

/** test-data/fixtures/measure.png, used for every Measure Images upload below. */
const MEASURE_IMAGE_FIXTURE = path.resolve(__dirname, '../test-data/fixtures/measure.png');

/**
 * Status columns available on the Energy Assessment Kanban board.
 */
export type AssessmentStatus = 'Not Started' | 'In Progress' | 'Completed';

/**
 * Page object representing the Energy Assessment Kanban board on the Project Details page.
 * Provides methods for opening the tab, locating task cards in columns, asserting progress
 * (e.g., '0 / 6 sections'), and delegating task form interactions.
 */
export class EnergyAssessmentPage {
  readonly energyAssessmentTab: Locator;
  readonly goBackToProjectDetailsLink: Locator;

  /**
   * Initializes locators for the Energy Assessment Kanban board.
   * @param page Playwright Page instance
   */
  constructor(private readonly page: Page) {
    // Energy assessment tab on Project Details
    this.energyAssessmentTab = page.getByRole('tab', {
      name: /^Energy assessment$/i,
    });

    // Link in header/breadcrumbs to return to Project Details
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });
  }

  /**
   * Helper getter returning an AssessmentTaskPage instance for the current page context.
   */
  get task(): AssessmentTaskPage {
    return new AssessmentTaskPage(this.page);
  }

  /**
   * Helper getter returning an AppliancesAssessmentPage instance for the current page context.
   */
  get appliances(): AppliancesAssessmentPage {
    return new AppliancesAssessmentPage(this.page);
  }

  /**
   * Navigates to or activates the Energy Assessment tab on the Project Details page.
   * Checks if the tab is already selected before clicking to avoid redundant navigation.
   */
  async open() {
    if (this.page.url().includes('/task/')) {
      await this.goBackToProjectDetails();
    }

    await expect(this.energyAssessmentTab).toBeVisible({ timeout: 20_000 });
    await expect(this.energyAssessmentTab).toBeEnabled({ timeout: 20_000 });

    const isSelected = await this.energyAssessmentTab
      .getAttribute('aria-selected')
      .catch(() => null);

    if (isSelected !== 'true') {
      await this.energyAssessmentTab.click();
    }

    // Wait until the Kanban columns render (indicated by the 'Not Started' column title)
    await expect(
      this.page.getByText('Not Started', { exact: true })
    ).toBeVisible({ timeout: 20_000 });
  }

  /**
   * Finds the column container on the board matching the given status.
   *
   * @param status 'Not Started' | 'In Progress' | 'Completed'
   * @returns Locator pointing to the column's outer container div
   */
  getColumn(status: AssessmentStatus): Locator {
    return this.page
      .getByText(status, { exact: true })
      .locator('xpath=ancestor::div[2]');
  }

  /**
   * Locates a task card with a specific name inside a specific column.
   *
   * @param status Column status to search in
   * @param taskName Name of the task (e.g. 'Air Sealing' or 'Appliances')
   */
  taskCardIn(status: AssessmentStatus, taskName: string): Locator {
    return this.getColumn(status).getByText(taskName, { exact: true });
  }

  /**
   * Locates a task card anywhere on the board by matching both the task name
   * and the sections progress text (e.g. '0 / 6 sections').
   * Uses .last() to select the innermost card container.
   *
   * @param taskName Name of the task card to locate
   */
  taskCard(taskName: string): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByText(taskName, { exact: true }) })
      .filter({ has: this.page.getByText(/\d+\s*\/\s*\d+ sections/) })
      .filter({ visible: true })
      .last();
  }

  /**
   * Asserts that a task card displays the expected section progress counter.
   *
   * @param taskName Name of the task
   * @param done Number of completed sections
   * @param total Total number of sections
   */
  async expectSectionsProgress(taskName: string, done: number, total: number) {
    await expect(this.taskCard(taskName)).toContainText(`${done} / ${total} sections`);
  }

  /**
   * Clicks on a task card to open its detail/editing screen.
   *
   * @param taskName Name of the task to open
   */
  async openTask(taskName: string) {
    const card = this.taskCard(taskName);
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await card.click();
    } else {
      await this.page
        .getByText(taskName, { exact: true })
        .filter({ visible: true })
        .first()
        .click();
    }
    await this.page.waitForLoadState('networkidle');
    await this.page
      .locator('text=Loading project details...')
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => null);
  }

  /**
   * Asserts that a task card is visible inside the expected Kanban column.
   *
   * @param taskName Name of the task
   * @param status Expected column status
   */
  async expectTaskInColumn(taskName: string, status: AssessmentStatus) {
    await expect(this.taskCardIn(status, taskName)).toBeVisible();
  }

  /**
   * Asserts that a task card is NOT present inside a specific Kanban column.
   *
   * @param taskName Name of the task
   * @param status Column status where task should not be present
   */
  async expectTaskNotInColumn(taskName: string, status: AssessmentStatus) {
    await expect(this.taskCardIn(status, taskName)).toHaveCount(0);
  }

  /**
   * Gets the progress text element (e.g. '1 / 1 sections') for a given task card.
   *
   * @param taskName Name of the task
   */
  sectionsProgressFor(taskName: string): Locator {
    return this.taskCard(taskName).getByText(/\d+\s*\/\s*\d+ sections/);
  }

  // ---------- Forwarding helpers for active assessment tasks ----------

  /** Selects a dropdown option inside the active task form */
  async selectDropdownOption(label: string, optionName: string) {
    return this.task.selectDropdownOption(label, optionName);
  }

  /** Fills a text input field inside the active task form */
  async fillField(label: string, value: string) {
    return this.task.fillField(label, value);
  }

  /** Checks a checkbox inside the active task form */
  async checkCheckbox(label: string) {
    return this.task.checkCheckbox(label);
  }

  /** Expands an accordion section by title inside the active task form */
  async expandSection(sectionTitle: string) {
    return this.task.expandSection(sectionTitle);
  }

  /** Uploads an image file for the measure */
  async uploadMeasureImage(filePath: string) {
    return this.task.uploadMeasureImage(filePath);
  }

  /** Saves changes for the active task form */
  async saveChanges() {
    return this.task.saveChanges();
  }

  /**
   * Navigates back to the Project Details overview screen.
   */
  async goBackToProjectDetails() {
    // If the application automatically redirects to project-details, wait for it
    await this.page.waitForURL(/project-details/, { timeout: 5000 }).catch(() => null);

    if (this.page.url().includes('/project-details/')) {
      return;
    }

    const isVisible = await this.goBackToProjectDetailsLink
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (isVisible) {
      await this.goBackToProjectDetailsLink.click().catch(() => null);
    }
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });
  }
}

/**
 * Generic page object for an individual Energy Assessment task screen (e.g. Air Sealing).
 * Provides methods for filling dropdowns, text fields, checkboxes, uploading photos, and saving.
 */
export class AssessmentTaskPage {
  readonly saveChangesButton: Locator;
  readonly uploadImagesHeading: Locator;
  readonly fileInput: Locator;
  readonly uploadButton: Locator;
  readonly goBackToProjectDetailsLink: Locator;

  /**
   * Initializes locators for generic assessment task controls.
   * @param page Playwright Page instance
   */
  constructor(private readonly page: Page) {
    // Form action buttons and headings
    this.saveChangesButton = page.getByRole('button', {
      name: 'Save Changes',
      exact: true,
    });
    this.uploadImagesHeading = page.getByRole('heading', {
      name: 'Upload Images',
    });
    this.fileInput = page.getByLabel('Take photos or upload images');
    this.uploadButton = page.getByRole('button', { name: 'Upload', exact: true });
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });
  }

  /**
   * Selects an option from a combobox dropdown by label.
   *
   * @param label Visible label of the combobox
   * @param optionName Exact text of the option to select (optional; selects first if omitted)
   */
  async selectDropdownOption(label: string, optionName?: string) {
    const combobox = this.page
      .getByRole('combobox', { name: label })
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('[role="combobox"], select')
      )
      .first();
    await combobox.click();
    if (optionName) {
      await this.page.getByRole('option', { name: optionName }).first().click();
    } else {
      await this.page.getByRole('option').first().click();
    }
  }

  /**
   * Switches the active subcategory tab within a task screen
   * (e.g. 'Attic - Open', 'Basement - Ceiling' inside the Insulation task).
   *
   * @param subcategoryName Visible name of the subcategory tab or button
   */
  async selectSubcategory(subcategoryName: string) {
    const tab = this.page
      .getByRole('tab', { name: subcategoryName })
      .or(this.page.getByRole('button', { name: subcategoryName, exact: true }))
      .or(this.page.getByText(subcategoryName, { exact: true }));
    const targetTab = tab.first();
    await targetTab.click();
    await expect(targetTab).toBeVisible();
  }

  /**
   * Fills a text input or spinbutton field by its label.
   *
   * @param label Accessible label of the field
   * @param value Text string to enter
   */
  async fillField(label: string, value: string) {
    const field = this.page
      .getByRole('textbox', { name: label })
      .or(this.page.getByRole('spinbutton', { name: label }));
    await field.fill(value);
  }

  /**
   * Checks a checkbox input by its label.
   *
   * @param label Accessible label of the checkbox
   */
  async checkCheckbox(label: string) {
    await this.page.getByRole('checkbox', { name: label }).check();
  }

  /**
   * Clicks on an accordion section header to expand it.
   *
   * @param sectionTitle Title of the accordion section
   */
  async expandSection(sectionTitle: string) {
    await this.page.getByText(sectionTitle, { exact: true }).click();
  }

  /**
   * Uploads an image file to the measure's photo section.
   *
   * @param filePath Absolute path to the image file to upload
   */
  async uploadMeasureImage(filePath: string) {
    const isHeading = await this.uploadImagesHeading.isVisible({ timeout: 2000 }).catch(() => false);
    if (isHeading) {
      await this.uploadImagesHeading.click().catch(() => null);
    }
    await this.fileInput.setInputFiles(filePath);
    await this.uploadButton.click();
    // Wait for upload button to finish processing or remain stable
    await expect(this.uploadButton).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Clicks 'Save Changes' and waits for the backend update API response.
   */
  async saveChanges() {
    // Listen for backend save response
    const savePromise = this.page
      .waitForResponse(
        (res) =>
          (res.url().includes('/api/subcategories') ||
            res.url().includes('/api/measures') ||
            res.url().includes('/api/projects')) &&
          (res.request().method() === 'POST' ||
            res.request().method() === 'PUT') &&
          res.status() === 200,
        { timeout: 15_000 }
      )
      .catch(() => null);

    const saveBtn = this.saveChangesButton.or(
      this.page.getByRole('button', { name: /Save Changes|Save/i })
    );

    // If button is already disabled or not dirty (e.g. on retries), changes are already persisted
    const isSaveEnabled = await saveBtn.first().isEnabled({ timeout: 2000 }).catch(() => false);
    if (!isSaveEnabled) {
      return;
    }

    await saveBtn.first().click();
    await savePromise;

    // Verify success banner if shown
    await expect(
      this.page.getByText(/Project updated successfully/i)
    ).toBeVisible({ timeout: 10_000 }).catch(() => null);
  }

  /**
   * Navigates back to the Project Details screen.
   */
  async goBackToProjectDetails() {
    // Wait if the application automatically redirects to project-details
    await this.page.waitForURL(/project-details/, { timeout: 5000 }).catch(() => null);

    if (this.page.url().includes('/project-details/')) {
      return;
    }

    const isVisible = await this.goBackToProjectDetailsLink
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (isVisible) {
      await this.goBackToProjectDetailsLink.click();
    }
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });
  }
}

/**
 * Page object representing the Appliances task screen (/assessment/:id/task/appliances).
 * Supports interacting with all six section tabs (Refrigerator, Advanced Power Strip,
 * Clothes Washer, Clothes Dryer, Freezer, Dehumidifier) and adding multiple instances.
 */
export class AppliancesAssessmentPage {
  readonly pageDescription: Locator;
  readonly goBackToProjectDetailsLink: Locator;
  readonly addInstanceButton: Locator;

  /**
   * Initializes locators for the Appliances task page.
   * @param page Playwright Page instance
   */
  constructor(private readonly page: Page) {
    this.pageDescription = page.getByText('Energy-efficient appliances and equipment upgrades');
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });

    // The '+' icon button to add another instance of the active appliance section.
    // Uses .last() because the top '+' adds a section while the bottom '+' adds an instance.
    this.addInstanceButton = page
      .getByRole('button')
      .filter({ has: page.locator('[data-testid="AddIcon"], img[src*="add"]') })
      .last();
  }

  // ---------- Page and tabs ----------

  /**
   * Asserts that the appliances task URL is loaded and loading overlays have detached.
   */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/task\/appliances/);
    await this.page
      .waitForSelector('text=Loading project details...', {
        state: 'detached',
        timeout: 15_000,
      })
      .catch(() => null);
    await expect(this.pageDescription).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Asserts that all 6 appliance section tab buttons are visible on the screen.
   */
  async expectAllSectionTabsVisible() {
    for (const section of APPLIANCE_SECTIONS) {
      await expect(
        this.page.getByText(section, { exact: true }).first()
      ).toBeVisible({ timeout: 15_000 });
    }
  }

  /**
   * Locates the heading for a specific section and instance (e.g. 'Refrigerator - Instance 1').
   *
   * @param section Section name
   * @param instance 1-based instance number
   */
  instanceHeading(section: ApplianceSection, instance = 1): Locator {
    return this.page.getByText(`${section} - Instance ${instance}`, { exact: true });
  }

  /**
   * Switches to an appliance section tab and waits for Instance 1 heading to appear.
   *
   * @param section Name of the appliance section tab to select
   * @param options Optional settings: set `saveOnSwitch: true` to click Save & Continue instead of Discard & Continue
   */
  async selectSection(section: ApplianceSection, options?: { saveOnSwitch?: boolean }) {
    const tab = this.page
      .locator('[role="tab"]')
      .filter({ hasText: section })
      .getByText(section, { exact: true })
      .or(this.page.getByText(section, { exact: true }));
    await tab.first().click();

    // Check if an "Edit Subcategory" modal opened accidentally due to icon proximity
    const editSubcategoryHeading = this.page.getByRole('heading', { name: 'Edit Subcategory' });
    if (await editSubcategoryHeading.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.page.getByRole('button', { name: 'Cancel' }).click().catch(() => null);
    }

    // Check if an "Unsaved Changes" dialog appears when switching tabs
    const saveAndContinueBtn = this.page.getByRole('button', { name: /Save & Continue/i });
    const discardAndContinueBtn = this.page.getByRole('button', { name: /Discard & Continue/i });
    if (options?.saveOnSwitch) {
      if (await saveAndContinueBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await saveAndContinueBtn.click();
      } else if (await discardAndContinueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await discardAndContinueBtn.click();
      }
    } else {
      if (await discardAndContinueBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await discardAndContinueBtn.click();
      } else if (await saveAndContinueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await saveAndContinueBtn.click();
      }
    }

    await expect(this.instanceHeading(section, 1)).toBeVisible({ timeout: 10_000 });
  }

  // ---------- Field locators ----------
  // Fields repeat once per instance, so we index using .nth(instance - 1).

  /**
   * Locates a text input or textarea element by label, role, or fallback placeholder.
   * Filters out MUI hidden shadow textareas used for measuring height.
   *
   * @param label Accessible label or placeholder
   * @param instance 1-based instance number (default: 1)
   */
  textbox(label: string, instance = 1): Locator {
    return this.page
      .getByRole('textbox', { name: label })
      .or(this.page.getByRole('spinbutton', { name: label }))
      .or(this.page.getByLabel(label, { exact: true }))
      .or(this.page.getByPlaceholder(label, { exact: true }))
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('input, textarea:not([aria-hidden="true"])')
      )
      .locator('visible=true')
      .nth(instance - 1);
  }

  /**
   * Locates a dropdown combobox for an appliance field.
   *
   * @param label Accessible label
   * @param instance 1-based instance number (default: 1)
   */
  dropdown(label: string, instance = 1): Locator {
    return this.page
      .getByRole('combobox', { name: label, exact: true })
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('[role="combobox"], select')
      )
      .locator('visible=true')
      .nth(instance - 1);
  }

  /**
   * Locates a checkbox input for an appliance field.
   *
   * @param label Accessible label
   * @param instance 1-based instance number (default: 1)
   */
  checkbox(label: string, instance = 1): Locator {
    return this.page
      .getByRole('checkbox', { name: label, exact: true })
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('input[type="checkbox"]')
      )
      .locator('visible=true')
      .nth(instance - 1);
  }

  /**
   * Returns the appropriate locator based on the field specification kind.
   *
   * @param field FieldSpec configuration
   * @param instance 1-based instance number (default: 1)
   */
  fieldLocator(field: FieldSpec, instance = 1): Locator {
    switch (field.kind) {
      case 'select':
        return this.dropdown(field.label, instance);
      case 'checkbox':
        return this.checkbox(field.label, instance);
      default:
        return this.textbox(field.label, instance);
    }
  }

  // ---------- Field actions ----------

  /**
   * Selects a specific dropdown option by name or regex.
   *
   * @param label Combobox label
   * @param option Exact option text or RegExp
   * @param instance 1-based instance number (default: 1)
   */
  async selectOption(label: string, option: string | RegExp, instance = 1) {
    await this.dropdown(label, instance).click();
    await this.page.getByRole('option', { name: option }).first().click();
  }

  /**
   * Selects the first available option in a dropdown when specific value does not matter.
   *
   * @param label Combobox label
   * @param instance 1-based instance number (default: 1)
   */
  async selectFirstOption(label: string, instance = 1) {
    const dropdown = this.dropdown(label, instance);
    await dropdown.scrollIntoViewIfNeeded().catch(() => null);
    await dropdown.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible({ timeout: 5000 });

    const options = listbox.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });

    const count = await options.count();
    let target = options.first();
    for (let i = 0; i < count; i++) {
      const opt = options.nth(i);
      const text = (await opt.innerText()).trim();
      if (text && !/^(select|none|choose)$/i.test(text)) {
        target = opt;
        break;
      }
    }
    await target.click();
    await expect(listbox).toBeHidden({ timeout: 5000 }).catch(async () => {
      await this.page.keyboard.press('Escape').catch(() => null);
    });
  }

  /**
   * Fills a single field according to its FieldSpec definition.
   *
   * @param field FieldSpec object
   * @param instance 1-based instance number (default: 1)
   */
  async fillField(field: FieldSpec, instance = 1) {
    switch (field.kind) {
      case 'text':
      case 'textarea':
        await this.textbox(field.label, instance).fill(String(field.value ?? ''));
        break;
      case 'select':
        if (typeof field.value === 'string') {
          await this.selectOption(field.label, field.value, instance);
        } else {
          await this.selectFirstOption(field.label, instance);
        }
        break;
      case 'checkbox':
        if (field.value === false) {
          await this.checkbox(field.label, instance).uncheck();
        } else {
          await this.checkbox(field.label, instance).check();
        }
        break;
    }
  }

  /**
   * Clicks the '+' button to add an additional instance of the current appliance section.
   */
  async addInstance() {
    await this.addInstanceButton.scrollIntoViewIfNeeded().catch(() => null);
    await this.addInstanceButton.click();
  }

  // ---------- Section-level flows ----------

  /**
   * Asserts that every field defined for a section is visible.
   *
   * @param section Appliance section name
   * @param instance 1-based instance number (default: 1)
   */
  async expectSectionFieldsVisible(section: ApplianceSection, instance = 1) {
    for (const field of APPLIANCE_FIELDS[section]) {
      await expect(
        this.fieldLocator(field, instance),
        `${section}: "${field.label}" should be visible`
      ).toBeVisible({ timeout: 10_000 });
    }
  }

  /**
   * Fills all fields defined for the given section.
   *
   * @param section Appliance section name
   * @param instance 1-based instance number (default: 1)
   */
  async fillSectionFields(section: ApplianceSection, instance = 1) {
    for (const field of APPLIANCE_FIELDS[section]) {
      await this.fillField(field, instance);
    }
  }

  /**
   * Switches to the given section tab and fills all its fields.
   *
   * @param section Appliance section name
   * @param instance 1-based instance number (default: 1)
   */
  async fillSection(section: ApplianceSection, instance = 1) {
    await this.selectSection(section);
    await this.fillSectionFields(section, instance);
  }

  /**
   * Verifies that text, textarea, and checkbox fields retain their expected entered values.
   *
   * @param section Appliance section name
   * @param instance 1-based instance number (default: 1)
   */
  async expectSectionValues(section: ApplianceSection, instance = 1) {
    for (const field of APPLIANCE_FIELDS[section]) {
      const locator = this.fieldLocator(field, instance);
      if (field.kind === 'text' || field.kind === 'textarea') {
        await expect(locator, `${section}: ${field.label}`).toHaveValue(
          String(field.value ?? '')
        );
      } else if (field.kind === 'checkbox') {
        if (field.value === false) {
          await expect(locator, `${section}: ${field.label}`).not.toBeChecked();
        } else {
          await expect(locator, `${section}: ${field.label}`).toBeChecked();
        }
      }
    }
  }

  /**
   * Clicks 'Save Changes' on the Appliances task page and waits for backend save response.
   */
  async saveChanges() {
    const saveButton = this.page.getByRole('button', {
      name: 'Save Changes',
      exact: true,
    });
    const savePromise = this.page
      .waitForResponse(
        (res) =>
          (res.url().includes('/api/subcategories') ||
            res.url().includes('/api/measures') ||
            res.url().includes('/api/projects')) &&
          (res.request().method() === 'POST' ||
            res.request().method() === 'PUT') &&
          res.status() === 200,
        { timeout: 15_000 }
      )
      .catch(() => null);

    const isSaveEnabled = await saveButton.isEnabled({ timeout: 2000 }).catch(() => false);
    if (!isSaveEnabled) {
      return;
    }

    await saveButton.click();
    await savePromise;

    // Verify success banner if shown
    await expect(
      this.page.getByText(/Project updated successfully/i)
    ).toBeVisible({ timeout: 10_000 }).catch(() => null);
  }

  /**
   * Returns back to the Project Details overview screen.
   */
  async goBackToProjectDetails() {
    if (this.page.url().includes('/project-details/')) {
      return;
    }
    await this.goBackToProjectDetailsLink.click().catch(() => null);
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });
  }
}

/**
 * A single-instance task screen with a bottom "Save Changes" button and,
 * optionally, one field whose value reveals extra fields (e.g. Domestic Hot
 * Water's "Upgrade Recommended" -> Yes). Covers Domestic Hot Water,
 * Safety Information & Air Flow, and Water Package.
 */
export class GenericTaskFormPage {
  readonly saveChangesButton: Locator;
  readonly goBackToProjectDetailsLink: Locator;

  constructor(private readonly page: Page) {
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });
  }

  async expectLoaded(taskUrlPart: RegExp) {
    await expect(this.page).toHaveURL(taskUrlPart, { timeout: 15_000 });
    await this.page
      .locator('text=Loading project details...')
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => null);
  }

  textbox(label: string): Locator {
    const pattern = labelPattern(label);
    return this.page
      .getByRole('textbox', { name: pattern })
      .or(this.page.getByRole('spinbutton', { name: pattern }))
      .or(this.page.getByLabel(pattern))
      .or(this.page.getByPlaceholder(pattern))
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('input, textarea:not([aria-hidden="true"])')
      )
      .locator('visible=true')
      .first();
  }

  dropdown(label: string): Locator {
    const pattern = labelPattern(label);
    return this.page
      .getByRole('combobox', { name: pattern })
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('[role="combobox"], select')
      )
      .locator('visible=true')
      .first();
  }

  checkbox(label: string): Locator {
    const pattern = labelPattern(label);
    return this.page
      .getByRole('checkbox', { name: pattern })
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('input[type="checkbox"]')
      )
      .locator('visible=true')
      .first();
  }

  async selectOption(label: string, option: string) {
    const dd = this.dropdown(label);
    await dd.scrollIntoViewIfNeeded().catch(() => null);
    await dd.click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  async selectFirstOption(label: string) {
    const dd = this.dropdown(label);
    await dd.scrollIntoViewIfNeeded().catch(() => null);
    await dd.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible({ timeout: 5000 });

    const options = listbox.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });

    const count = await options.count();
    let target = options.first();
    for (let i = 0; i < count; i++) {
      const opt = options.nth(i);
      const text = (await opt.innerText()).trim();
      if (text && !/^(select|none|choose)$/i.test(text)) {
        target = opt;
        break;
      }
    }
    await target.click();
    await expect(listbox).toBeHidden({ timeout: 5000 }).catch(async () => {
      await this.page.keyboard.press('Escape').catch(() => null);
    });
  }

  async fillField(field: FieldSpec) {
    switch (field.kind) {
      case 'text':
      case 'textarea':
        await this.textbox(field.label).fill(String(field.value ?? ''));
        break;
      case 'select':
        if (typeof field.value === 'string') {
          await this.selectOption(field.label, field.value);
        } else {
          await this.selectFirstOption(field.label);
        }
        break;
      case 'checkbox':
        if (field.value === false) {
          await this.checkbox(field.label).uncheck();
        } else {
          await this.checkbox(field.label).check();
        }
        break;
    }
  }

  /** Fills every field, skipping conditional ones whose trigger isn't set yet. */
  async fillFields(fields: FieldSpec[]) {
    const values = new Map<string, string>();
    for (const field of fields) {
      if (field.showWhen && values.get(field.showWhen.label) !== field.showWhen.equals) {
        continue;
      }
      await this.fillField(field);
      if (typeof field.value === 'string') {
        values.set(field.label, field.value);
      }
    }
  }

  async checkBoxes(labels: string[]) {
    for (const label of labels) {
      await this.checkbox(label).check();
    }
  }

  /** Uploads test-data/fixtures/measure.png via the hidden file input under "Measure Images". */
  async uploadMeasureImage(filePath: string = MEASURE_IMAGE_FIXTURE) {
    const input = this.page
      .getByLabel('Take photos or upload images')
      .or(
        this.page
          .locator('input[type="file"]')
          .filter({ has: this.page.locator('xpath=ancestor::*[.//text()[contains(., "Measure Images")]]') })
      )
      .or(this.page.locator('input[type="file"]'))
      .first();
    await input.setInputFiles(filePath);

    // If modal dialog pops up, confirm the upload by clicking Upload button
    const uploadDialog = this.page.getByRole('dialog');
    if (await uploadDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      const modalUploadBtn = uploadDialog.getByRole('button', { name: 'Upload', exact: true });
      if (await modalUploadBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await modalUploadBtn.click();
        await uploadDialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
      }
    }
  }

  async expectFieldValue(field: FieldSpec) {
    if (field.kind === 'text' || field.kind === 'textarea') {
      await expect(this.textbox(field.label), field.label).toHaveValue(String(field.value ?? ''));
    } else if (field.kind === 'checkbox') {
      if (field.value === false) {
        await expect(this.checkbox(field.label), field.label).not.toBeChecked();
      } else {
        await expect(this.checkbox(field.label), field.label).toBeChecked();
      }
    }
  }

  async expectFieldValues(fields: FieldSpec[]) {
    for (const field of fields) {
      if (field.kind === 'text' || field.kind === 'textarea') {
        await this.expectFieldValue(field);
      }
    }
  }

  async saveChanges() {
    const isEnabled = await this.saveChangesButton.isEnabled({ timeout: 3000 }).catch(() => false);
    if (!isEnabled) {
      return;
    }

    await Promise.all([
      this.page
        .waitForResponse(
          (res) => ['POST', 'PUT', 'PATCH'].includes(res.request().method()) && res.ok(),
          { timeout: 20_000 },
        )
        .catch(() => null),
      this.saveChangesButton.click(),
    ]);

    await this.page
      .getByText(/Project updated successfully/i)
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => null);
  }

  async goBackToProjectDetails() {
    if (this.page.url().includes('/project-details/')) {
      return;
    }
    const isVisible = await this.goBackToProjectDetailsLink.isVisible({ timeout: 2000 }).catch(() => false);
    if (isVisible) {
      await this.goBackToProjectDetailsLink.click().catch(() => null);
    }
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });
  }
}

/**
 * The Insulation task screen: 11 tabs (Attic - Open, Basement - Ceiling,
 * Wall - Exterior, ...), each single-instance, each gated by an
 * "Is Auditable" dropdown, each with its own "Save Changes" button.
 *
 * "Attic - Open" and "Basement - Ceiling" are known to require a Measure
 * Image when Is Auditable = Yes (from Snapshot's Save All validation).
 * fillSection() below always uploads test-data/fixtures/measure.png when
 * auditable = true, for every section, so this doesn't need to be tracked
 * per-section.
 */
export class InsulationAssessmentPage {
  readonly saveChangesButton: Locator;
  readonly goBackToProjectDetailsLink: Locator;

  constructor(private readonly page: Page) {
    this.saveChangesButton = page.getByRole('button', { name: 'Save Changes' });
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/task\/insulation/, { timeout: 15_000 });
    await this.page
      .locator('text=Loading project details...')
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => null);
  }

  sectionTab(name: string): Locator {
    return this.page.getByText(name, { exact: true }).first();
  }

  async selectSection(section: InsulationSectionSpec) {
    if (this.page.url().includes('/project-details/')) {
      const board = new EnergyAssessmentPage(this.page);
      await board.openTask('Insulation');
      await this.expectLoaded();
    }
    await this.sectionTab(section.name).click();
    const saveAndContinueBtn = this.page.getByRole('button', { name: /Save & Continue/i });
    const discardAndContinueBtn = this.page.getByRole('button', { name: /Discard & Continue/i });
    if (await saveAndContinueBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await saveAndContinueBtn.click();
    } else if (await discardAndContinueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await discardAndContinueBtn.click();
    }
    await expect(
      this.page.getByText(`${section.name} - Instance 1`, { exact: true }),
    ).toBeVisible({ timeout: 10_000 });
  }

  textbox(label: string): Locator {
    const pattern = labelPattern(label);
    return this.page
      .getByRole('textbox', { name: pattern })
      .or(this.page.getByRole('spinbutton', { name: pattern }))
      .or(this.page.getByLabel(pattern))
      .or(this.page.getByPlaceholder(pattern))
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('input, textarea:not([aria-hidden="true"])')
      )
      .locator('visible=true')
      .first();
  }

  dropdown(label: string): Locator {
    const pattern = labelPattern(label);
    return this.page
      .getByRole('combobox', { name: pattern })
      .or(
        this.page
          .locator(`.MuiFormControl-root:has-text("${label}")`)
          .locator('[role="combobox"], select')
      )
      .locator('visible=true')
      .first();
  }

  async selectOption(label: string, option: string) {
    const dd = this.dropdown(label);
    await dd.scrollIntoViewIfNeeded().catch(() => null);
    await dd.click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  async selectFirstOption(label: string) {
    const dd = this.dropdown(label);
    await dd.scrollIntoViewIfNeeded().catch(() => null);
    await dd.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible({ timeout: 5000 });

    const options = listbox.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 5000 });

    const count = await options.count();
    let target = options.first();
    for (let i = 0; i < count; i++) {
      const opt = options.nth(i);
      const text = (await opt.innerText()).trim();
      if (text && !/^(select|none|choose)$/i.test(text)) {
        target = opt;
        break;
      }
    }
    await target.click();
    await expect(listbox).toBeHidden({ timeout: 5000 }).catch(async () => {
      await this.page.keyboard.press('Escape').catch(() => null);
    });
  }

  async fillField(field: FieldSpec) {
    switch (field.kind) {
      case 'text':
      case 'textarea':
        await this.textbox(field.label).fill(String(field.value ?? ''));
        break;
      case 'select':
        if (typeof field.value === 'string') {
          await this.selectOption(field.label, field.value);
        } else {
          await this.selectFirstOption(field.label);
        }
        break;
    }
  }

  async fillFields(fields: FieldSpec[]) {
    const values = new Map<string, string>();
    for (const field of fields) {
      if (field.showWhen && values.get(field.showWhen.label) !== field.showWhen.equals) {
        continue;
      }
      await this.fillField(field);
      if (typeof field.value === 'string') {
        values.set(field.label, field.value);
      }
    }
  }

  async expectFieldValues(fields: FieldSpec[]) {
    for (const field of fields) {
      if (field.kind === 'text' || field.kind === 'textarea') {
        await expect(this.textbox(field.label), field.label).toHaveValue(String(field.value ?? ''));
      }
    }
  }

  /** Uploads test-data/fixtures/measure.png for the currently selected section. */
  async uploadMeasureImage(filePath: string = MEASURE_IMAGE_FIXTURE) {
    const input = this.page
      .getByLabel('Take photos or upload images')
      .or(
        this.page
          .locator('input[type="file"]')
          .filter({ has: this.page.locator('xpath=ancestor::*[.//text()[contains(., "Measure Images")]]') })
      )
      .or(this.page.locator('input[type="file"]'))
      .first();
    await input.setInputFiles(filePath);

    // If modal dialog pops up, confirm the upload by clicking Upload button
    const uploadDialog = this.page.getByRole('dialog');
    if (await uploadDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
      const modalUploadBtn = uploadDialog.getByRole('button', { name: 'Upload', exact: true });
      if (await modalUploadBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await modalUploadBtn.click();
        await uploadDialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
      }
    }
  }

  async saveChanges() {
    const isEnabled = await this.saveChangesButton.isEnabled({ timeout: 3000 }).catch(() => false);
    if (!isEnabled) {
      return;
    }

    await Promise.all([
      this.page
        .waitForResponse(
          (res) => ['POST', 'PUT', 'PATCH'].includes(res.request().method()) && res.ok(),
          { timeout: 20_000 },
        )
        .catch(() => null),
      this.saveChangesButton.click(),
    ]);

    await this.page
      .getByText(/Project updated successfully/i)
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => null);
  }

  /**
   * Selects the section, sets Is Auditable, fills the rest and uploads a
   * Measure Image when auditable, then saves.
   */
  async fillSection(
    section: InsulationSectionSpec,
    auditable: boolean,
    options: { save?: boolean } = { save: true },
  ) {
    await this.selectSection(section);
    const fields = insulationFields(section, auditable);
    await this.fillFields(fields);
    await this.expectFieldValues(fields);
    if (auditable) {
      await this.uploadMeasureImage();
    }
    if (options.save !== false) {
      await this.saveChanges();
    }
  }

  async goBackToProjectDetails() {
    if (this.page.url().includes('/project-details/')) {
      return;
    }
    const isVisible = await this.goBackToProjectDetailsLink.isVisible({ timeout: 2000 }).catch(() => false);
    if (isVisible) {
      await this.goBackToProjectDetailsLink.click().catch(() => null);
    }
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });
  }
}
