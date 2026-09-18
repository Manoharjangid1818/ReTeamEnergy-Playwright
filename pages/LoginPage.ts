import { Page, Locator, expect } from '@playwright/test';
import { urls } from '../test-data/urls';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        
        this.emailInput = page.getByPlaceholder('Enter your Email');
        this.passwordInput = page.getByPlaceholder('Enter your Password');
        this.loginButton = page.getByRole('button', {name: 'login'});  
    }

    async open() {
        await this.page.goto(urls.signIn);
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();

        await expect(
            this.page.getByText('My Projects', { exact: true })
        ).toBeVisible();
    }

}