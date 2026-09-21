import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  EnergyCostsPage,
} from '../pages';

import { projectData } from '../test-data/projectData';

test('Energy Costs → Add Fuel Costs', async ({ page }) => {
  test.setTimeout(90_000);
  const projectListPage = new ProjectListPage(page);
  const energyCostsPage = new EnergyCostsPage(page);

  await page.goto('/');

  // Verify My Projects page
  await expect(page).toHaveURL(
    'https://dev.reteamenergy.com/'
  );

  // Open Scenario 1 project
  await projectListPage.searchProject(
    `${projectData.firstName} ${projectData.lastName}`
  );

  await projectListPage.openProject(
    projectData.streetAddress
  );

  // Open Energy Costs
  await energyCostsPage.openEnergyCosts();
  await energyCostsPage.waitForPageReady();

  // Remove existing fuel costs
  await energyCostsPage.deleteAllFuelCosts();

  // Add every available fuel cost from test data.
  for (const fuelCost of projectData.fuelCosts) {
    await energyCostsPage.openAddFuelCost();

    const isAvailable = await energyCostsPage.isFuelTypeAvailable(
      fuelCost.fuelType
    );

    if (!isAvailable) {
      await energyCostsPage.cancelAddFuelCost();
      continue;
    }

    await energyCostsPage.addFuelCost(fuelCost);
  }

  // Verify no more fuel types are available to add
  await energyCostsPage.assertNoAvailableFuelTypes();

});
