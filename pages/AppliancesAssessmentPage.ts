import { expect, Locator, Page } from '@playwright/test';
import {
  APPLIANCE_FIELDS,
  APPLIANCE_SECTIONS,
  ApplianceSection,
  FieldSpec,
} from '../test-data/assessment-tasks';

/**
 * The Appliances task screen: /assessment/<id>/task/appliances
 * Six section tabs, each with its own fields and one or more "Instance N" forms.
 */
export class AppliancesAssessmentPage {
  readonly pageDescription: Locator;
  readonly goBackToProjectDetailsLink: Locator;
  readonly addInstanceButton: Locator;

  constructor(private readonly page: Page) {
    this.pageDescription = page.getByText('Energy-efficient appliances and equipment upgrades');
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });

    // Icon-only "+" buttons. MUI icons expose data-testid="AddIcon" or img[src*="add"].
    // The top "+" adds a section, the bottom "+" adds another instance of the current section.
    this.addInstanceButton = page
      .getByRole('button')
      .filter({ has: page.locator('[data-testid="AddIcon"], img[src*="add"]') })
      .last();
  }

  // ---------- Page and tabs ----------

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

  async expectAllSectionTabsVisible() {
    for (const section of APPLIANCE_SECTIONS) {
      await expect(this.page.getByText(section, { exact: true }).first()).toBeVisible({ timeout: 15_000 });
    }
  }

  instanceHeading(section: ApplianceSection, instance = 1): Locator {
    return this.page.getByText(`${section} - Instance ${instance}`, { exact: true });
  }

  async selectSection(section: ApplianceSection) {
    await this.page.getByText(section, { exact: true }).first().click();
    await expect(this.instanceHeading(section, 1)).toBeVisible({ timeout: 10_000 });
  }

  // ---------- Field locators ----------
  // Every field repeats once per instance, so we index with .nth().

  /** Text input or textarea. Matches by label, role, or fallback placeholder. */
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

  async selectOption(label: string, option: string | RegExp, instance = 1) {
    await this.dropdown(label, instance).click();
    await this.page.getByRole('option', { name: option }).first().click();
  }

  /** Picks the first available option when the exact value doesn't matter. */
  async selectFirstOption(label: string, instance = 1) {
    await this.dropdown(label, instance).click();
    await this.page.getByRole('option').first().click();
  }

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

  async addInstance() {
    await this.addInstanceButton.scrollIntoViewIfNeeded().catch(() => null);
    await this.addInstanceButton.click();
  }

  // ---------- Section-level flows ----------

  async expectSectionFieldsVisible(section: ApplianceSection, instance = 1) {
    for (const field of APPLIANCE_FIELDS[section]) {
      await expect(
        this.fieldLocator(field, instance),
        `${section}: "${field.label}" should be visible`,
      ).toBeVisible({ timeout: 10_000 });
    }
  }

  /** Fills every field defined for the section in APPLIANCE_FIELDS. */
  async fillSectionFields(section: ApplianceSection, instance = 1) {
    for (const field of APPLIANCE_FIELDS[section]) {
      await this.fillField(field, instance);
    }
  }

  async fillSection(section: ApplianceSection, instance = 1) {
    await this.selectSection(section);
    await this.fillSectionFields(section, instance);
  }

  /** Checks text, textarea and checkbox values. Dropdowns are skipped. */
  async expectSectionValues(section: ApplianceSection, instance = 1) {
    for (const field of APPLIANCE_FIELDS[section]) {
      const locator = this.fieldLocator(field, instance);
      if (field.kind === 'text' || field.kind === 'textarea') {
        await expect(locator, `${section}: ${field.label}`).toHaveValue(String(field.value ?? ''));
      } else if (field.kind === 'checkbox') {
        if (field.value === false) {
          await expect(locator, `${section}: ${field.label}`).not.toBeChecked();
        } else {
          await expect(locator, `${section}: ${field.label}`).toBeChecked();
        }
      }
    }
  }

  async goBackToProjectDetails() {
    if (this.page.url().includes('/project-details/')) {
      return;
    }
    await this.goBackToProjectDetailsLink.click().catch(() => null);
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });
  }
}
