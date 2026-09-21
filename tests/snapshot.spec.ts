import { expect, test } from '@playwright/test';
import {
  AppliancesAssessmentPage,
  EnergyAssessmentPage,
  ProjectDetailsPage,
  ProjectListPage,
  SnapshotPage,
} from '../pages';
import { snapshotEdits } from '../test-data/snapshotData';
import { projectData } from '../test-data/projectData';

/**
 * Snapshot tab synchronization test suite.
 * Verifies that edits made in the Snapshot accordion view persist and sync to the respective source tabs:
 * 1. Customer Information edits sync to the Customer profile tab.
 * 2. Property Profile edits sync to the Property profile tab.
 * 3. Appliances edits sync to the Energy assessment -> Appliances task screen.
 *
 * Automatically runs against the project created by the script (or overridden by SNAPSHOT_PROJECT_ID).
 */
test.describe.serial('Snapshot tab syncs to the source tabs', () => {
  let projectDetailsPage: ProjectDetailsPage;
  let snapshot: SnapshotPage;

  // Before each test: navigate to the project, wait for details, and open Snapshot tab
  test.beforeEach(async ({ page }) => {
    const projectListPage = new ProjectListPage(page);
    projectDetailsPage = new ProjectDetailsPage(page);
    snapshot = new SnapshotPage(page);

    // Automatically resolve the project ID created by the test script, or fall back to projectData
    const savedProjectId = ProjectListPage.getSavedProjectId();
    const searchQuery = savedProjectId || `${projectData.firstName} ${projectData.lastName}`;
    const openTarget = savedProjectId || projectData.streetAddress;

    // Step 1: Navigate to home page
    await page.goto('/');
    await expect(page).toHaveURL('https://dev.reteamenergy.com/');

    // Step 2: Search for the project (using automatically captured ID or customer name)
    await projectListPage.searchProject(searchQuery);

    // Step 3: Open the matching project
    await projectListPage.openProject(openTarget);
    await projectDetailsPage.waitForPageReady();

    // Step 4: Switch to the Snapshot tab
    await projectDetailsPage.openSnapshot();
  });

  /**
   * Tests editing customer information on Snapshot and verifying on the Customer profile tab.
   */
  test('Customer Information -> Customer profile tab', async ({ page }) => {
    // Step 1: Expand Customer Information accordion
    await snapshot.expandSection('Customer Information');

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
