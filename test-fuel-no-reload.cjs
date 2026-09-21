const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: 'playwright/.auth/user.json',
    baseURL: 'https://dev.reteamenergy.com',
  });
  const page = await context.newPage();

  page.on('response', res => {
    if (res.url().includes('fuel') || res.url().includes('cost')) {
      console.log(`[RES ${res.status()} ${res.request().method()} ${res.url()}]`);
    }
  });

  await page.goto('/');
  // Search project
  const searchInput = page.getByPlaceholder('Search by name, address, or project ID');
  await searchInput.fill('Sterling');
  await page.waitForTimeout(2000);

  // Let's see what project link is visible
  const links = await page.locator('a[href*="/project-details/"]').all();
  console.log('Project links count:', links.length);
  if (links.length === 0) {
    console.log('No project link found');
    await browser.close();
    return;
  }

  await links[0].click();
  await page.waitForTimeout(2000);
  console.log('Opened URL:', page.url());

  const energyTab = page.getByRole('tab', { name: /^Energy costs$/i });
  await energyTab.click();
  await page.waitForTimeout(1500);

  const addFuelBtn = page.getByRole('button', { name: 'Add Fuel Cost' });
  await addFuelBtn.click();
  await page.waitForTimeout(500);

  const fuelTypeSelect = page.getByRole('combobox', { name: 'Fuel Type' });
  await fuelTypeSelect.click();
  await page.getByRole('option', { name: 'Electricity' }).click();

  await page.getByRole('spinbutton', { name: 'Cost per Unit ($)' }).fill('0.15');
  await page.getByRole('spinbutton', { name: 'Annual Usage' }).fill('1000');
  await page.waitForTimeout(500);

  const addBtn = page.getByRole('button', { name: 'Add', exact: true });
  await addBtn.click();
  await page.waitForTimeout(2000);

  console.log('Table rows right after add:\n', await page.locator('tbody').innerText());

  await browser.close();
})();
