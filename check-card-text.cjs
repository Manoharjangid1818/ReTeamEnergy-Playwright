const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
    baseURL: 'https://dev.reteamenergy.com',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForTimeout(2000);

  const searchInput = page.getByPlaceholder('Search by name, address, or project ID');
  await searchInput.fill('Sterling Beaumont');
  await page.waitForTimeout(3000);

  const links = await page.locator('a[href*="/project-details/"]').all();
  console.log('Cards found:', links.length);
  for (const link of links) {
    console.log('Card text:\n', await link.innerText());
    console.log('Href:', await link.getAttribute('href'));
  }

  await browser.close();
})();
