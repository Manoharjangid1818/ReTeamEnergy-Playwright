import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  AppliancesAssessmentPage,
  EnergyAssessmentPage,
  ProjectDetailsPage,
  ProjectListPage,
  SnapshotPage,
} from '../pages';
import { snapshotEdits } from '../test-data/snapshotData';

const projectFile = path.resolve('playwright/.auth/createdProject.json');

/**
 * Snapshot tab synchronization test suite.
 * Verifies that edits made in the Snapshot accordion view persist and sync to the respective source tabs:
 * 1. Customer Information edits sync to the Customer profile tab.
 * 2. Property Profile edits sync to the Property profile tab.
 * 3. Appliances edits sync to the Energy assessment -> Appliances task screen.
 *
 * Runs only as the final step of the chain using the project created by login.spec.ts.
 */
test.describe('Snapshot tab syncs to the source tabs', () => {
  // Use mode: 'default' so individual test failures do not abort subsequent tests
  test.describe.configure({ mode: 'default' });

  let projectName: string;
  let projectDetailsPage: ProjectDetailsPage;
  let snapshot: SnapshotPage;

  test.beforeAll(() => {
    if (!fs.existsSync(projectFile)) {
      throw new Error(
        "Snapshot needs the project created by login.spec.ts. Run the full chain with `npx playwright test` (don't run tests/snapshot.spec.ts alone or with --no-deps)."
      );
    }

    try {
      const data = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
      if (!data?.id || !data?.name) {
        throw new Error();
      }
      projectName = data.name;
    } catch {
      throw new Error(
        "Snapshot needs the project created by login.spec.ts. Run the full chain with `npx playwright test` (don't run tests/snapshot.spec.ts alone or with --no-deps)."
      );
    }
  });

  // Before each test: navigate to the project, wait for details, and open Snapshot tab
  test.beforeEach(async ({ page }) => {
    const projectListPage = new ProjectListPage(page);
    projectDetailsPage = new ProjectDetailsPage(page);
    snapshot = new SnapshotPage(page);

    // Step 1: Navigate to home page
    await page.goto('/');
    await expect(page).toHaveURL('https://dev.reteamenergy.com/');

    // Step 2: Search for the project by name
    await projectListPage.searchProject(projectName);

    // Step 3: Open the matching project from search results
    await projectListPage.openProject(projectName);
    await projectDetailsPage.waitForPageReady();
    await expect(page).toHaveURL(/project-details/);

    // Step 4: Switch to the Snapshot tab
    await projectDetailsPage.openSnapshot();
  });

  /**
   * Tests editing customer information on Snapshot and verifying on the Customer profile tab.
   * Note: No First Name or Last Name edits are performed to preserve project searchability.
   */
  test('Customer Information -> Customer profile tab', async ({ page }) => {
    // Step 1: Expand Customer Profile accordion
    await snapshot.expandSection('Customer Profile');

    // Step 2: Change fields and collect written values
    const written = await snapshot.changeFields(snapshotEdits.customerInformation);

    // Step 3: Save changes and reload page to test persistence
    await snapshot.saveAll();
    await page.reload();
    await projectDetailsPage.waitForPageReady();

    // Step 4: Open Customer Profile tab and verify updated values
    await projectDetailsPage.openCustomerProfile();
    await snapshot.expectProfileValues(written);
  });

  /**
   * Tests editing property details on Snapshot and verifying on the Property profile tab.
   */
  test('Property Profile -> Property profile tab', async ({ page }) => {
    // Step 1: Expand Property Profile accordion
    await snapshot.expandSection('Property Profile');

    // Step 2: Change fields and collect written values
    const written = await snapshot.changeFields(snapshotEdits.propertyProfile);

    // Step 3: Save changes and reload page to test persistence
    await snapshot.saveAll();
    await page.reload();
    await projectDetailsPage.waitForPageReady();

    // Step 4: Open Property Profile tab and verify updated values
    await projectDetailsPage.openPropertyProfile();
    await snapshot.expectProfileValues(written);
  });

  /**
   * Tests editing appliance fields on Snapshot and verifying on the Appliances assessment task screen.
   */
  test('Appliances -> Energy assessment / Appliances task', async ({ page }) => {
    // Step 1: Expand Appliances accordion
    await snapshot.expandSection('Appliances');

    // Step 2: Change appliance fields across tabs and collect written values
    const written = await snapshot.changeApplianceFields(snapshotEdits.appliances);

    // Step 3: Save changes and reload page to test persistence
    await snapshot.saveAll();
    await page.reload();
    await projectDetailsPage.waitForPageReady();

    // Step 4: Navigate to Energy Assessment Kanban board and open Appliances task
    const board = new EnergyAssessmentPage(page);
    await board.open();
    await board.openTask('Appliances');

    // Step 5: Verify each written field in its respective section tab
    const appliances = new AppliancesAssessmentPage(page);
    await appliances.expectLoaded();

    for (const { section, label, value } of written) {
      await appliances.selectSection(section);
      await expect(appliances.textbox(label), `${section} / ${label}`).toHaveValue(value);
    }
  });
});
