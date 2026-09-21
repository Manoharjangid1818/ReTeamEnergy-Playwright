import { chromium, expect, type FullConfig } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { LoginPage } from '../pages/LoginPage';
import { testUser } from '../test-data/users';

/** File path where the authenticated browser storage state (cookies, local storage) is saved */
const storageStatePath = 'playwright/.auth/user.json';

/**
 * Checks whether an existing saved session is still valid.
 * Reads the JWT access token from cookies and checks its expiration timestamp.
 *
 * @param path Filepath to the saved storage state JSON
 * @returns boolean true if session exists and is valid for at least 5 more minutes, false otherwise
 */
function isSessionValid(path: string): boolean {
  try {
    // Return false if storage state file doesn't exist
    if (!existsSync(path)) return false;

    // Parse the storage state JSON
    const state = JSON.parse(readFileSync(path, 'utf-8'));

    // Find the access_token cookie
    const tokenCookie = state.cookies?.find((c: any) => c.name === 'access_token');
    if (!tokenCookie) return false;

    // Decode the JWT token payload (second segment of header.payload.signature)
    const parts = tokenCookie.value?.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Ensure token is valid for at least another 5 minutes
    return payload.exp && payload.exp * 1000 > Date.now() + 5 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Global authentication setup hook executed once before any tests run.
 * Checks for a valid session; if missing or expired, launches a headless browser,
 * logs in with credentials from .env, and saves the storage state for reuse.
 */
async function globalSetup(_config: FullConfig) {
  // Step 1: Reuse existing valid session if available
  if (isSessionValid(storageStatePath)) {
    return;
  }

  // Step 2: Validate that login credentials exist in environment variables
  if (!testUser.email || !testUser.password) {
    throw new Error(
      'Set RETEAM_EMAIL and RETEAM_PASSWORD in .env before running the tests.'
    );
  }

  // Step 3: Launch a temporary browser instance to perform login
  const browser = await chromium.launch();
  const page = await browser.newPage({
    baseURL: 'https://dev.reteamenergy.com',
  });

  // Step 4: Perform login via LoginPage object
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(testUser.email, testUser.password);
  await expect(page).toHaveURL('https://dev.reteamenergy.com/');

  // Step 5: Save cookies and local storage state to disk for reuse by all projects
  await page.context().storageState({ path: storageStatePath });

  // Step 6: Close temporary browser
  await browser.close();
}

export default globalSetup;
