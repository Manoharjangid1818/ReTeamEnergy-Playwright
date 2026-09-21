import * as fs from 'node:fs';
import * as path from 'node:path';
import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object representing the project dashboard screen (/ or /projects).
 * Provides methods for searching projects, clicking 'Add Project', and opening specific project cards.
 */
export class ProjectListPage {
  private readonly page: Page;

  readonly addProjectButton: Locator;
  readonly searchInput: Locator;
  readonly myProjectsHeading: Locator;

  /**
   * Retrieves the automatically saved project ID from the current test run or environment.
   * Checks playwright/.auth/createdProject.json first, then falls back to process.env.SNAPSHOT_PROJECT_ID.
   *
   * @returns Project UUID string if available, or null.
   */
  static getSavedProjectId(): string | null {
    try {
      const targetPath = path.resolve('playwright/.auth/createdProject.json');
      if (fs.existsSync(targetPath)) {
        const fileContent = fs.readFileSync(targetPath, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed?.id) {
          return parsed.id;
        }
      }
    } catch {}

    return process.env.SNAPSHOT_PROJECT_ID || null;
  }

  /**
   * Initializes locators for the project list page elements.
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Button to initiate creation of a new project
    this.addProjectButton = page.getByRole('button', {
      name: 'Add Project',
    });

    // Search bar for filtering projects by customer name, address, or ID
    this.searchInput = page.getByPlaceholder(
      'Search by name, address, or project ID'
    );

    // Main page title to ensure the dashboard is loaded
    this.myProjectsHeading = page.getByText('My Projects', {
      exact: true,
    });
  }

  /**
   * Waits for the project list elements to finish rendering on screen.
   */
  async waitForProjectList() {
    await this.myProjectsHeading.waitFor({
      state: 'visible',
    });

    await this.searchInput.waitFor({
      state: 'visible',
    });
  }

  /**
   * Clicks the 'Add Project' button to navigate to the new project creation page.
   */
  async addProject() {
    await this.addProjectButton.click();
  }

  /**
   * Searches for a project and waits for the backend API response to complete.
   * 1. Waits for dashboard to be ready.
   * 2. Sets up a listener for the `/api/projects?search=` network response.
   * 3. Fills the search input with the search query.
   * 4. Awaits the network response and allows UI to finish re-rendering.
   *
   * @param searchValue The query string to search (e.g. customer name or address)
   */
  async searchProject(searchValue: string) {
    // Step 1: Ensure search elements are visible
    await this.waitForProjectList();

    // Step 2: Set up a response listener to avoid race conditions with backend search API
    const responsePromise = this.page
      .waitForResponse(
        (res) =>
          res.url().includes('/api/projects') &&
          res.url().includes('search=') &&
          res.status() === 200,
        { timeout: 15_000 }
      )
      .catch(() => null);

    // Step 3: Type search term into input
    await this.searchInput.fill(searchValue);

    // Step 4: Wait for the network search results to return
    await responsePromise;

    // Step 5: Brief pause to allow React/MUI to update the DOM
    await this.page.waitForTimeout(500);
  }

  /**
   * Locates and clicks on the target project card from the list.
   * If a project was recently created in this test run, it prefers matching by exact project ID;
   * otherwise it falls back to filtering cards by project name or address.
   *
   * @param projectName Project identifier such as street address or customer name
   */
  async openProject(projectName: string) {
    let specificLink: Locator | null = null;

    // Check if the parameter directly matches a project link by ID or path
    const directCandidate = this.page.locator(`a[href*="${projectName}"]`);
    if (await directCandidate.isVisible({ timeout: 2000 }).catch(() => false)) {
      specificLink = directCandidate;
    } else {
      // Check if a recently created project ID was saved by the login/create project flow
      const savedId = ProjectListPage.getSavedProjectId();
      if (savedId) {
        const candidate = this.page.locator(`a[href*="${savedId}"]`);
        if (await candidate.isVisible({ timeout: 4000 }).catch(() => false)) {
          specificLink = candidate;
        }
      }
    }

    // Fall back to matching link by name/address if specific ID link isn't found
    const projectLink =
      specificLink ??
      this.page
        .getByRole('link')
        .filter({ hasText: projectName })
        .first();

    // Wait for the matching project link to be visible and click it
    await expect(projectLink).toBeVisible({ timeout: 15_000 });
    await projectLink.click();
  }
}
