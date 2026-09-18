import { expect, test } from '@playwright/test';
import {
  AssessmentTaskPage,
  EnergyAssessmentPage,
  ProjectListPage,
} from '../pages';
import { airSealingTask } from '../test-data/energyAssessmentData';
import { projectData } from '../test-data/projectData';

test.describe.serial('Energy Assessment - task status transitions', () => {
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
    await energyAssessmentPage.openTask(airSealingTask.taskName);

    for (const dropdown of airSealingTask.partialFill.dropdowns) {
      await taskPage.selectDropdownOption(dropdown.label, dropdown.option);
    }

    await taskPage.saveChanges();
    await taskPage.goBackToProjectDetails();
    await energyAssessmentPage.open();

    await energyAssessmentPage.expectTaskInColumn(airSealingTask.taskName, 'In Progress');
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
  });
});
