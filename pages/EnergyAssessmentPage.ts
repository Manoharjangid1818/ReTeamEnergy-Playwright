import { expect, Locator, Page } from '@playwright/test';

export type AssessmentStatus = 'Not Started' | 'In Progress' | 'Completed';

/** The Energy Assessment Kanban board on the Project Details page. */
export class EnergyAssessmentPage {
  readonly energyAssessmentTab: Locator;
  readonly goBackToProjectDetailsLink: Locator;

  constructor(private readonly page: Page) {
    this.energyAssessmentTab = page.getByRole('tab', {
      name: /^Energy assessment$/i,
    });
    this.goBackToProjectDetailsLink = page.getByRole('link', {
      name: 'Go Back to Project Details',
    });
  }

  async open() {
    await expect(this.energyAssessmentTab).toBeVisible({ timeout: 20_000 });
    await expect(this.energyAssessmentTab).toBeEnabled({ timeout: 20_000 });
    const isSelected = await this.energyAssessmentTab.getAttribute('aria-selected').catch(() => null);
    if (isSelected !== 'true') {
      await this.energyAssessmentTab.click();
    }
    await expect(this.page.getByText('Not Started', { exact: true })).toBeVisible({ timeout: 20_000 });
  }

  getColumn(status: AssessmentStatus): Locator {
    return this.page
      .getByText(status, { exact: true })
      .locator('xpath=ancestor::div[2]');
  }

  taskCardIn(status: AssessmentStatus, taskName: string): Locator {
    return this.getColumn(status).getByText(taskName, { exact: true });
  }

  taskCard(taskName: string): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByText(taskName, { exact: true }) })
      .filter({ has: this.page.getByText(/\d+\s*\/\s*\d+ sections/) })
      .last(); // innermost div that contains both the title and the progress text
  }

  async expectSectionsProgress(taskName: string, done: number, total: number) {
    await expect(this.taskCard(taskName)).toContainText(`${done} / ${total} sections`);
  }

  async openTask(taskName: string) {
    const card = this.taskCard(taskName);
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await card.click();
    } else {
      await this.page.getByText(taskName, { exact: true }).first().click();
    }
  }

  async expectTaskInColumn(taskName: string, status: AssessmentStatus) {
    await expect(this.taskCardIn(status, taskName)).toBeVisible();
  }

  async expectTaskNotInColumn(taskName: string, status: AssessmentStatus) {
    await expect(this.taskCardIn(status, taskName)).toHaveCount(0);
  }

  sectionsProgressFor(taskName: string): Locator {
    return this.taskCard(taskName).getByText(/\d+\s*\/\s*\d+ sections/);
  }

  async goBackToProjectDetails() {
    if (this.page.url().includes('/project-details/')) {
      return;
    }
    await this.goBackToProjectDetailsLink.click().catch(() => null);
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });
  }
}
