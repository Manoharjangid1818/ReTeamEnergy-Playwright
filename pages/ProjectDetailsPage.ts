import { Page, Locator, expect } from '@playwright/test';

export class ProjectDetailsPage {
  private readonly page: Page;

  readonly customerProfileTab: Locator;
  readonly addCustomerProfileButton: Locator;
  readonly propertyProfileTab: Locator;
  readonly addPropertyProfileButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.customerProfileTab = page.getByRole('tab', {
      name: 'Customer profile',
      exact: true,
    });

    this.addCustomerProfileButton = page.getByRole('button', {
      name: 'Add Customer Profile',
      exact: true,
    });

    this.propertyProfileTab = page.getByRole('tab', {
      name: /^Property Profile$/i,
      exact: true,
    });

    this.addPropertyProfileButton = page.getByRole('button', {
      name: 'Add Property Profile',
      exact: true,
    });
  }

  async waitForPageReady() {  
    await expect(this.customerProfileTab).toBeVisible();
  }

  async openCustomerProfile() {
    await this.customerProfileTab.click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Customer Profile',
        exact: true,
      })
    ).toBeVisible();
  }

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

  async openPropertyProfile() {
    await this.propertyProfileTab.click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Property Profile',
        exact: true,
      })
    ).toBeVisible();

    // await expect(this.addPropertyProfileButton).toBeVisible();
  }
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
}