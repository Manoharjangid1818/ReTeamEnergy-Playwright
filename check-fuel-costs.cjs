const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
    baseURL: 'https://dev.reteamenergy.com',
  });
  const page = await context.newPage();

  page.on('response', async res => {
    if (res.url().includes('fuel') || res.url().includes('cost') || res.url().includes('energy')) {
      console.log(`[API ${res.status()}] ${res.url()}`);
      try {
        const text = await res.text();
        console.log('Response:', text.substring(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('/project-details/e9d00755-f6e3-4b85-a39c-33b281b4d1f8');
  await page.waitForTimeout(2000);

  const costsTab = page.getByRole('tab', { name: /^Energy costs$/i });
  await costsTab.click();
  await page.waitForTimeout(3000);

  console.log('Table rows:\n', await page.locator('tbody').innerText());

  await browser.close();
})();
