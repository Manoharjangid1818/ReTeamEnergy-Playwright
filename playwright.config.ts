import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env (e.g. RETEAM_EMAIL, RETEAM_PASSWORD)
dotenv.config();

/**
 * Playwright Test Configuration
 * Configures the test runner, browser options, global authentication setup,
 * and project dependency chains.
 */
export default defineConfig({
  /** Directory containing all test files */
  testDir: './tests',

  /** One-time authentication script that signs in and creates the auth storage state file */
  globalSetup: './tests/auth.setup.ts',

  /** Maximum time in milliseconds a single test can run before timing out (60s) */
  timeout: 60_000,

  /** Default timeout for expect() assertions (15s) to tolerate cloud runner network latency */
  expect: {
    timeout: 15_000,
  },

  /** Pipeline runs sequentially on a single shared project instance */
  fullyParallel: false,
  workers: 1,

  /** Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /** Retry on CI (2 retries) and locally (1 retry for transient network resilience) */
  retries: process.env.CI ? 2 : 1,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  /** Shared settings across all projects */
  use: {
    /** Base URL used for all relative page navigation (page.goto('/')) */
    baseURL: 'https://dev.reteamenergy.com',

    /** Path to the saved authenticated session JSON created by globalSetup */
    storageState: 'playwright/.auth/user.json',

    /** Default timeout for each action like click or fill (15s) */
    actionTimeout: 15_000,

    /** Default navigation timeout for page.goto / redirects (30s) */
    navigationTimeout: 30_000,

    /** Record traces only when retrying a failed test to save disk space */
    trace: 'on-first-retry',
  },

  /**
   * Project pipeline with sequential dependency chaining:
   * 1. chromium: runs login.spec.ts (creates initial project)
   * 2. customer-profile: depends on chromium, adds customer profile
   * 3. property-profile: depends on customer-profile, adds property details
   * 4. energy-costs: depends on property-profile, adds fuel costs
   * 5. energy-assessment: depends on energy-costs, executes Air Sealing & Appliances tasks
   */
  projects: [
    // Step 1: Initial project creation
    {
      name: 'chromium',
      testMatch: /login\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Step 2: Customer Profile addition
    {
      name: 'customer-profile',
      testMatch: /customer-profile\.spec\.ts/,
      dependencies: ['chromium'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Step 3: Property Profile addition
    {
      name: 'property-profile',
      testMatch: /propertyProfile\.spec\.ts/,
      dependencies: ['customer-profile'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Step 4: Energy Costs addition
    {
      name: 'energy-costs',
      testMatch: /energyCosts\.spec\.ts/,
      dependencies: ['property-profile'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Step 5: Energy Assessment Kanban & Task tests
    {
      name: 'energy-assessment',
      testMatch: /energyAssessment\.spec\.ts/,
      dependencies: ['energy-costs'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Step 6: Required Measures (completes prerequisite measures for Snapshot validation)
    {
      name: 'required-measures',
      testMatch: /requiredMeasures\.spec\.ts/,
      dependencies: ['energy-assessment'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Step 7: Snapshot tab synchronization tests (runs on the project created by the script)
    {
      name: 'snapshot',
      testMatch: /snapshot\.spec\.ts/,
      dependencies: ['required-measures'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
