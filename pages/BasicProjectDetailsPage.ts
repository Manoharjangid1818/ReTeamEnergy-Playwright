import { Page, Locator, expect } from '@playwright/test';
import { urls } from '../test-data/urls';

export class BasicProjectDetailsPage {
  private page: Page;

  firstName: Locator;
  lastName: Locator;
  assessor: Locator;
  streetAddress: Locator;
  city: Locator;
  state: Locator;
  zip: Locator;

  projectAssessmentDateTime: Locator;
  projectType: Locator;
  buildingType: Locator;
  configuration: Locator;
  programType: Locator;

  continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstName = page.getByRole('textbox', { name: 'First Name *' });
    this.lastName = page.getByRole('textbox', { name: 'Last Name *' });

    this.assessor = page.getByRole('combobox', { name: 'Assessor *' });
    this.streetAddress = page.getByPlaceholder('Enter project address...');

    this.city = page.getByRole('textbox', { name: 'City *' });
    this.state = page.getByRole('textbox', { name: 'State *' });
    this.zip = page.getByRole('textbox', { name: 'Zip *' });

    this.projectAssessmentDateTime = page.getByRole('group', { name: 'Project Assessment Start Date and Time *',})
    this.projectType = page.getByRole('combobox', { name: 'Project Type *' });
    this.buildingType = page.getByRole('combobox', { name: 'Building Type *' });
    this.configuration = page.getByRole('combobox', { name: 'Configuration *' });
    this.programType = page.getByRole('combobox', { name: 'Program Type *' });

    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async open() {
    await this.page.goto(urls.manageProject);
  }

  async fillBasicDetails(data: {
    firstName: string;
    lastName: string;
    assessor: string;
    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    projectType: string;
    buildingType: string;
    configuration: string;
    programType: string;
  }) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
  }

  async fillProjectAssessmentDateTime() {
    // The form rejects an assessment start time that is not in the future.
    // One minute is enough to satisfy the validation without scheduling the
    // project for a different day.
    const assessmentStart = new Date(Date.now() + 60_000);
    const month = String(assessmentStart.getMonth() + 1).padStart(2, '0');
    const day = String(assessmentStart.getDate()).padStart(2, '0');
    const year = assessmentStart.getFullYear();
    const hour = assessmentStart.getHours() % 12 || 12;
    const minutes = String(assessmentStart.getMinutes()).padStart(2, '0');
    const meridiem = assessmentStart.getHours() >= 12 ? 'PM' : 'AM';
    const dateTime = `${month}/${day}/${year} ${hour}:${minutes} ${meridiem}`;

    await this.projectAssessmentDateTime.click();
    await this.page.keyboard.type(dateTime);
  }

  async selectAssessor(assessorName: string) {
    await this.assessor.fill(assessorName);

    await this.page.getByRole('option',{ name: assessorName }).click();
  }

  async selectStreetAddress(address: string) {
    await this.streetAddress.fill(address);

    // Wait for address suggestions to appear
    await this.page.waitForTimeout(1000);

    // Select the address using Enter
    await this.streetAddress.press('Enter');
  }

  async verifyAddressDetails(data: {
    city: string;
    state: string;
    zip: string;
    }) {
        await expect(this.city).toHaveValue(data.city);
        await expect(this.state).toHaveValue(data.state);
        await expect(this.zip).toHaveValue(data.zip);
    }

  async selectProjectType(projectType: string) {
    await this.projectType.click();

    await this.page.getByRole('option', {name: projectType }).click();
  }

  async selectBuildingType(buildingType: string) {
    await this.buildingType.click();

    await this.page
        .getByRole('option', { name: buildingType })
        .click();
  }

  async selectConfiguration(configuration: string) {
    await this.configuration.click();

    await this.page
        .getByRole('option', { name: configuration })
        .click();
  }

  async selectProgramType(programType: string) {
    await this.programType.click();

    await this.page
        .getByRole('option', { name: programType })
        .click();
  }

  async continue() {
    await this.continueButton.click();
    await expect(
      this.page.getByText('Project created successfully!', {
        exact: true,
      })
    ).toBeVisible();
  }
}
