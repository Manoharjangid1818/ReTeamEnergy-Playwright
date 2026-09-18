import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  ProjectDetailsPage,
  PropertyProfilePage,
} from '../pages';

import { projectData } from '../test-data/projectData';

test('Property Profile → Add Property Profile', async ({ page }) => {
  const projectListPage = new ProjectListPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);
  const propertyProfilePage = new PropertyProfilePage(page);

  await page.goto('/');

  // Verify My Projects page
  await expect(page).toHaveURL(
    'https://dev.reteamenergy.com/'
  );

  // Search project created in Scenario 1
  await projectListPage.searchProject(
    `${projectData.firstName} ${projectData.lastName}`
  );

  // Open project
  await projectListPage.openProject(
    projectData.streetAddress
  );

  // Wait for Project Details
  await projectDetailsPage.waitForPageReady();

  await expect(page).toHaveURL(
    /project-details/
  );

  // Open Property Profile
  await projectDetailsPage.openPropertyProfile();

  // Click Add Property Profile
  await projectDetailsPage.clickAddPropertyProfile();

  // Wait for Property Profile form
  await propertyProfilePage.waitForPageReady();

  // Property Details
  await propertyProfilePage.selectRentOrOwn(
    projectData.rentOrOwn
  );

  await propertyProfilePage.selectBuildingType(
    projectData.buildingType
  );

  await propertyProfilePage.selectHouseType(
    projectData.houseType
  );

  await propertyProfilePage.selectHomeOrientation(
    projectData.homeOrientation
  );

  await propertyProfilePage.selectNumberOfAttachedSides(
    projectData.numberofattachedsides
  );

  await propertyProfilePage.fillYearBuilt(
    projectData.yearBuilt
  );

  // Square Footage & Height
  await propertyProfilePage.selectNumberOfFloorsAboveGrade(
    projectData.numberOfFloorsAboveGrade
  );

  await propertyProfilePage.fillHeatedAboveGradeSquareFeet(
    projectData.heatedAboveGradeSquareFeet
  );

  await propertyProfilePage.fillAboveGradeCeilingHeight(
    projectData.aboveGradeCeilingHeight
  );

  // Basement
  await propertyProfilePage.selectBasementType(
    projectData.basementType
  );

  await propertyProfilePage.fillBasementSquareFeet(
    projectData.basementSquareFeet
  );

  await propertyProfilePage.fillHeatedBasementSquareFeet(
    projectData.heateBasementSquareFeet
  );

  await propertyProfilePage.fillBasementCeilingHeight(
    projectData.basementCeilingHeight
  );

  // Occupancy
  await propertyProfilePage.fillNumberOfOccupants(
    projectData.numberoOfOccupants
  );

  await propertyProfilePage.fillNumberOfBedrooms(
    projectData.numberOfBedrooms
  );

  await propertyProfilePage.fillOutsideTemperature(
    projectData.outsideTemperature
  );

  // Heating
  await propertyProfilePage.selectHeatingType(
    projectData.heatingtype
  );

  await propertyProfilePage.selectPrimaryHeatingFuel(
    projectData.primaryheatingfuel
  );

  await propertyProfilePage.selectSecondaryHeatingFuel(
    projectData.secondaryheatingfuel
  );

  // Cooling
  await propertyProfilePage.selectCoolingType(
    projectData.coolingtype
  );

  await propertyProfilePage.selectCentralAcPresent(
    projectData.centralacpresent
  );

  await propertyProfilePage.selectDuctworkPresent(
    projectData.ductworkpresent
  );

  // DHW Fuel
  await propertyProfilePage.selectPrimaryDhwFuel(
    projectData.primarydhwfuel
  );

  // Verify Calculated Values
  await propertyProfilePage.verifyTotalHeatedSquareFeet(
    projectData.expectedTotalHeatedSquareFeet
  );

  await propertyProfilePage.verifyTotalHeatedVolume(
    projectData.expectedTotalHeatedVolume
  );

  await propertyProfilePage.verifyMVG(
    projectData.expectedMVG
  );

  // Save Property Profile
  await propertyProfilePage.clickSave();

  // Wait until Project Details page is ready
  await projectDetailsPage.waitForPageReady();

  await expect(page).toHaveURL(
    /project-details/
  );

  // Open Property Profile again
  await projectDetailsPage.openPropertyProfile();

});
