import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env (e.g. RETEAM_EMAIL, RETEAM_PASSWORD)
dotenv.config();

/**
 * Playwright Configuration for Checkly Synthetic Monitors
 * Configures the test runner specifically for local execution and debugging
 * of browser checks located in the __checks__ directory.
 */
export default defineConfig({
  /** Directory containing all synthetic monitor test files */
  testDir: './__checks__',

  /** Pattern matching browser check specifications */
  testMatch: /.*\.spec\.ts/,

  /** Global authentication setup hook that generates the storage state */
  globalSetup: './tests/auth.setup.ts',

  /** Maximum time in milliseconds a single check can run before timing out (30s) */
  timeout: 30_000,

  /** Default timeout for expect() assertions (10s) */
  expect: {
    timeout: 10_000,
  },

  /** Run checks sequentially to avoid session contention */
  fullyParallel: false,

  /** Console list reporter for concise test output */
  reporter: 'list',

  /** Shared settings across synthetic browser checks */
  use: {
    /** Target web application base URL */
    baseURL: 'https://dev.reteamenergy.com',

    /** Path to authenticated session state for instant logged-in runs */
    storageState: 'playwright/.auth/user.json',

    /** Standard desktop resolution for Checkly synthetic monitoring */
    viewport: { width: 1280, height: 720 },

    /** Default timeout for actions (clicks, fills) */
    actionTimeout: 15_000,

    /** Default navigation timeout for page redirects and initial loading */
    navigationTimeout: 30_000,

    /** Record traces on first retry for debugging failures */
    trace: 'on-first-retry',
  },

  /** Browser project configuration */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
