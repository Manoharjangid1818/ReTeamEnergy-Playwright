import { Page, expect } from '@playwright/test';

export class Header {
  constructor(private page: Page) {}

  async logout() {
    await this.page.getByRole('button').filter({
      has: this.page.locator('.MuiAvatar-root')
    }).click();

    await this.page.getByRole('button', { name: 'Logout' }).click();

    await expect(this.page).toHaveURL(
      'https://dev.reteamenergy.com/sign-in'
    );
  }
}