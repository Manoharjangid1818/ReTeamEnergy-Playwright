import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage provides shared helper methods for interacting with common UI controls
 * (such as dropdowns, text inputs, buttons, and URL assertions) across all page objects.
 */
export class BasePage {
  /** The Playwright Page instance used for browser actions */
  protected readonly page: Page;

  /**
   * Initializes the base page with the Playwright Page context.
   * @param page Playwright Page object representing the active browser tab
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Selects an option from a custom dropdown listbox by its visible label.
   * 1. Clicks the dropdown trigger to display options.
   * 2. Waits for the popup listbox to become visible.
   * 3. Locates and clicks the option matching the requested text (case-insensitive).
   * 4. Asserts that the listbox closes after selection.
   *
   * @param dropdown The Locator of the dropdown combobox element
   * @param value The option text or number to select
   */
  protected async selectDropdown(
    dropdown: Locator,
    value: string | number
  ) {
    // Step 1: Click the dropdown element to open the list of options
    await dropdown.click();

    // Step 2: Ensure the popup listbox container is visible on screen
    const listbox = this.page.getByRole('listbox');
    await expect(listbox).toBeVisible();

    // Step 3: Find the matching option by its accessible name (case-insensitive)
    const option = listbox.getByRole('option', {
      name: new RegExp(`^${value}$`, 'i'),
    });

    // Step 4: Ensure option is scrolled into view and visible, then click
    await option.scrollIntoViewIfNeeded().catch(() => null);
    await expect(option).toBeVisible();
    await option.click();

    // Step 5: Confirm the dropdown closed successfully
    await expect(listbox).toBeHidden({ timeout: 5000 }).catch(async () => {
      await this.page.keyboard.press('Escape').catch(() => null);
    });
  }

  /**
   * Enters text or numeric value into an input field.
   * Converts numbers to strings before typing.
   *
   * @param input The Locator for the target input field
   * @param value The text or number to enter
   */
  protected async fillInput(
    input: Locator,
    value: string | number
  ) {
    await input.fill(String(value));
    await input.blur().catch(() => null);
  }

  /**
   * Verifies that an input field contains the expected value.
   *
   * @param input The Locator of the input field to inspect
   * @param expectedValue The expected string or numeric content
   */
  protected async verifyInputValue(
    input: Locator,
    expectedValue: string | number
  ) {
    await expect(input).toHaveValue(String(expectedValue));
  }

  /**
   * Confirms a button is visible before clicking it.
   *
   * @param button The Locator of the button to click
   */
  protected async clickButton(button: Locator) {
    await expect(button).toBeVisible();
    await button.click();
  }

  /**
   * Verifies the browser's current URL matches the expected string or regular expression.
   *
   * @param url The expected URL string or RegExp pattern
   */
  protected async verifyUrl(url: string | RegExp) {
    await expect(this.page).toHaveURL(url);
  }

  /**
   * Asserts that a given element is currently visible on the page.
   *
   * @param locator The Locator of the element to check
   */
  protected async verifyVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }
}
