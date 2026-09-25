import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  ProjectDetailsPage,
  PropertyProfilePage,
} from '../pages';

import { projectIdentityData } from '../test-data/commonTestData';
import { projectListPageData } from '../test-data/projectListPageData';
import { propertyProfileData } from '../test-data/propertyProfileData';

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

  // Step 2: Search for the target project by project name
  await projectListPage.searchProject(
    projectListPageData.projectName
  );

  // Step 3: Open the matching project
  await projectListPage.openProject(
    projectListPageData.projectAddress
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
  await propertyProfilePage.selectRentOrOwn(propertyProfileData.rentOrOwn);
  await propertyProfilePage.selectBuildingType(projectIdentityData.buildingType);
  await propertyProfilePage.selectHouseType(propertyProfileData.houseType);
  await propertyProfilePage.selectHomeOrientation(propertyProfileData.homeOrientation);
  await propertyProfilePage.selectNumberOfAttachedSides(propertyProfileData.numberOfAttachedSides);
  await propertyProfilePage.fillYearBuilt(propertyProfileData.yearBuilt);

  // Step 9: Fill Square Footage & Ceiling Height
  await propertyProfilePage.selectNumberOfFloorsAboveGrade(propertyProfileData.numberOfFloorsAboveGrade);
  await propertyProfilePage.fillHeatedAboveGradeSquareFeet(propertyProfileData.heatedAboveGradeSquareFeet);
  await propertyProfilePage.fillAboveGradeCeilingHeight(propertyProfileData.aboveGradeCeilingHeight);

  // Step 10: Fill Basement specifications
  await propertyProfilePage.selectBasementType(propertyProfileData.basementType);
  await propertyProfilePage.fillBasementSquareFeet(propertyProfileData.basementSquareFeet);
  await propertyProfilePage.fillHeatedBasementSquareFeet(propertyProfileData.heatedBasementSquareFeet);
  await propertyProfilePage.fillBasementCeilingHeight(propertyProfileData.basementCeilingHeight);

  // Step 11: Fill Occupancy and ambient temperature
  await propertyProfilePage.fillNumberOfOccupants(propertyProfileData.numberOfOccupants);
  await propertyProfilePage.fillNumberOfBedrooms(propertyProfileData.numberOfBedrooms);
  await propertyProfilePage.fillOutsideTemperature(propertyProfileData.outsideTemperature);

  // Step 12: Fill Heating specifications
  await propertyProfilePage.selectHeatingType(propertyProfileData.heatingType);
  await propertyProfilePage.selectPrimaryHeatingFuel(propertyProfileData.primaryHeatingFuel);
  await propertyProfilePage.selectSecondaryHeatingFuel(propertyProfileData.secondaryHeatingFuel);

  // Step 13: Fill Cooling specifications
  await propertyProfilePage.selectCoolingType(propertyProfileData.coolingType);
  await propertyProfilePage.selectCentralAcPresent(propertyProfileData.centralAcPresent);
  await propertyProfilePage.selectDuctworkPresent(propertyProfileData.ductworkPresent);

  // Step 14: Fill Domestic Hot Water (DHW) fuel
  await propertyProfilePage.selectPrimaryDhwFuel(propertyProfileData.primaryDhwFuel);

  // Step 15: Verify system-calculated engineering values
  await propertyProfilePage.verifyTotalHeatedSquareFeet(
    propertyProfileData.expectedTotalHeatedSquareFeet
  );
  await propertyProfilePage.verifyTotalHeatedVolume(
    propertyProfileData.expectedTotalHeatedVolume
  );
  await propertyProfilePage.verifyMVG(
    propertyProfileData.expectedMVG
  );

  // Step 16: Save Property Profile
  await propertyProfilePage.clickSave();

  // Step 17: Wait until Project Details page reloads and re-verify profile tab
  await projectDetailsPage.waitForPageReady();
  await expect(page).toHaveURL(/project-details/);
  await projectDetailsPage.openPropertyProfile();
});
