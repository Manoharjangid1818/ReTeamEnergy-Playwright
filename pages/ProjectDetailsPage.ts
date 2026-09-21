import { Page, Locator, expect } from '@playwright/test';

/**
 * Valid tab names on the Project Details page.
 */
export type ProjectTab =
  | 'Customer profile'
  | 'Property profile'
  | 'Snapshot'
  | 'Energy assessment';

/**
 * Page object representing the Project Details screen (/project-details/:id).
 * Manages access to different profile tabs: Customer Profile, Property Profile,
 * Energy Costs, Energy Assessment, and Snapshot.
 */
export class ProjectDetailsPage {
  private readonly page: Page;

  readonly customerProfileTab: Locator;
  readonly addCustomerProfileButton: Locator;
  readonly propertyProfileTab: Locator;
  readonly addPropertyProfileButton: Locator;
  readonly snapshotTab: Locator;
  readonly energyAssessmentTab: Locator;

  /**
   * Initializes tab and action button locators on the Project Details page.
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Customer Profile tab locator
    this.customerProfileTab = page.getByRole('tab', {
      name: /^Customer Profile$/i,
    });

    // Button to open the Customer Profile creation form
    this.addCustomerProfileButton = page.getByRole('button', {
      name: 'Add Customer Profile',
      exact: true,
    });

    // Property Profile tab locator
    this.propertyProfileTab = page.getByRole('tab', {
      name: /^Property Profile$/i,
      exact: true,
    });

    // Button to open the Property Profile creation form
    this.addPropertyProfileButton = page.getByRole('button', {
      name: 'Add Property Profile',
      exact: true,
    });

    // Snapshot tab locator
    this.snapshotTab = page.getByRole('tab', {
      name: /^Snapshot$/i,
      exact: true,
    });

    // Energy assessment tab locator
    this.energyAssessmentTab = page.getByRole('tab', {
      name: /^Energy assessment$/i,
    });
  }

  /**
   * Waits for the Project Details page and primary tabs to be fully loaded.
   */
  async waitForPageReady() {
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });
    await expect(this.customerProfileTab).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Switches to the Customer Profile tab and verifies its section heading.
   */
  async openCustomerProfile() {
    await this.customerProfileTab.click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Customer Profile',
        exact: true,
      })
    ).toBeVisible();
  }

  /**
   * Clicks 'Add Customer Profile' and verifies that the form header appears.
   */
  async clickAddCustomerProfile() {
    await expect(this.addCustomerProfileButton).toBeVisible();
    await this.addCustomerProfileButton.click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Add Customer Profile',
        exact: true,
      })
    ).toBeVisible();
  }

  /**
   * Switches to the Property Profile tab and verifies its section heading.
   */
  async openPropertyProfile() {
    await this.propertyProfileTab.click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Property Profile',
        exact: true,
      })
    ).toBeVisible();
  }

  /**
   * Clicks 'Add Property Profile' and verifies that the form header appears.
   */
  async clickAddPropertyProfile() {
    await expect(this.addPropertyProfileButton).toBeVisible();
    await this.addPropertyProfileButton.click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Add Property Profile',
        exact: true,
      })
    ).toBeVisible();
  }

  /**
   * Switches to the Snapshot tab and verifies that the Save All button appears.
   */
  async openSnapshot() {
    await this.snapshotTab.click();
    await expect(
      this.page.getByRole('button', { name: 'Save All' })
    ).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Switches to a specific project tab by name.
   *
   * @param name Tab name ('Customer profile' | 'Property profile' | 'Snapshot' | 'Energy assessment')
   */
  async openTab(name: ProjectTab) {
    const tabLocator = this.page.getByRole('tab', {
      name: new RegExp(`^${name}$`, 'i'),
    });
    await expect(tabLocator).toBeVisible({ timeout: 15_000 });
    await expect(tabLocator).toBeEnabled({ timeout: 15_000 });
    await tabLocator.click();
  }
}