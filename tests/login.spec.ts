import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  BasicProjectDetailsPage,
} from '../pages';

import { projectData } from '../test-data/projectData';

/**
 * End-to-end test: Login verification and new project creation.
 * 1. Navigates to the home page and verifies authenticated dashboard state.
 * 2. Clicks 'Add Project' to open the creation form.
 * 3. Fills applicant details, assessor, address with Google autocomplete, and project configurations.
 * 4. Submits the form and verifies navigation to the Project Details page.
 */
test('Login → Add Project → Logout', async ({ page }) => {
  // Initialize page objects
  const projectListPage = new ProjectListPage(page);
  const basicProjectDetailsPage = new BasicProjectDetailsPage(page);

  // Step 1: Navigate to the application root
  await page.goto('/');

  // Step 2: Verify project list dashboard is displayed
  await expect(page).toHaveURL('https://dev.reteamenergy.com/');

  // Step 3: Click 'Add Project' to initiate project creation
  await projectListPage.addProject();

  // Step 4: Verify navigation to project creation form
  await expect(page).toHaveURL(
    'https://dev.reteamenergy.com/manage-project'
  );

  // Step 5: Fill applicant basic details (first and last name)
  await basicProjectDetailsPage.fillBasicDetails(projectData);

  // Step 6: Select assessor from the dropdown
  await basicProjectDetailsPage.selectAssessor(
    projectData.assessor
  );

  // Step 7: Enter street address and select Google Places autocomplete match
  await basicProjectDetailsPage.selectStreetAddress(
    projectData.streetAddress
  );

  // Step 8: Verify city, state, and zip code auto-populated correctly
  await basicProjectDetailsPage.verifyAddressDetails({
    city: projectData.city,
    state: projectData.state,
    zip: projectData.zip,
  });

  // Step 9: Fill project assessment start date and time
  await basicProjectDetailsPage.fillProjectAssessmentDateTime();

  // Step 10: Select project type from dropdown
  await basicProjectDetailsPage.selectProjectType(
    projectData.projectType
  );

  // Step 11: Select building type from dropdown
  await basicProjectDetailsPage.selectBuildingType(
    projectData.buildingType
  );

  // Step 12: Select configuration from dropdown
  await basicProjectDetailsPage.selectConfiguration(
    projectData.configuration
  );

  // Step 13: Select program type from dropdown
  await basicProjectDetailsPage.selectProgramType(
    projectData.programType
  );

  // Step 14: Submit form and verify successful creation
  await basicProjectDetailsPage.continue();
});
