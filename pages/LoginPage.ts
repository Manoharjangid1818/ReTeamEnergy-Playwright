import { Page, Locator, expect } from '@playwright/test';
import { appRoutes } from '../test-data/commonTestData';

/**
 * Page object representing the user login screen (/sign-in).
 * Handles entering user credentials, submitting the form, and confirming authentication.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  /**
   * Initializes locators for all elements on the login page.
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Email input field identified by its placeholder text
    this.emailInput = page.getByPlaceholder('Enter your Email');

    // Password input field identified by its placeholder text
    this.passwordInput = page.getByPlaceholder('Enter your Password');

    // Submit button identified by role and name
    this.loginButton = page.getByRole('button', { name: 'login' });
  }

  /**
   * Navigates directly to the application sign-in page.
   */
  async open() {
    await this.page.goto(appRoutes.signIn);
  }

  /**
   * Logs in with the provided email and password, then verifies successful authentication.
   * 1. Types email into the email input field.
   * 2. Types password into the password input field.
   * 3. Clicks the login button.
   * 4. Asserts that the 'My Projects' heading appears, indicating successful login.
   *
   * @param email User email address
   * @param password User account password
   */
  async login(email: string, password: string) {
    // Step 1: Fill credentials
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Step 2: Click login button to authenticate
    await this.loginButton.click();

    // Step 3: Verify successful redirect by ensuring 'My Projects' heading is visible
    await expect(
      this.page.getByText('My Projects', { exact: true })
    ).toBeVisible();
  }
}
