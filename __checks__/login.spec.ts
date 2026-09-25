import { test, expect } from '@playwright/test'
import { LoginPage, ProjectListPage } from '../pages'
import { loginPageData } from '../test-data/loginPageData'

test('Authenticated user can log in and view My Projects dashboard', async ({ page }) => {
  const email = process.env.RETEAM_EMAIL || loginPageData.email
  const password = process.env.RETEAM_PASSWORD || loginPageData.password

  expect(email, 'RETEAM_EMAIL must be set').toBeTruthy()
  expect(password, 'RETEAM_PASSWORD must be set').toBeTruthy()

  const loginPage = new LoginPage(page)
  const projectListPage = new ProjectListPage(page)

  await page.goto('/')
  await loginPage.login(email, password)

  await expect(page).toHaveURL('https://dev.reteamenergy.com/')
  await projectListPage.waitForProjectList()
  await expect(projectListPage.addProjectButton).toBeVisible()
})
