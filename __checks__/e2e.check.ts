import { PlaywrightCheck, Frequency } from 'checkly/constructs'

new PlaywrightCheck('reteam-energy-e2e', {
  name: 'ReTeam Energy - Full E2E Test Suite (All 28 Tests)',
  playwrightConfigPath: '../playwright.config.ts',
  frequency: Frequency.EVERY_24H,
  environmentVariables: [
    { key: 'RETEAM_BASE_URL', value: process.env.RETEAM_BASE_URL ?? 'https://dev.reteamenergy.com' },
    { key: 'RETEAM_EMAIL', value: process.env.RETEAM_EMAIL ?? '' },
    { key: 'RETEAM_PASSWORD', value: process.env.RETEAM_PASSWORD ?? '' },
  ],
  include: ['fixtures/**'],
})
