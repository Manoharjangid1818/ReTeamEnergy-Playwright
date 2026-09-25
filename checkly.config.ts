import dotenv from 'dotenv'
import { defineConfig } from 'checkly'

dotenv.config()

const config = defineConfig({
  projectName: 'ReTeam Energy - Development',
  logicalId: 'reteam-energy-development-monitoring',
  checks: {
    activated: true,
    muted: false,
    frequency: 10,
    locations: ['ap-south-1', 'eu-west-1'],
    tags: ['reteam-energy', 'development', 'synthetic'],
    runtimeId: '2025.04',
    environmentVariables: [
      { key: 'RETEAM_BASE_URL', value: process.env.RETEAM_BASE_URL ?? 'https://dev.reteamenergy.com' },
      { key: 'RETEAM_EMAIL', value: process.env.RETEAM_EMAIL ?? '' },
      { key: 'RETEAM_PASSWORD', value: process.env.RETEAM_PASSWORD ?? '' },
    ],
    checkMatch: '**/__checks__/**/*.check.ts',
    browserChecks: {
      testMatch: '**/__checks__/**/*.spec.ts',
      playwrightConfig: {
        timeout: 60_000,
        use: {
          baseURL: process.env.RETEAM_BASE_URL ?? 'https://dev.reteamenergy.com',
          actionTimeout: 15_000,
          navigationTimeout: 30_000,
        },
      },
    },
  },
  cli: {
    runLocation: 'ap-south-1',
    reporters: ['list'],
    retries: 0,
    verbose: true,
  },
})

export default config
