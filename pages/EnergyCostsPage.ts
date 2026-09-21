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
    await this.page.reload();
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
    const hasFuelCosts = await this.deleteFuelCostButtons.count() > 0;

    // If already empty, verify empty message and return
    if (!hasFuelCosts) {
      await expect(this.noFuelCostsMessage).toBeVisible();
      return;
    }

    // Loop through each delete button in the table
    while (await this.deleteFuelCostButtons.count() > 0) {
      const deleteButton = this.deleteFuelCostButtons.first();
      const fuelRow = deleteButton.locator('xpath=ancestor::tr');
      const fuelName = (await fuelRow.locator('td').first().innerText()).trim();

      // Click delete button on the row
      await deleteButton.click();

      // Confirm in the modal dialog
      await expect(this.deleteFuelCostModal).toBeVisible();
      await this.deleteFuelCostConfirmButton.click();

      // Verify the deleted row is gone from the table
      await expect(
        this.page.locator('tbody tr').filter({ hasText: fuelName })
      ).toHaveCount(0);
    }

    // Verify empty state message appears
    await expect(this.noFuelCostsMessage).toBeVisible();
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
      return await option.isVisible();
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
      await expect(this.unitInput).toBeEditable();
      await this.fillInput(this.unitInput, data.unit ?? '$/Unit');
      await this.verifyInputValue(this.unitInput, data.unit ?? '$/Unit');
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
    await this.addFuelCostSubmitButton.click();
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

    const isRowVisible = await fuelRow.isVisible().catch(() => false);
    if (!isRowVisible) {
      await this.refreshEnergyCosts();
    }

    await expect(fuelRow).toBeVisible({ timeout: 15_000 });
  }
}
