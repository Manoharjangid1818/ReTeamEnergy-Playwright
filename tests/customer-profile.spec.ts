import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  ProjectDetailsPage,
  CustomerProfilePage,
} from '../pages';

import { projectData } from '../test-data/projectData';

/**
 * End-to-end test: Customer Profile creation and verification.
 * 1. Finds and opens the project created in the initial scenario.
 * 2. Opens the Customer Profile tab and clicks 'Add Customer Profile'.
 * 3. Verifies prefilled customer and address data.
 * 4. Fills applicant information and contact numbers.
 * 5. Tests Rent/Own conditional display logic (Rent shows landlord section; Own hides it).
 * 6. Enters landlord details and utility provider numbers.
 * 7. Saves the customer profile and verifies success.
 */
test('Customer Profile → Add Customer Profile', async ({ page }) => {
  // Initialize page objects
  const projectListPage = new ProjectListPage(page);
  const projectDetailsPage = new ProjectDetailsPage(page);
  const customerProfilePage = new CustomerProfilePage(page);

  // Step 1: Navigate to home page
  await page.goto('/');
  await expect(page).toHaveURL('https://dev.reteamenergy.com/');

  // Step 2: Search for the test project by project name
  await projectListPage.searchProject(
    `${projectData.firstName} ${projectData.lastName}`
  );

  // Step 3: Open the matching project from the search results
  await projectListPage.openProject(
    projectData.streetAddress
  );

  // Step 4: Wait for Project Details screen to load
  await projectDetailsPage.waitForPageReady();
  await expect(page).toHaveURL(/project-details/);

  // Step 5: Switch to Customer Profile tab
  await projectDetailsPage.openCustomerProfile();

  // Step 6: Click 'Add Customer Profile' button
  await projectDetailsPage.clickAddCustomerProfile();

  // Step 7: Wait for Customer Profile form to render
  await customerProfilePage.waitForPageReady();

  // Step 8: Verify prefilled project data matches initial creation inputs
  await customerProfilePage.verifyProjectData({
    firstName: projectData.firstName,
    lastName: projectData.lastName,
    streetAddress: projectData.streetAddress,
    city: projectData.city,
    state: projectData.state,
    zipCode: projectData.zip,
    buildingType: projectData.buildingType,
  });

  // Step 9: Fill Applicant Information (secondary project number)
  await customerProfilePage.fillApplicantInformation({
    secondaryProjectNumber: projectData.secondaryProjectNumber,
  });

  // Step 10: Fill Contact Information (home phone, cell phone, email)
  await customerProfilePage.fillContactInformation({
    homePhone: projectData.homePhone,
    cellPhone: projectData.cellPhone,
    email: projectData.applicantEmail,
  });

  // Step 11: Verify Rent/Own toggle logic (Rent shows landlord form, Own hides it)
  await customerProfilePage.selectRent();
  await customerProfilePage.selectOwn();
  await customerProfilePage.selectRentAgain();

  // Step 12: Fill Landlord Information with address autocomplete
  await customerProfilePage.fillLandlordInformation({
    firstName: projectData.landlordFirstName,
    lastName: projectData.landlordLastName,
    address: projectData.landlordAddress,
    city: projectData.landlordCity,
    phone: projectData.landlordPhone,
  });

  // Step 13: Select utility companies
  await customerProfilePage.selectElectricCompany('Eversource');
  await customerProfilePage.selectGasCompany('CNG');

  // Step 14: Fill utility account and meter numbers
  await customerProfilePage.fillUtilityInformation({
    electricMeterNumber: projectData.electricMeterNumber,
    electricAccountNumber: projectData.electricAccountNumber,
    gasAccountNumber: projectData.gasAccountNumber,
    gasMeterNumber: projectData.gasMeterNumber,
  });

  // Step 15: Save the customer profile and verify confirmation message
  await customerProfilePage.save();

  // Step 16: Ensure redirect back to Project Details and reopen profile to verify state
  await projectDetailsPage.waitForPageReady();
  await expect(page).toHaveURL(/project-details/);
  await projectDetailsPage.openCustomerProfile();
});
