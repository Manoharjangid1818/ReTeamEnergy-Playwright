import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  AppliancesAssessmentPage,
  AssessmentTaskPage,
  EnergyAssessmentPage,
  GenericTaskFormPage,
  InsulationAssessmentPage,
  ProjectDetailsPage,
  ProjectListPage,
  SnapshotPage,
} from '../pages';
import { APPLIANCE_SECTIONS } from '../test-data/assessment-tasks';
import {
  DOMESTIC_HOT_WATER_FIELDS,
  INSULATION_SECTIONS,
  SAFETY_BARRIER_LABELS,
  SAFETY_INFO_FIELDS,
  WATER_PACKAGE_FIELDS,
} from '../test-data/energyAssessmentData';

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

  test('Domestic Hot Water -> Completed', async ({ page }) => {
    await board.openTask('Domestic Hot Water');
    const task = new GenericTaskFormPage(page);
    await task.expectLoaded(/\/task\/domestic-hot-water/);

    await task.fillFields(DOMESTIC_HOT_WATER_FIELDS);
    await task.expectFieldValues(DOMESTIC_HOT_WATER_FIELDS);
    await task.saveChanges();

    await board.open();
    await board.expectTaskInColumn('Domestic Hot Water', 'Completed');
  });

  test('Safety Information & Air Flow -> Completed', async ({ page }) => {
    await board.openTask('Safety Information & Air Flow');
    const task = new GenericTaskFormPage(page);
    await task.expectLoaded(/\/task\/safety-information(-air-flow)?/);

    await task.fillFields(SAFETY_INFO_FIELDS);
    // Barriers are optional; checking one (Customer Declined) as a smoke check.
    await task.checkBoxes([SAFETY_BARRIER_LABELS[SAFETY_BARRIER_LABELS.length - 2]]);
    await task.expectFieldValues(SAFETY_INFO_FIELDS);
    await task.saveChanges();

    await board.open();
    await board.expectTaskInColumn('Safety Information & Air Flow', 'Completed');
  });

  test('Water Package -> Completed', async ({ page }) => {
    await board.openTask('Water Package');
    const task = new GenericTaskFormPage(page);
    await task.expectLoaded(/\/task\/water-package/);

    await task.fillFields(WATER_PACKAGE_FIELDS);
    await task.expectFieldValues(WATER_PACKAGE_FIELDS);
    await task.saveChanges();

    await board.open();
    await board.expectTaskInColumn('Water Package', 'Completed');
  });

  test('Appliances: fill remaining tabs -> Completed', async ({ page }) => {
    await board.openTask('Appliances');
    const appliances = new AppliancesAssessmentPage(page);
    await appliances.expectLoaded();

    // fillSection/fillSectionFields is idempotent, so re-filling an already
    // completed tab (e.g. Refrigerator) is harmless.
    for (const section of APPLIANCE_SECTIONS) {
      await appliances.selectSection(section, { saveOnSwitch: true });
      await appliances.fillSectionFields(section);
      await appliances.expectSectionValues(section);
    }
    await appliances.saveChanges();

    await board.open();
    await board.expectTaskInColumn('Appliances', 'Completed');
  });

  test('Insulation: fill all 11 sections, with Measure Images -> Completed', async ({ page }) => {
    test.setTimeout(180_000);
    await board.openTask('Insulation');
    const insulation = new InsulationAssessmentPage(page);
    await insulation.expectLoaded();

    for (let i = 0; i < INSULATION_SECTIONS.length; i++) {
      const section = INSULATION_SECTIONS[i];
      const isLast = i === INSULATION_SECTIONS.length - 1;
      await insulation.fillSection(section, true, { save: isLast });
    }

    await board.open();
    await board.expectTaskInColumn('Insulation', 'Completed');
  });

  test('Snapshot Save All is unblocked after this stage', async ({ page }) => {
    // Precondition check for tests/snapshot.spec.ts: Save All should succeed
    // with no validation alert once every task above is Completed.
    const snapshot = new SnapshotPage(page);
    await projectDetailsPage.openSnapshot();
    await snapshot.saveAll();
    await expect(page.getByText('Saved successfully')).toBeVisible({ timeout: 10_000 });
  });
});
