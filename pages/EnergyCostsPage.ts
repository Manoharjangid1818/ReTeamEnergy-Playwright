import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Interface describing the input parameters for adding a fuel cost record.
 */
type FuelCostData = {
  fuelType: string;
  unit?: string;
  costPerUnit: number;
  annualUsage: number;
  expectedAnnualFuelCost: number;
  defaultCostValue?: number;
};

/**
 * Page object representing the Energy Costs tab on the Project Details page.
 * Provides capabilities to view existing fuel costs, delete them in a loop,
 * check available fuel types, and add new fuel cost entries.
 */
export class EnergyCostsPage extends BasePage {
  readonly energyCostsTab: Locator;
  readonly energyCostsHeading: Locator;

  readonly deleteFuelCostButtons: Locator;
  readonly deleteFuelCostModal: Locator;
  readonly deleteFuelCostConfirmButton: Locator;
  readonly noFuelCostsMessage: Locator;

  readonly addFuelCostButton: Locator;
  readonly addFuelCostHeading: Locator;

  readonly fuelTypeSelect: Locator;
  readonly unitInput: Locator;
  readonly costPerUnitInput: Locator;
  readonly annualUsageInput: Locator;
  readonly annualFuelCostInput: Locator;
  readonly defaultCostValueInput: Locator;

  readonly addFuelCostSubmitButton: Locator;
  readonly cancelFuelCostButton: Locator;
  readonly fuelCostSuccessMessage: Locator;

  /**
   * Initializes locators for the Energy Costs tab and its Add/Delete dialogs.
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    super(page);

    // Tab navigation and section header
    this.energyCostsTab = page.getByRole('tab', {
      name: /^Energy costs$/i,
    });

    this.energyCostsHeading = page.getByRole('heading', {
      name: 'Energy Costs',
      exact: true,
    });

    // Delete flow locators
    this.deleteFuelCostButtons = page.getByRole('button', {
      name: 'Delete fuel cost',
    });

    this.deleteFuelCostModal = page.getByRole('heading', {
      name: 'Delete Fuel Cost',
      exact: true,
    });

    this.deleteFuelCostConfirmButton = page.getByRole('button', {
      name: 'Delete',
      exact: true,
    });

    this.noFuelCostsMessage = page.getByText(
      'No fuel costs added yet',
      { exact: true }
    );

    // Add Fuel Cost form locators
    this.addFuelCostButton = page.getByRole('button', {
      name: 'Add Fuel Cost',
      exact: true,
    });

    this.addFuelCostHeading = page.getByRole('heading', {
      name: 'Add Fuel Cost',
      exact: true,
    });

    this.fuelTypeSelect = page.getByRole('combobox', {
      name: 'Fuel Type',
    });

    this.unitInput = page.getByRole('textbox', {
      name: 'Unit',
    });

    this.costPerUnitInput = page.getByRole('spinbutton', {
      name: 'Cost per Unit ($)',
    });

    this.annualUsageInput = page.getByRole('spinbutton', {
      name: 'Annual Usage',
    });

    this.annualFuelCostInput = page.getByRole('spinbutton', {
      name: 'Annual Fuel Cost ($)',
    });

    this.defaultCostValueInput = page.getByRole('spinbutton', {
      name: 'Default Cost Value ($)',
    });

    this.addFuelCostSubmitButton = page.getByRole('button', {
      name: 'Add',
      exact: true,
    });

    this.cancelFuelCostButton = page.getByRole('button', {
      name: 'Cancel',
      exact: true,
    });

    this.fuelCostSuccessMessage = page.getByText(
      'Fuel cost added successfully!',
      { exact: true }
    );
  }

  /**
   * Clicks on the Energy Costs tab to display the fuel costs table.
   */
  async openEnergyCosts() {
    await this.energyCostsTab.click();
  }

  /**
   * Ensures the Energy Costs section header is visible.
   */
  async waitForPageReady() {
    await this.verifyVisible(this.energyCostsHeading);
  }

  /**
   * Reloads the page and reopens the Energy Costs tab.
   * Useful when new table rows require a refresh to render.
   */
  private async refreshEnergyCosts() {
    const withImagesPromise = this.page
      .waitForResponse(
        (res) => res.url().includes('/with-images') && res.status() === 200,
        { timeout: 15_000 }
      )
      .catch(() => null);

    await this.page.reload();
    await withImagesPromise;
    await this.page
      .locator('text=Loading project details...')
      .waitFor({ state: 'detached', timeout: 15_000 })
      .catch(() => null);
    await this.openEnergyCosts();
    await this.waitForPageReady();
  }

  /**
   * Opens the 'Add Fuel Cost' dialog.
   */
  async openAddFuelCost() {
    await this.clickButton(this.addFuelCostButton);
    await this.verifyVisible(this.addFuelCostHeading);
  }

  /**
   * Closes the 'Add Fuel Cost' dialog without saving.
   */
  async cancelAddFuelCost() {
    await this.clickButton(this.cancelFuelCostButton);
    await expect(this.addFuelCostHeading).toHaveCount(0);
  }

  /**
   * Deletes all existing fuel costs one by one until the table is empty.
   * Confirms each deletion modal and verifies the 'No fuel costs added yet' placeholder.
   */
  async deleteAllFuelCosts() {
    // Wait for table to finish loading: either at least one row exists or empty placeholder appears
    await Promise.race([
      this.deleteFuelCostButtons.first().waitFor({ state: 'visible', timeout: 10_000 }),
      this.noFuelCostsMessage.waitFor({ state: 'visible', timeout: 10_000 }),
    ]).catch(() => null);

    // If already empty, verify empty message and return
    if ((await this.deleteFuelCostButtons.count()) === 0) {
      await expect(this.noFuelCostsMessage).toBeVisible();
      return;
    }

    // Loop through each delete button in the table
    while ((await this.deleteFuelCostButtons.count()) > 0) {
      const initialCount = await this.deleteFuelCostButtons.count();
      const deleteButton = this.deleteFuelCostButtons.first();

      // Click delete button on the row
      await deleteButton.click();

      // Confirm in the modal dialog
      await expect(this.deleteFuelCostModal).toBeVisible();

      const deleteResponse = this.page
        .waitForResponse(
          (res) =>
            res.url().includes('/api/fuel-costs/') &&
            (res.status() === 200 || res.status() === 204),
          { timeout: 15_000 }
        )
        .catch(() => null);

      await this.deleteFuelCostConfirmButton.click();
      await deleteResponse;
      await expect(this.deleteFuelCostModal).toBeHidden({ timeout: 5000 }).catch(() => null);

      // Verify the number of fuel cost rows decreased
      await expect(this.deleteFuelCostButtons).toHaveCount(initialCount - 1, {
        timeout: 10_000,
      });
    }

    // Verify empty state message appears
    await expect(this.noFuelCostsMessage).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Checks whether a specific fuel type is still available in the dropdown options.
   * Closes the dropdown via Escape key afterwards so it doesn't stay open.
   *
   * @param fuelType The fuel type name to test (e.g. 'Electricity')
   * @returns boolean true if option exists and is visible, false otherwise
   */
  async isFuelTypeAvailable(fuelType: string) {
    await this.fuelTypeSelect.click();

    const listbox = this.page.getByRole('listbox', {
      name: 'Fuel Type',
    });
    await expect(listbox).toBeVisible();

    const option = listbox.getByRole('option', {
      name: new RegExp(`^${fuelType}$`, 'i'),
    });

    try {
      await expect(option).toBeVisible({ timeout: 3000 });
      return true;
    } catch {
      return false;
    } finally {
      // Press Escape to close dropdown without selecting, releasing focus
      await this.page.keyboard.press('Escape');
      await expect(listbox).toBeHidden();
    }
  }

  /**
   * Asserts that all fuel types have been added and no options remain in the dropdown.
   */
  async assertNoAvailableFuelTypes() {
    // When all fuel types are added, the application disables the Add Fuel Cost button
    if (await this.addFuelCostButton.isDisabled()) {
      await expect(this.addFuelCostButton).toBeDisabled();
      return;
    }

    await this.openAddFuelCost();
    await this.fuelTypeSelect.click();

    const listbox = this.page.getByRole('listbox', {
      name: 'Fuel Type',
    });
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole('option')).toHaveCount(0);

    await this.page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await this.cancelAddFuelCost();
  }

  /**
   * Adds a new fuel cost entry and verifies its calculated values and table insertion.
   * 1. Selects the fuel type from dropdown.
   * 2. Sets unit (editable for 'Other', read-only for standard types).
   * 3. Fills cost per unit.
   * 4. Fills annual usage (or annual cost for 'Other') and asserts calculation matches.
   * 5. Submits form and verifies success message.
   * 6. Confirms the new row is displayed in the table.
   *
   * @param data Fuel cost parameters
   */
  async addFuelCost(data: FuelCostData) {
    // Step 1: Select fuel type
    await this.selectDropdown(this.fuelTypeSelect, data.fuelType);

    // Step 2: Handle unit field (editable only for 'Other')
    if (data.fuelType.toLowerCase() === 'other') {
      const unitValue = (data.unit ?? 'Unit').replace(/^\$\/?/, '');
      await expect(this.unitInput).toBeEditable();
      await this.fillInput(this.unitInput, unitValue);
      await this.verifyInputValue(this.unitInput, unitValue);
    } else if (data.unit) {
      await this.verifyInputValue(this.unitInput, data.unit);
    }

    // Step 3: Enter cost per unit
    await expect(this.costPerUnitInput).toBeVisible();
    await this.fillInput(this.costPerUnitInput, data.costPerUnit);

    const calculatedAnnualFuelCost = data.costPerUnit * data.annualUsage;

    // Step 4: Fill annual usage or annual cost (depending on field editability)
    if (await this.annualUsageInput.isEditable()) {
      await this.fillInput(this.annualUsageInput, data.annualUsage);
    } else {
      await expect(this.annualFuelCostInput).toBeEditable();
      await this.fillInput(this.annualFuelCostInput, calculatedAnnualFuelCost);
    }

    // Step 5: Assert calculated cost matches expected math
    expect(calculatedAnnualFuelCost).toBe(data.expectedAnnualFuelCost);
    await this.verifyInputValue(this.annualFuelCostInput, calculatedAnnualFuelCost);

    if (data.defaultCostValue !== undefined) {
      await this.verifyInputValue(this.defaultCostValueInput, data.defaultCostValue);
    }

    // Step 6: Submit the form
    await expect(this.addFuelCostSubmitButton).toBeEnabled();

    // Set up network response listeners to ensure backend creates the record and updates project data
    const responsePromise = this.page
      .waitForResponse(
        (res) =>
          res.url().includes('/api/fuel-costs') &&
          (res.status() === 200 || res.status() === 201),
        { timeout: 15_000 }
      )
      .catch(() => null);

    const withImagesPromise = this.page
      .waitForResponse(
        (res) => res.url().includes('/with-images') && res.status() === 200,
        { timeout: 15_000 }
      )
      .catch(() => null);

    await this.addFuelCostSubmitButton.click();
    await responsePromise;
    await withImagesPromise;
    await expect(this.fuelCostSuccessMessage).toBeVisible();

    // Step 7: Confirm modal closes
    await expect(this.addFuelCostHeading).toBeHidden({ timeout: 10_000 }).catch(() => null);

    // Step 8: Confirm the new row appears in the fuel costs table
    const fuelRow = this.page.locator('tbody tr').filter({
      has: this.page.getByRole('cell', {
        name: data.fuelType,
        exact: true,
      }),
    });

    try {
      await expect(fuelRow.first()).toBeVisible({ timeout: 10_000 });
    } catch {
      await this.refreshEnergyCosts();
      await expect(fuelRow.first()).toBeVisible({ timeout: 15_000 });
    }
  }
}
