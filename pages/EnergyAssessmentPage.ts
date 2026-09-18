import { expect, Locator, Page } from '@playwright/test';

export type AssessmentStatus = 'Not Started' | 'In Progress' | 'Completed';

/** The Energy Assessment Kanban board on the Project Details page. */
export class EnergyAssessmentPage {
  readonly energyAssessmentTab: Locator;
  readonly goBackToProjectDetailsLink: Locator;

  constructor(private readonly page: Page) {
    this.energyAssessmentTab = page.getByRole('tab', {
      name: 'Energy assessment',
      exact: true,
    });
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });
  }

  async open() {
    await this.energyAssessmentTab.click();
    await expect(this.page.getByText('Not Started', { exact: true })).toBeVisible();
  }

  /**
   * Returns the column that contains the supplied status heading. Replace the
   * ancestor selector with a data-testid if the application adds one.
   */
  getColumn(status: AssessmentStatus): Locator {
    return this.page
      .getByText(status, { exact: true })
      .locator('xpath=ancestor::div[1]');
  }

  taskCardIn(status: AssessmentStatus, taskName: string): Locator {
    return this.getColumn(status).getByText(taskName, { exact: true });
  }

  async openTask(taskName: string) {
    await this.page.getByText(taskName, { exact: true }).first().click();
  }

  async expectTaskInColumn(taskName: string, status: AssessmentStatus) {
    await expect(this.taskCardIn(status, taskName)).toBeVisible();
  }

  async expectTaskNotInColumn(taskName: string, status: AssessmentStatus) {
    await expect(this.taskCardIn(status, taskName)).toHaveCount(0);
  }

  sectionsProgressFor(taskName: string): Locator {
    return this.page
      .getByText(taskName, { exact: true })
      .locator('xpath=ancestor::div[1]')
      .getByText(/\d+\s*\/\s*\d+ sections/);
  }

  async goBackToProjectDetails() {
    await this.goBackToProjectDetailsLink.click();
  }
}
