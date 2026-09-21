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

    const responsePromise = this.page
      .waitForResponse(
        (res) =>
          res.url().includes('/api/projects') &&
          res.url().includes('search=') &&
          res.status() === 200,
        { timeout: 15_000 }
      )
      .catch(() => null);

    await this.searchInput.fill(searchValue);
    await responsePromise;
    await this.page.waitForTimeout(500);
  }

  async openProject(projectName: string) {
    let specificLink: Locator | null = null;
    try {
      const fsSync = await import('node:fs');
      const pathSync = await import('node:path');
      const targetPath = pathSync.resolve('playwright/.auth/createdProject.json');
      if (fsSync.existsSync(targetPath)) {
        const { id } = JSON.parse(fsSync.readFileSync(targetPath, 'utf8'));
        if (id) {
          const candidate = this.page.locator(`a[href*="${id}"]`);
          if (await candidate.isVisible({ timeout: 4000 }).catch(() => false)) {
            specificLink = candidate;
          }
        }
      }
    } catch (e) {}

    const projectLink = specificLink ?? this.page
      .getByRole('link')
      .filter({ hasText: projectName })
      .first();

    // Searching is debounced by the dashboard, so wait for the matching
    // result instead of assuming it is rendered immediately after fill().
    await expect(projectLink).toBeVisible({ timeout: 15_000 });
    await projectLink.click();
  }
}
