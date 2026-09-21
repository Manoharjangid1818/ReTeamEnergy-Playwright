import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/auth.setup.ts',
  timeout: 60_000,

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: 'https://dev.reteamenergy.com',
    storageState: 'playwright/.auth/user.json',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      testMatch: /login\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'customer-profile',
      testMatch: /customer-profile\.spec\.ts/,
      dependencies: ['chromium'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'property-profile',
      testMatch: /propertyProfile\.spec\.ts/,
      dependencies: ['customer-profile'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'energy-costs',
      testMatch: /energyCosts\.spec\.ts/,
      dependencies:['property-profile'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'energy-assessment',
      testMatch: /energyAssessment\.spec\.ts/,
      dependencies: ['energy-costs'],
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
