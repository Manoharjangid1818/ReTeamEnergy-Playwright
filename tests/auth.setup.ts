import { chromium, expect, type FullConfig } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { LoginPage } from '../pages/LoginPage';
import { testUser } from '../test-data/users';

const storageStatePath = 'playwright/.auth/user.json';

function isSessionValid(path: string): boolean {
  try {
    if (!existsSync(path)) return false;
    const state = JSON.parse(readFileSync(path, 'utf-8'));
    const tokenCookie = state.cookies?.find((c: any) => c.name === 'access_token');
    if (!tokenCookie) return false;
    const parts = tokenCookie.value?.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    // Ensure token is valid for at least another 5 minutes
    return payload.exp && payload.exp * 1000 > Date.now() + 5 * 60 * 1000;
  } catch {
    return false;
  }
}

/** Signs in once and saves the browser state for every test project. */
async function globalSetup(_config: FullConfig) {
  // Reuse an existing valid session. If expired or missing, sign in again.
  if (isSessionValid(storageStatePath)) {
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
