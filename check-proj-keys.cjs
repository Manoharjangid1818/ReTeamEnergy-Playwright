const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
    baseURL: 'https://dev.reteamenergy.com',
  });

  const res = await context.request.get('/api/projects/4740d9d8-39db-4194-ab5d-23ce08cfd3fa/with-images');
  const json = await res.json();
  console.log('Project keys:', Object.keys(json.data || json));
  console.log('Fuel costs in json:', (json.data?.fuel_costs || json.fuel_costs));

  await browser.close();
})();
