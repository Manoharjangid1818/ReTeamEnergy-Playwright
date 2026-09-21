const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
    baseURL: 'https://dev.reteamenergy.com',
  });

  const res1 = await context.request.get('/api/projects/with-images?page=1&limit=12&search=Sterling');
  const json1 = await res1.json();
  console.log('Search "Sterling":', json1.data.projects.map(p => p.name));

  const res2 = await context.request.get('/api/projects/with-images?page=1&limit=12&search=Sterling Beaumont');
  const json2 = await res2.json();
  console.log('Search "Sterling Beaumont":', json2.data.projects.map(p => p.name));

  const res3 = await context.request.get('/api/projects/with-images?page=1&limit=12&search=Beaumont');
  const json3 = await res3.json();
  console.log('Search "Beaumont":', json3.data.projects.map(p => p.name));

  await browser.close();
})();
