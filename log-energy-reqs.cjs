const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
    baseURL: 'https://dev.reteamenergy.com',
  });
  const page = await context.newPage();

  page.on('request', req => {
    if (req.url().includes('/api/')) {
      console.log(`[REQ ${req.method()} ${req.url()}]`);
    }
  });

  await page.goto('/project-details/4740d9d8-39db-4194-ab5d-23ce08cfd3fa');
  await page.waitForTimeout(2000);

  console.log('--- Clicking Energy Costs ---');
  const energyTab = page.getByRole('tab', { name: /^Energy costs$/i });
  await energyTab.click();
  await page.waitForTimeout(2000);

  await browser.close();
})();
