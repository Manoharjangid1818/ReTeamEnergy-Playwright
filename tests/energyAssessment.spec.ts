import { expect, test } from '@playwright/test';
import {
  AssessmentTaskPage,
  AppliancesAssessmentPage,
  EnergyAssessmentPage,
  ProjectListPage,
} from '../pages';
import { airSealingTask } from '../test-data/energyAssessmentData';
import {
  APPLIANCE_SECTIONS,
  ASSESSMENT_TASKS,
} from '../test-data/assessment-tasks';
import { projectData } from '../test-data/projectData';

const { name: TASK_NAME, totalSections } = ASSESSMENT_TASKS.appliances;

/**
 * End-to-end test suite: Energy Assessment Kanban board and task forms.
 * Runs serially to verify task state transitions and data entry:
 * - Part 1: Air Sealing single-section task (Not Started -> In Progress -> Completed)
 * - Part 2: Appliances multi-section task (6 tabs, field validation, multi-instance support)
 */
test.describe.serial('Energy Assessment - Air Sealing and Appliances tasks', () => {
  // -------------------------------------------------------------
  // Part 1: Air Sealing task (1 subtask / section)
  // -------------------------------------------------------------
  test.describe.serial('Air Sealing task (1 subtask)', () => {
    // Before each test: open the project and activate the Energy Assessment Kanban board
    test.beforeEach(async ({ page }) => {
      const projectListPage = new ProjectListPage(page);
      const energyAssessmentPage = new EnergyAssessmentPage(page);

      // Step 1: Navigate to home page
      await page.goto('/');
      await expect(page).toHaveURL('https://dev.reteamenergy.com/');

      // Step 2: Search and open target project by project name
      await projectListPage.searchProject(
        `${projectData.firstName} ${projectData.lastName}`
      );
      await projectListPage.openProject(projectData.streetAddress);

      // Step 3: Open the Energy Assessment Kanban board
      await energyAssessmentPage.open();
    });

    /**
     * Verifies that filling initial required fields moves the Air Sealing task
     * card out of 'Not Started' and updates its progress.
     */
    test('partially completed Air Sealing moves to In Progress', async ({ page }) => {
      const energyAssessmentPage = new EnergyAssessmentPage(page);
      const taskPage = new AssessmentTaskPage(page);

      // Step 1: Verify task begins in 'Not Started' with '0 / 1 sections' (if starting fresh)
      const isNotStarted = await energyAssessmentPage
        .taskCardIn('Not Started', airSealingTask.taskName)
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (isNotStarted) {
        await energyAssessmentPage.expectSectionsProgress(
          ASSESSMENT_TASKS.airSealing.name,
          0,
          ASSESSMENT_TASKS.airSealing.totalSections
        );
      }

      // Step 2: Open the Air Sealing task
      await energyAssessmentPage.openTask(airSealingTask.taskName);

      // Step 3: Fill partial dropdown fields
      for (const dropdown of airSealingTask.partialFill.dropdowns) {
        await taskPage.selectDropdownOption(dropdown.label, dropdown.option);
      }

      // Step 4: Save changes and return to the board
      await taskPage.saveChanges();
      await taskPage.goBackToProjectDetails();
      await energyAssessmentPage.open();

      // Step 5: Verify task card has moved to 'In Progress' or 'Completed'
      const taskCard = energyAssessmentPage
        .taskCardIn('In Progress', airSealingTask.taskName)
        .or(energyAssessmentPage.taskCardIn('Completed', airSealingTask.taskName));
      await expect(taskCard).toBeVisible({ timeout: 15_000 });

      // Step 6: Verify task card is no longer in 'Not Started'
      await energyAssessmentPage.expectTaskNotInColumn(airSealingTask.taskName, 'Not Started');
    });

    /**
     * Verifies that filling all remaining fields moves Air Sealing to 'Completed' (1 / 1 sections).
     */
    test('completed Air Sealing moves to Completed', async ({ page }) => {
      const energyAssessmentPage = new EnergyAssessmentPage(page);
      const taskPage = new AssessmentTaskPage(page);

      // Step 1: Open the Air Sealing task
      await energyAssessmentPage.openTask(airSealingTask.taskName);

      // Step 2: Fill all fields (both partial and remaining) to ensure completeness
      for (const dropdown of airSealingTask.partialFill.dropdowns) {
        await taskPage.selectDropdownOption(dropdown.label, dropdown.option);
      }
      for (const dropdown of airSealingTask.remainingFill.dropdowns) {
        await taskPage.selectDropdownOption(dropdown.label, dropdown.option);
      }
      for (const field of airSealingTask.remainingFill.textFields) {
        await taskPage.fillField(field.label, field.value);
      }
      for (const checkbox of airSealingTask.remainingFill.checkboxes) {
        await taskPage.checkCheckbox(checkbox);
      }

      // Step 3: Save changes and return to the Kanban board
      await taskPage.saveChanges();
      await taskPage.goBackToProjectDetails();
      await energyAssessmentPage.open();

      // Step 4: Assert task card is now in the 'Completed' column
      await energyAssessmentPage.expectTaskInColumn(airSealingTask.taskName, 'Completed');
      await energyAssessmentPage.expectTaskNotInColumn(airSealingTask.taskName, 'In Progress');

      // Step 5: Assert progress counter displays '1 / 1 sections'
      await energyAssessmentPage.expectSectionsProgress(
        ASSESSMENT_TASKS.airSealing.name,
        ASSESSMENT_TASKS.airSealing.totalSections,
        ASSESSMENT_TASKS.airSealing.totalSections
      );
    });
  });

  // -------------------------------------------------------------
  // Part 2: Appliances task (6 subtasks / sections)
  // -------------------------------------------------------------
  test.describe.serial('Appliances task (6 subtasks)', () => {
    let board: EnergyAssessmentPage;
    let appliances: AppliancesAssessmentPage;

    // Before each test: navigate to board, open Appliances task, and verify tabs
    test.beforeEach(async ({ page }) => {
      const projectListPage = new ProjectListPage(page);
      board = new EnergyAssessmentPage(page);
      appliances = new AppliancesAssessmentPage(page);

      // Step 1: Navigate to home page
      await page.goto('/');
      await expect(page).toHaveURL('https://dev.reteamenergy.com/');

      // Step 2: Search and open target project by project name
      await projectListPage.searchProject(
        `${projectData.firstName} ${projectData.lastName}`
      );
      await projectListPage.openProject(projectData.streetAddress);

      // Step 3: Open Energy Assessment board and locate Appliances card
      await board.open();
      await board.expectTaskInColumn(TASK_NAME, 'Not Started');
      await board.expectSectionsProgress(TASK_NAME, 0, totalSections);

      // Step 4: Open Appliances task and verify tabs
      await board.openTask(TASK_NAME);
      await appliances.expectLoaded();
      await appliances.expectAllSectionTabsVisible();
    });

    // Test each tab individually: verifies field visibility, fills fields, and checks values
    for (const section of APPLIANCE_SECTIONS) {
      test(`${section}: shows expected fields and accepts data`, async () => {
        // Step 1: Switch to section tab
        await appliances.selectSection(section);

        // Step 2: Verify all expected fields for this section are visible
        await appliances.expectSectionFieldsVisible(section);

        // Step 3: Fill section fields
        await appliances.fillSectionFields(section);

        // Step 4: Verify entered values persist in the form controls
        await appliances.expectSectionValues(section);
      });
    }

    /**
     * Fills all six appliance section tabs in a single continuous session.
     */
    test('fill all six sections in one run', async () => {
      // Iterate through all 6 sections, fill each one, and verify its values
      for (const section of APPLIANCE_SECTIONS) {
        await appliances.fillSection(section);
        await appliances.expectSectionValues(section);
      }

      // Return to Project Details and verify board
      await appliances.goBackToProjectDetails();
      await board.open();
    });

    /**
     * Verifies multi-instance functionality: adds a second Refrigerator instance and fills it.
     */
    test('Refrigerator: add and fill a second instance', async () => {
      // Step 1: Select Refrigerator tab and fill Instance 1
      await appliances.selectSection('Refrigerator');
      await appliances.fillSectionFields('Refrigerator', 1);

      // Step 2: Click the '+' add instance button
      await appliances.addInstance();

      // Step 3: Wait for 'Refrigerator - Instance 2' header to appear
      await appliances.instanceHeading('Refrigerator', 2).waitFor({ timeout: 10_000 });

      // Step 4: Fill Instance 2 fields and verify values
      await appliances.fillSectionFields('Refrigerator', 2);
      await appliances.expectSectionValues('Refrigerator', 2);
    });
  });
});
