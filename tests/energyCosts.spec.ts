import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  EnergyCostsPage,
} from '../pages';

import { projectData } from '../test-data/projectData';

/**
 * End-to-end test: Fuel Costs management under Energy Costs.
 * 1. Searches and opens the existing project.
 * 2. Navigates to the Energy Costs tab.
 * 3. Deletes any pre-existing fuel costs to ensure a clean starting state.
 * 4. Iterates through all defined fuel cost types, adds each one, and asserts its calculation.
 * 5. Verifies that all available fuel types have been added and the dropdown is exhausted.
 */
test('Energy Costs → Add Fuel Costs', async ({ page }) => {
  // Allow ample time for deleting multiple existing rows and adding each fuel type
  test.setTimeout(90_000);

  // Initialize page objects
  const projectListPage = new ProjectListPage(page);
  const energyCostsPage = new EnergyCostsPage(page);

  // Step 1: Navigate to home page
  await page.goto('/');
  await expect(page).toHaveURL('https://dev.reteamenergy.com/');

  // Step 2: Search for the target project
  await projectListPage.searchProject(
    `${projectData.firstName} ${projectData.lastName}`
  );

  // Step 3: Open the matching project
  await projectListPage.openProject(
    projectData.streetAddress
  );

  // Step 4: Switch to the Energy Costs tab
  await energyCostsPage.openEnergyCosts();
  await energyCostsPage.waitForPageReady();

  // Step 5: Clean up any existing fuel costs so the test starts from an empty table
  await energyCostsPage.deleteAllFuelCosts();

  // Step 6: Loop through each fuel cost definition in test data and add it
  for (const fuelCost of projectData.fuelCosts) {
    await energyCostsPage.openAddFuelCost();

    // Check if this fuel type is still available to select
    const isAvailable = await energyCostsPage.isFuelTypeAvailable(
      fuelCost.fuelType
    );

    if (!isAvailable) {
      await energyCostsPage.cancelAddFuelCost();
      continue;
    }

    // Enter values, submit, and verify table row
    await energyCostsPage.addFuelCost(fuelCost);
  }

  // Step 7: Confirm that all fuel types have been added and none remain in the dropdown
  await energyCostsPage.assertNoAvailableFuelTypes();
});
