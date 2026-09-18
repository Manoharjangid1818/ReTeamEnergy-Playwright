import { test, expect } from '@playwright/test';

import {
  ProjectListPage,
  BasicProjectDetailsPage,
} from '../pages';

import { projectData } from '../test-data/projectData';

test('Login → Add Project → Logout', async ({ page }) => {

  const projectListPage = new ProjectListPage(page);
  const basicProjectDetailsPage = new BasicProjectDetailsPage(page);

  await page.goto('/');

  // Verify project list/home page
  await expect(page).toHaveURL('https://dev.reteamenergy.com/');

  // Add Project
  await projectListPage.addProject();

  // Verify Basic Project Details page
  await expect(page).toHaveURL(
    'https://dev.reteamenergy.com/manage-project'
  );

  await basicProjectDetailsPage.fillBasicDetails(projectData);

  await basicProjectDetailsPage.selectAssessor(
    projectData.assessor
  );

  console.log('Before Street Address');

  await basicProjectDetailsPage.selectStreetAddress(
    projectData.streetAddress
  );

  console.log('After Street Address');

  await basicProjectDetailsPage.verifyAddressDetails({
    city: projectData.city,
    state: projectData.state,
    zip: projectData.zip,
  });

  await basicProjectDetailsPage.fillProjectAssessmentDateTime();

  await basicProjectDetailsPage.selectProjectType(
    projectData.projectType
  );

  await basicProjectDetailsPage.selectBuildingType(
    projectData.buildingType
  );

  await basicProjectDetailsPage.selectConfiguration(
    projectData.configuration
  );

  await basicProjectDetailsPage.selectProgramType(
    projectData.programType
  );

  await basicProjectDetailsPage.continue();

});
