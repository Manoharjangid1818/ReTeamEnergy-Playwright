import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Select value from dropdown
  protected async selectDropdown(
    dropdown: Locator,
    value: string | number
  ) {
    await dropdown.click();

    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    const option = listbox.getByRole('option', {
      name: new RegExp(`^${value}$`, 'i'),
    });

    await expect(option).toBeVisible();
    await option.click();
    await expect(listbox).toBeHidden();
  }

  // Fill input field
  protected async fillInput(
    input: Locator,
    value: string | number
  ) {
    await input.fill(String(value));
  }

  // Verify input field value
  protected async verifyInputValue(
    input: Locator,
    expectedValue: string | number
  ) {
    await expect(input).toHaveValue(String(expectedValue));
  }

  // Click button
  protected async clickButton(button: Locator) {
    await expect(button).toBeVisible();
    await button.click();
  }

  // Verify URL
  protected async verifyUrl(url: string | RegExp) {
    await expect(this.page).toHaveURL(url);
  }

  // Verify element is visible
  protected async verifyVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }
}
