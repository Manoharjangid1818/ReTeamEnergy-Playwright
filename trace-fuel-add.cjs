const { chromium } = require('@playwright/test');
const projectData = {
  firstName: 'Sterling',
  lastName: 'Beaumont',
  streetAddress: '29 Briarwood Lane, East Hartford, CT, USA',
};

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
    baseURL: 'https://dev.reteamenergy.com',
  });
  const page = await context.newPage();

  page.on('request', req => {
    if (req.method() === 'POST' || req.method() === 'PUT') {
      console.log(`[REQ ${req.method()} ${req.url()}]`, req.postData()?.substring(0, 300));
    }
  });

  page.on('response', async res => {
    if (res.request().method() === 'POST' || res.request().method() === 'PUT' || res.url().includes('fuel') || res.url().includes('cost')) {
      console.log(`[RES ${res.status()} ${res.url()}]`);
      try {
        const text = await res.text();
        console.log('  Body:', text.substring(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('/');
  // Search project
  const searchInput = page.getByPlaceholder('Search by name, address, or project ID');
  await searchInput.fill(`${projectData.firstName} ${projectData.lastName}`);
  await page.waitForTimeout(2000);

  const projectLink = page.getByRole('link').filter({ hasText: projectData.streetAddress }).first();
  await projectLink.click();
  await page.waitForTimeout(2000);

  const energyTab = page.getByRole('tab', { name: /^Energy costs$/i });
  await energyTab.click();
  await page.waitForTimeout(1000);

  const addFuelBtn = page.getByRole('button', { name: 'Add Fuel Cost' });
  await addFuelBtn.click();
  await page.waitForTimeout(1000);

  // Select fuel type
  const fuelTypeSelect = page.getByRole('combobox', { name: 'Fuel Type' });
  await fuelTypeSelect.click();
  await page.getByRole('option', { name: 'Electricity' }).click();

  const costInput = page.getByRole('spinbutton', { name: 'Cost per Unit ($)' });
  await costInput.fill('0.15');

  const usageInput = page.getByRole('spinbutton', { name: 'Annual Usage' });
  await usageInput.fill('1000');

  await page.waitForTimeout(500);

  const addBtn = page.getByRole('button', { name: 'Add', exact: true });
  await addBtn.click();
  await page.waitForTimeout(3000);

  console.log('Table after add:\n', await page.locator('tbody').innerText());

  await page.reload();
  await energyTab.click();
  await page.waitForTimeout(3000);

  console.log('Table after reload:\n', await page.locator('tbody').innerText());

  await browser.close();
})();
