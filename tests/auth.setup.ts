import { chromium, expect, type FullConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { LoginPage } from '../pages/LoginPage';
import { testUser } from '../test-data/users';

const storageStatePath = 'playwright/.auth/user.json';

/** Signs in once and saves the browser state for every test project. */
async function globalSetup(_config: FullConfig) {
  // Reuse an existing valid session. Delete this file to force a new login.
  if (existsSync(storageStatePath)) {
    return;
  }

  if (!testUser.email || !testUser.password) {
    throw new Error(
      'Set RETEAM_EMAIL and RETEAM_PASSWORD in .env before running the tests.'
    );
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    baseURL: 'https://dev.reteamenergy.com',
  });

  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(testUser.email, testUser.password);
  await expect(page).toHaveURL('https://dev.reteamenergy.com/');

  await page.context().storageState({ path: storageStatePath });
  await browser.close();
}

export default globalSetup;
