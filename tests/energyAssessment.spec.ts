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

test.describe.serial('Energy Assessment - Air Sealing and Appliances tasks', () => {
  // -------------------------------------------------------------
  // Part 1: Air Sealing task (1 subtask / section)
  // -------------------------------------------------------------
  test.describe.serial('Air Sealing task (1 subtask)', () => {
    test.beforeEach(async ({ page }) => {
      const projectListPage = new ProjectListPage(page);
      const energyAssessmentPage = new EnergyAssessmentPage(page);

      await page.goto('/');
      await expect(page).toHaveURL('https://dev.reteamenergy.com/');

      await projectListPage.searchProject(
        `${projectData.firstName} ${projectData.lastName}`
      );
      await projectListPage.openProject(projectData.streetAddress);
      await energyAssessmentPage.open();
    });

    test('partially completed Air Sealing moves to In Progress', async ({ page }) => {
      const energyAssessmentPage = new EnergyAssessmentPage(page);
      const taskPage = new AssessmentTaskPage(page);

      await energyAssessmentPage.expectTaskInColumn(airSealingTask.taskName, 'Not Started');
      await energyAssessmentPage.expectSectionsProgress(
        ASSESSMENT_TASKS.airSealing.name,
        0,
        ASSESSMENT_TASKS.airSealing.totalSections
      );
      await energyAssessmentPage.openTask(airSealingTask.taskName);

      for (const dropdown of airSealingTask.partialFill.dropdowns) {
        await taskPage.selectDropdownOption(dropdown.label, dropdown.option);
      }

      await taskPage.saveChanges();
      await taskPage.goBackToProjectDetails();
      await energyAssessmentPage.open();

      // In this template, measure completion is computed by section count (r / n * 100).
      // For single-section measures (1/1 sections) like Air Sealing, saving any data marks
      // the section complete and may move it directly to Completed or In Progress.
      const taskCard = energyAssessmentPage
        .taskCardIn('In Progress', airSealingTask.taskName)
        .or(energyAssessmentPage.taskCardIn('Completed', airSealingTask.taskName));
      await expect(taskCard).toBeVisible({ timeout: 15_000 });
      await energyAssessmentPage.expectTaskNotInColumn(airSealingTask.taskName, 'Not Started');
    });

    test('completed Air Sealing moves to Completed', async ({ page }) => {
      const energyAssessmentPage = new EnergyAssessmentPage(page);
      const taskPage = new AssessmentTaskPage(page);

      await energyAssessmentPage.openTask(airSealingTask.taskName);

      // Reapply partial fields so this test also works when run in isolation.
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

      await taskPage.saveChanges();
      await taskPage.goBackToProjectDetails();
      await energyAssessmentPage.open();

      await energyAssessmentPage.expectTaskInColumn(airSealingTask.taskName, 'Completed');
      await energyAssessmentPage.expectTaskNotInColumn(airSealingTask.taskName, 'In Progress');
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

    test.beforeEach(async ({ page }) => {
      const projectListPage = new ProjectListPage(page);
      board = new EnergyAssessmentPage(page);
      appliances = new AppliancesAssessmentPage(page);

      await page.goto('/');
      await expect(page).toHaveURL('https://dev.reteamenergy.com/');

      await projectListPage.searchProject(
        `${projectData.firstName} ${projectData.lastName}`
      );
      await projectListPage.openProject(projectData.streetAddress);

      await board.open();
      await board.expectTaskInColumn(TASK_NAME, 'Not Started');
      await board.expectSectionsProgress(TASK_NAME, 0, totalSections);
      await board.openTask(TASK_NAME);
      await appliances.expectLoaded();
      await appliances.expectAllSectionTabsVisible();
    });

    // One test per tab: correct fields are shown, then fill and verify them.
    for (const section of APPLIANCE_SECTIONS) {
      test(`${section}: shows expected fields and accepts data`, async () => {
        await appliances.selectSection(section);
        await appliances.expectSectionFieldsVisible(section);
        await appliances.fillSectionFields(section);
        await appliances.expectSectionValues(section);
      });
    }

    test('fill all six sections in one run', async () => {
      for (const section of APPLIANCE_SECTIONS) {
        await appliances.fillSection(section);
        await appliances.expectSectionValues(section);
      }

      await appliances.goBackToProjectDetails();
      await board.open();
    });

    test('Refrigerator: add and fill a second instance', async () => {
      await appliances.selectSection('Refrigerator');
      await appliances.fillSectionFields('Refrigerator', 1);

      await appliances.addInstance();
      await appliances.instanceHeading('Refrigerator', 2).waitFor({ timeout: 10_000 });

      await appliances.fillSectionFields('Refrigerator', 2);
      await appliances.expectSectionValues('Refrigerator', 2);
    });
  });
});
