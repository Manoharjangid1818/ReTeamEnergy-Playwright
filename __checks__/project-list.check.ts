import { BrowserCheck, Frequency } from 'checkly/constructs';

/**
 * Checkly Synthetic Browser Check: Project List Dashboard
 *
 * Continuously validates:
 * - Authenticated user access to the project dashboard (/ or /projects)
 * - 'My Projects' heading and dashboard metrics rendering
 * - 'Add Project' action button availability
 * - Project search input availability
 *
 * Runs every 10 minutes from US East and EU Central data centers.
 */
export const projectListCheck = new BrowserCheck('project-list-browser-check', {
  name: 'ReTeam Energy - Project List Dashboard',
  frequency: Frequency.EVERY_10M,
  locations: ['us-east-1', 'eu-central-1'],
  tags: ['production', 'dashboard'],
  code: {
    entrypoint: './project-list.spec.ts',
  },
});
