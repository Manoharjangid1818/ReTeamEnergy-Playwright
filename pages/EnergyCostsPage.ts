import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

type FuelCostData = {
  fuelType: string;
  unit?: string;
  costPerUnit: number;
  annualUsage: number;
  expectedAnnualFuelCost: number;
  defaultCostValue?: number;
};

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

  constructor(page: Page) {
    super(page);

    this.energyCostsTab = page.getByRole('tab', {
      name: /^Energy costs$/i,
    });

    this.energyCostsHeading = page.getByRole('heading', {
      name: 'Energy Costs',
      exact: true,
    });

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

  async openEnergyCosts() {
    await this.energyCostsTab.click();
  }

  async waitForPageReady() {
    await this.verifyVisible(this.energyCostsHeading);
  }

  private async refreshEnergyCosts() {
    await this.page.reload();
    await this.openEnergyCosts();
    await this.waitForPageReady();
  }

  async openAddFuelCost() {
    await this.clickButton(this.addFuelCostButton);
    await this.verifyVisible(this.addFuelCostHeading);
  }

  async cancelAddFuelCost() {
    await this.clickButton(this.cancelFuelCostButton);
    await expect(this.addFuelCostHeading).toHaveCount(0);
  }

  async deleteAllFuelCosts() {
    const hasFuelCosts =
      await this.deleteFuelCostButtons.count() > 0;

    if (!hasFuelCosts) {
      await expect(this.noFuelCostsMessage).toBeVisible();
      return;
    }

    while (await this.deleteFuelCostButtons.count() > 0) {
      const deleteButton =
        this.deleteFuelCostButtons.first();

      const fuelRow =
        deleteButton.locator('xpath=ancestor::tr');

      const fuelName = (
        await fuelRow.locator('td').first().innerText()
      ).trim();

      await deleteButton.click();

      await expect(
        this.deleteFuelCostModal
      ).toBeVisible();

      await this.deleteFuelCostConfirmButton.click();

      await expect(
        this.page.locator('tbody tr').filter({
          hasText: fuelName,
        })
      ).toHaveCount(0);
    }

    await expect(
      this.noFuelCostsMessage
    ).toBeVisible();
  }

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
      // The open MUI listbox owns focus. This avoids re-resolving a combobox
      // that can be re-rendered without its accessible name.
      await this.page.keyboard.press('Escape');
      await expect(listbox).toBeHidden();
    }
  }

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

  async addFuelCost(data: FuelCostData) {
    await this.selectDropdown(
        this.fuelTypeSelect,
        data.fuelType
    );

    // Other has an editable Unit field.
    // All other fuel types have an auto-filled Unit.
    if (data.fuelType.toLowerCase() === 'other') {
        await expect(this.unitInput).toBeEditable();

        await this.fillInput(
        this.unitInput,
        data.unit ?? '$/Unit'
        );

        await this.verifyInputValue(
        this.unitInput,
        data.unit ?? '$/Unit'
        );
    } else if (data.unit) {
        await this.verifyInputValue(
        this.unitInput,
        data.unit
        );
    }

    await expect(
        this.costPerUnitInput
    ).toBeVisible();

    await this.fillInput(
        this.costPerUnitInput,
        data.costPerUnit
    );

    const calculatedAnnualFuelCost =
        data.costPerUnit * data.annualUsage;

    // Most fuel types accept Annual Usage and calculate the annual cost. The
    // "Other" type makes Annual Usage read-only, so enter the equivalent
    // annual cost through the editable field instead.
    if (await this.annualUsageInput.isEditable()) {
      await this.fillInput(
        this.annualUsageInput,
        data.annualUsage
      );
    } else {
      await expect(this.annualFuelCostInput).toBeEditable();
      await this.fillInput(
        this.annualFuelCostInput,
        calculatedAnnualFuelCost
      );
    }

    expect(
        calculatedAnnualFuelCost
    ).toBe(data.expectedAnnualFuelCost);

    await this.verifyInputValue(
        this.annualFuelCostInput,
        calculatedAnnualFuelCost
    );

    if (data.defaultCostValue !== undefined) {
      await this.verifyInputValue(
        this.defaultCostValueInput,
        data.defaultCostValue
      );
    }

    await expect(this.addFuelCostSubmitButton).toBeEnabled();
    await this.addFuelCostSubmitButton.click();
    await expect(this.fuelCostSuccessMessage).toBeVisible();

    await expect(this.addFuelCostHeading).toBeHidden({ timeout: 10_000 }).catch(() => null);

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
