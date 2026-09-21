import { Page, expect } from '@playwright/test';

/**
 * Component object representing the application's top navigation bar / header.
 * Handles profile menu actions such as logging out of the application.
 */
export class Header {
  /**
   * Initializes the Header component with the active Page instance.
   * @param page Playwright Page instance
   */
  constructor(private page: Page) {}

  /**
   * Logs out of the application.
   * 1. Clicks the user avatar icon in the top right to open the profile menu.
   * 2. Clicks the 'Logout' button in the opened menu.
   * 3. Verifies that the browser is redirected back to the sign-in page.
   */
  async logout() {
    // Step 1: Click the avatar dropdown button in the header
    await this.page.getByRole('button').filter({
      has: this.page.locator('.MuiAvatar-root'),
    }).click();

    // Step 2: Click the 'Logout' menu option
    await this.page.getByRole('button', { name: 'Logout' }).click();

    // Step 3: Verify the browser redirects to the sign-in page
    await expect(this.page).toHaveURL(
      'https://dev.reteamenergy.com/sign-in'
    );
  }
}