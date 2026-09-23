import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  AppliancesAssessmentPage,
  AssessmentTaskPage,
  EnergyAssessmentPage,
  ProjectDetailsPage,
  ProjectListPage,
  SnapshotPage,
} from '../pages';

const projectFile = path.resolve('playwright/.auth/createdProject.json');
const fixturePath = path.resolve('test-data/fixtures/measure.png');

/**
 * Required Measures test suite (project: 'required-measures').
 * Completes all prerequisite measures and uploads required fixture images
 * via the Energy Assessment task screens so that Snapshot's 'Save All' validation passes.
 */
test.describe.serial('Required Measures - Complete prerequisite tasks for Snapshot', () => {
  let projectName: string;
  let projectDetailsPage: ProjectDetailsPage;
  let board: EnergyAssessmentPage;

  test.beforeAll(() => {
    if (!fs.existsSync(projectFile)) {
      throw new Error(
        "Required Measures needs the project created by login.spec.ts. Run the full chain with `npx playwright test`."
      );
    }

    try {
      const data = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
      if (!data?.name) {
        throw new Error();
      }
      projectName = data.name;
    } catch {
      throw new Error(
        "Required Measures needs the project created by login.spec.ts. Run the full chain with `npx playwright test`."
      );
    }
  });

  test.beforeEach(async ({ page }) => {
    const projectListPage = new ProjectListPage(page);
    projectDetailsPage = new ProjectDetailsPage(page);
    board = new EnergyAssessmentPage(page);

    // Step 1: Navigate to home page
    await page.goto('/');
    await expect(page).toHaveURL('https://dev.reteamenergy.com/');

    // Step 2: Search and open target project by name
    await projectListPage.searchProject(projectName);
    await projectListPage.openProject(projectName);
    await projectDetailsPage.waitForPageReady();
    await expect(page).toHaveURL(/project-details/);

    // Step 3: Open Energy Assessment board
    await board.open();
  });

  /**
   * Completes required fields for Refrigerator and Clothes Dryer.
   * Persists them with Save Changes so the backend retains them for Snapshot validation.
   */
  test('Complete required Appliance fields (Refrigerator and Clothes Dryer)', async ({ page }) => {
    const appliances = new AppliancesAssessmentPage(page);
    await board.openTask('Appliances');
    await appliances.expectLoaded();

    // Clothes Dryer required field: Dryer Type (filled first to prevent missing required field errors)
    await appliances.selectSection('Clothes Dryer');
    await appliances.selectFirstOption('Dryer Type');

    // Refrigerator required fields for Eversource: Unit Age, Usage, Equipment Owner, Upgrade Recommended, Input Watts
    await appliances.selectSection('Refrigerator', { saveOnSwitch: true });
    await appliances.textbox('Unit Age').fill('12');
    await appliances.textbox('Input Watts').fill('150');
    await appliances.selectFirstOption('Usage');
    await appliances.selectFirstOption('Equipment Owner');
    await appliances.selectFirstOption('Upgrade Recommended');

    // Save Appliance changes to persist to backend
    await appliances.saveChanges();
    await appliances.goBackToProjectDetails();
  });

  /**
   * Completes required Windows field: Window Type.
   */
  test('Complete required Windows fields (Window Type)', async ({ page }) => {
    const task = new AssessmentTaskPage(page);
    await board.openTask('Windows');

    await task.selectDropdownOption('Window Type', 'Double Pane');
    await task.saveChanges();
    await task.goBackToProjectDetails();
  });

  /**
   * Uploads required measure photo for Attic Ventilation (Attic - Open).
   */
  test('Upload required measure image for Attic Ventilation (Attic - Open)', async ({ page }) => {
    const task = new AssessmentTaskPage(page);
    await board.openTask('Attic Ventilation');

    await task.uploadMeasureImage(fixturePath);
    await task.saveChanges();
    await task.goBackToProjectDetails();
  });

  /**
   * Uploads required measure photo for HVAC Data Entry.
   */
  test('Upload required measure image for HVAC Data Entry', async ({ page }) => {
    const task = new AssessmentTaskPage(page);
    await board.openTask('HVAC Data Entry');

    await task.uploadMeasureImage(fixturePath);
    await task.saveChanges();
    await task.goBackToProjectDetails();
  });

  /**
   * Uploads required measure photos for Insulation (Attic - Open and Basement - Ceiling).
   */
  test('Upload required measure images for Insulation (Attic - Open and Basement - Ceiling)', async ({ page }) => {
    const task = new AssessmentTaskPage(page);
    await board.openTask('Insulation');

    // Subtask 1: Attic - Open
    await task.selectSubcategory('Attic - Open');
    await task.uploadMeasureImage(fixturePath);

    // Subtask 2: Basement - Ceiling
    await task.selectSubcategory('Basement - Ceiling');
    await task.uploadMeasureImage(fixturePath);

    await task.saveChanges();
    await task.goBackToProjectDetails();
  });

  /**
   * Precondition check for Snapshot suite: verifies that Save All on Snapshot tab passes validation.
   */
  test('Precondition check: Snapshot Save All succeeds with no validation alert', async ({ page }) => {
    const snapshot = new SnapshotPage(page);
    await projectDetailsPage.openSnapshot();

    // Save All should succeed without any "Please fix the following before saving" alert
    await snapshot.saveAll();

    // Verify success banner is shown
    await expect(page.getByText('Saved successfully')).toBeVisible({ timeout: 10_000 });
  });
});
