import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  ProjectDetailsPage,
  CustomerProfilePage,
} from '../pages';

import { projectData } from '../test-data/projectData';

test('Customer Profile → Add Customer Profile', async ({ page }) => {
  const projectListPage = new ProjectListPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);
  const customerProfilePage = new CustomerProfilePage(page);

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

  // Open Customer Profile
  await projectDetailsPage.openCustomerProfile();

  // Click Add Customer Profile
  await projectDetailsPage.clickAddCustomerProfile();

  // Wait for Customer Profile form
  await customerProfilePage.waitForPageReady();

  // Verify prefilled project information
  await customerProfilePage.verifyProjectData({
    firstName: projectData.firstName,
    lastName: projectData.lastName,
    streetAddress: projectData.streetAddress,
    city: projectData.city,
    state: projectData.state,
    zipCode: projectData.zip,
    buildingType: projectData.buildingType,
  });

  // Fill Applicant Information
  await customerProfilePage.fillApplicantInformation({
    secondaryProjectNumber: projectData.secondaryProjectNumber,
  });

  // Fill Contact Information
  await customerProfilePage.fillContactInformation({
    homePhone: projectData.homePhone,
    cellPhone: projectData.cellPhone,
    email: projectData.applicantEmail,
  });

  // Verify Rent/Own functionality
  // Own → Rent → Own → Rent
  await customerProfilePage.selectRent();

  await customerProfilePage.selectOwn();

  await customerProfilePage.selectRentAgain();

  // Fill Landlord Information
  await customerProfilePage.fillLandlordInformation({
    firstName: projectData.landlordFirstName,
    lastName: projectData.landlordLastName,
    address: projectData.landlordAddress,
    city: projectData.landlordCity,
    phone: projectData.landlordPhone,
  });

  // Select Utility Companies
  await customerProfilePage.selectElectricCompany(
    'Eversource'
  );

  await customerProfilePage.selectGasCompany(
    'CNG'
  );

  // Fill Utility Information
  await customerProfilePage.fillUtilityInformation({
    electricMeterNumber: projectData.electricMeterNumber,
    electricAccountNumber: projectData.electricAccountNumber,
    gasAccountNumber: projectData.gasAccountNumber,
    gasMeterNumber: projectData.gasMeterNumber,
  });

  // Save Customer Profile
  await customerProfilePage.save();

  // Wait until Project Details page is ready
  await projectDetailsPage.waitForPageReady();

  await expect(page).toHaveURL(
    /project-details/
  );

  // Open Customer Profile again
  await projectDetailsPage.openCustomerProfile();

});
