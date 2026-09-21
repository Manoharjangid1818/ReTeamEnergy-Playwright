import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  ProjectDetailsPage,
  PropertyProfilePage,
} from '../pages';

import { projectData } from '../test-data/projectData';

/**
 * End-to-end test: Property Profile creation and calculation verification.
 * 1. Searches and opens the existing project.
 * 2. Navigates to the Property Profile tab and opens the form.
 * 3. Fills building attributes, dimensions, basement, occupancy, and HVAC specs.
 * 4. Verifies system-calculated metrics (Total Heated Square Feet, Total Heated Volume, MVG).
 * 5. Saves the property profile and verifies persistence.
 */
test('Property Profile → Add Property Profile', async ({ page }) => {
  // Initialize page objects
  const projectListPage = new ProjectListPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);
  const propertyProfilePage = new PropertyProfilePage(page);

  // Step 1: Navigate to the application home page
  await page.goto('/');
  await expect(page).toHaveURL('https://dev.reteamenergy.com/');

  // Step 2: Search for the target project by automatically captured ID or customer name
  const savedProjectId = ProjectListPage.getSavedProjectId();
  await projectListPage.searchProject(
    savedProjectId || `${projectData.firstName} ${projectData.lastName}`
  );

  // Step 3: Open the matching project
  await projectListPage.openProject(
    savedProjectId || projectData.streetAddress
  );

  // Step 4: Wait for Project Details page to be ready
  await projectDetailsPage.waitForPageReady();
  await expect(page).toHaveURL(/project-details/);

  // Step 5: Switch to Property Profile tab
  await projectDetailsPage.openPropertyProfile();

  // Step 6: Click 'Add Property Profile' button
  await projectDetailsPage.clickAddPropertyProfile();

  // Step 7: Wait for the Property Profile form to load
  await propertyProfilePage.waitForPageReady();

  // Step 8: Fill Property Details (ownership, building type, orientation, year built)
  await propertyProfilePage.selectRentOrOwn(projectData.rentOrOwn);
  await propertyProfilePage.selectBuildingType(projectData.buildingType);
  await propertyProfilePage.selectHouseType(projectData.houseType);
  await propertyProfilePage.selectHomeOrientation(projectData.homeOrientation);
  await propertyProfilePage.selectNumberOfAttachedSides(projectData.numberofattachedsides);
  await propertyProfilePage.fillYearBuilt(projectData.yearBuilt);

  // Step 9: Fill Square Footage & Ceiling Height
  await propertyProfilePage.selectNumberOfFloorsAboveGrade(projectData.numberOfFloorsAboveGrade);
  await propertyProfilePage.fillHeatedAboveGradeSquareFeet(projectData.heatedAboveGradeSquareFeet);
  await propertyProfilePage.fillAboveGradeCeilingHeight(projectData.aboveGradeCeilingHeight);

  // Step 10: Fill Basement specifications
  await propertyProfilePage.selectBasementType(projectData.basementType);
  await propertyProfilePage.fillBasementSquareFeet(projectData.basementSquareFeet);
  await propertyProfilePage.fillHeatedBasementSquareFeet(projectData.heateBasementSquareFeet);
  await propertyProfilePage.fillBasementCeilingHeight(projectData.basementCeilingHeight);

  // Step 11: Fill Occupancy and ambient temperature
  await propertyProfilePage.fillNumberOfOccupants(projectData.numberoOfOccupants);
  await propertyProfilePage.fillNumberOfBedrooms(projectData.numberOfBedrooms);
  await propertyProfilePage.fillOutsideTemperature(projectData.outsideTemperature);

  // Step 12: Fill Heating specifications
  await propertyProfilePage.selectHeatingType(projectData.heatingtype);
  await propertyProfilePage.selectPrimaryHeatingFuel(projectData.primaryheatingfuel);
  await propertyProfilePage.selectSecondaryHeatingFuel(projectData.secondaryheatingfuel);

  // Step 13: Fill Cooling specifications
  await propertyProfilePage.selectCoolingType(projectData.coolingtype);
  await propertyProfilePage.selectCentralAcPresent(projectData.centralacpresent);
  await propertyProfilePage.selectDuctworkPresent(projectData.ductworkpresent);

  // Step 14: Fill Domestic Hot Water (DHW) fuel
  await propertyProfilePage.selectPrimaryDhwFuel(projectData.primarydhwfuel);

  // Step 15: Verify system-calculated engineering values
  await propertyProfilePage.verifyTotalHeatedSquareFeet(
    projectData.expectedTotalHeatedSquareFeet
  );
  await propertyProfilePage.verifyTotalHeatedVolume(
    projectData.expectedTotalHeatedVolume
  );
  await propertyProfilePage.verifyMVG(
    projectData.expectedMVG
  );

  // Step 16: Save Property Profile
  await propertyProfilePage.clickSave();

  // Step 17: Wait until Project Details page reloads and re-verify profile tab
  await projectDetailsPage.waitForPageReady();
  await expect(page).toHaveURL(/project-details/);
  await projectDetailsPage.openPropertyProfile();
});
