import { test, expect } from '@playwright/test'

test('Sign-in page is available', async ({ page }) => {
  // The application is served as an SPA: direct /sign-in requests are not
  // rewritten by its S3/CloudFront host, so enter through the public root.
  const response = await page.goto('/')
  expect(response?.status()).toBeLessThan(400)
  await expect(page.getByPlaceholder('Enter your Email')).toBeVisible()
  await expect(page.getByPlaceholder('Enter your Password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
})
