import { Page, Locator, expect } from '@playwright/test';

export class ProjectListPage {
  private readonly page: Page;

  readonly addProjectButton: Locator;
  readonly searchInput: Locator;
  readonly myProjectsHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addProjectButton = page.getByRole('button', {
      name: 'Add Project',
    });

    this.searchInput = page.getByPlaceholder(
      'Search by name, address, or project ID'
    );

    this.myProjectsHeading = page.getByText('My Projects', {
      exact: true,
    });
  }

  async waitForProjectList() {
    await this.myProjectsHeading.waitFor({
      state: 'visible',
    });

    await this.searchInput.waitFor({
      state: 'visible',
    });
  }

  async addProject() {
    await this.addProjectButton.click();
  }

  async searchProject(searchValue: string) {
    await this.waitForProjectList();

    await this.searchInput.fill(searchValue);
  }

  async openProject(projectName: string) {
    const projectLink = this.page
      .getByRole('link')
      .filter({ hasText: projectName })
      .first();

    // Searching is debounced by the dashboard, so wait for the matching
    // result instead of assuming it is rendered immediately after fill().
    await expect(projectLink).toBeVisible({ timeout: 15_000 });
    await projectLink.click();
  }
}
