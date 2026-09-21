const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
    baseURL: 'https://dev.reteamenergy.com',
  });

  const res = await context.request.get('/api/projects/e9d00755-f6e3-4b85-a39c-33b281b4d1f8/with-images');
  console.log('e9d00755 status:', res.status(), await res.text());

  await browser.close();
})();
