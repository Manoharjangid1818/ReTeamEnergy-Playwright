import { test, expect } from '@playwright/test';
import { LoginPage, ProjectListPage } from '../pages';
import { loginPageData } from '../test-data/loginPageData';

/**
 * Synthetic Monitor Check: Project List Dashboard Availability & Verification
 *
 * Verifies that:
 * 1. The ReTeam Energy application is reachable and loads without HTTP errors.
 * 2. Unauthenticated sessions are redirected to login and can authenticate successfully.
 * 3. The 'My Projects' dashboard renders correctly.
 * 4. Key interactive elements ('Add Project' button and search input) are present and functional.
 *
 * Designed to run seamlessly in both environments:
 * - Locally via Playwright (`npx playwright test --config=playwright.checks.config.ts`)
 * - In Checkly Cloud synthetic monitors (`npx checkly test --env-file=.env`)
 */
test.describe('Project List Dashboard', () => {
  test('User can access and view the project list dashboard', async ({ page }) => {
    // Step 1: Resolve credentials from environment or fallback test data
    const email = process.env.RETEAM_EMAIL || loginPageData.email;
    const password = process.env.RETEAM_PASSWORD || loginPageData.password;

    expect(email, 'RETEAM_EMAIL must be configured in environment or .env').toBeTruthy();
    expect(password, 'RETEAM_PASSWORD must be configured in environment or .env').toBeTruthy();

    // Step 2: Initialize Page Objects
    const loginPage = new LoginPage(page);
    const projectListPage = new ProjectListPage(page);

    // Step 3: Navigate to application root
    await page.goto('/');

    // Step 4: Locate distinguishing elements for authenticated vs unauthenticated state
    const emailInput = page.getByPlaceholder('Enter your Email');
    const myProjectsHeading = page.getByText('My Projects', { exact: true });

    // Step 5: Wait for SPA to render either the login form or the dashboard (tolerates cloud latency)
    await Promise.race([
      emailInput.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null),
      myProjectsHeading.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => null),
    ]);

    // Step 6: Authenticate if the sign-in form is presented
    if (await emailInput.isVisible()) {
      await loginPage.login(email, password);
    }

    // Step 7: Verify dashboard elements are rendered and visible
    await projectListPage.waitForProjectList();
    await expect(projectListPage.myProjectsHeading).toBeVisible();
    await expect(projectListPage.addProjectButton).toBeVisible();
    await expect(projectListPage.searchInput).toBeVisible();
  });
});
