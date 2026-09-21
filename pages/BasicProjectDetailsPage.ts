import { Page, Locator, expect } from '@playwright/test';
import { urls } from '../test-data/urls';

/**
 * Page object representing the project creation form (/manage-project).
 * Handles entering applicant name, address, assessor, schedule date/time,
 * building configurations, and saving the new project.
 */
export class BasicProjectDetailsPage {
  private page: Page;

  // Applicant & Address fields
  firstName: Locator;
  lastName: Locator;
  assessor: Locator;
  streetAddress: Locator;
  city: Locator;
  state: Locator;
  zip: Locator;

  // Date/Time & Project Configuration fields
  projectAssessmentDateTime: Locator;
  projectType: Locator;
  buildingType: Locator;
  configuration: Locator;
  programType: Locator;

  // Submit button
  continueButton: Locator;

  /**
   * Initializes locators for all input fields on the Basic Project Details form.
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page;

    // Contact & Applicant locators
    this.firstName = page.getByRole('textbox', { name: 'First Name *' });
    this.lastName = page.getByRole('textbox', { name: 'Last Name *' });

    // Assessor combobox locator
    this.assessor = page.getByRole('combobox', { name: 'Assessor *' });

    // Google Places autocomplete address input locator
    this.streetAddress = page.getByPlaceholder('Enter project address...');

    // City, State, and Zip code locators (auto-populated by address selection)
    this.city = page.getByRole('textbox', { name: 'City *' });
    this.state = page.getByRole('textbox', { name: 'State *' });
    this.zip = page.getByRole('textbox', { name: 'Zip *' });

    // Date/Time picker group container locator
    this.projectAssessmentDateTime = page.getByRole('group', {
      name: 'Project Assessment Start Date and Time *',
    });

    // Dropdown combobox locators for project metadata
    this.projectType = page.getByRole('combobox', { name: 'Project Type *' });
    this.buildingType = page.getByRole('combobox', { name: 'Building Type *' });
    this.configuration = page.getByRole('combobox', { name: 'Configuration *' });
    this.programType = page.getByRole('combobox', { name: 'Program Type *' });

    // Continue / Submit button locator
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  /**
   * Navigates directly to the project creation page (/manage-project).
   */
  async open() {
    await this.page.goto(urls.manageProject);
  }

  /**
   * Fills the applicant's first and last name fields.
   *
   * @param data Object containing applicant first and last names
   */
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

  /**
   * Fills the Project Assessment Start Date and Time picker with tomorrow's date.
   * 1. Calculates a timestamp 24 hours into the future.
   * 2. Formats month, day, year, hour, minutes, and AM/PM meridiem.
   * 3. Selects each spinbutton within the date/time picker group and types the value.
   */
  async fillProjectAssessmentDateTime() {
    // Step 1: Calculate tomorrow's date & time
    const assessmentStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const month = String(assessmentStart.getMonth() + 1).padStart(2, '0');
    const day = String(assessmentStart.getDate()).padStart(2, '0');
    const year = String(assessmentStart.getFullYear());
    const hour = String(assessmentStart.getHours() % 12 || 12).padStart(2, '0');
    const minutes = String(assessmentStart.getMinutes()).padStart(2, '0');
    const meridiem = assessmentStart.getHours() >= 12 ? 'PM' : 'AM';

    // Step 2: Locate individual date and time sub-controls (spinbuttons)
    const monthSpin = this.projectAssessmentDateTime.getByRole('spinbutton', { name: 'Month' });
    const daySpin = this.projectAssessmentDateTime.getByRole('spinbutton', { name: 'Day' });
    const yearSpin = this.projectAssessmentDateTime.getByRole('spinbutton', { name: 'Year' });
    const hoursSpin = this.projectAssessmentDateTime.getByRole('spinbutton', { name: 'Hours' });
    const minutesSpin = this.projectAssessmentDateTime.getByRole('spinbutton', { name: 'Minutes' });
    const meridiemSpin = this.projectAssessmentDateTime.getByRole('spinbutton', { name: 'Meridiem' });

    // Step 3: Click and type into each spinbutton sequentially
    await monthSpin.click();
    await this.page.keyboard.type(month);

    await daySpin.click();
    await this.page.keyboard.type(day);

    await yearSpin.click();
    await this.page.keyboard.type(year);

    await hoursSpin.click();
    await this.page.keyboard.type(hour);

    await minutesSpin.click();
    await this.page.keyboard.type(minutes);

    await meridiemSpin.click();
    await this.page.keyboard.type(meridiem);
  }

  /**
   * Types the assessor's name and selects it from the dropdown options.
   *
   * @param assessorName Name of the assessor
   */
  async selectAssessor(assessorName: string) {
    await this.assessor.fill(assessorName);
    await this.page.getByRole('option', { name: assessorName }).click();
  }

  /**
   * Enters the street address and selects the matching Google Places autocomplete suggestion.
   *
   * @param address Full street address string
   */
  async selectStreetAddress(address: string) {
    await this.streetAddress.fill(address);

    const option = this.page.getByText(address).first();
    try {
      // Wait up to 5s for the Google Places suggestion dropdown to appear and click it
      await option.waitFor({ state: 'visible', timeout: 5000 });
      await option.click();
    } catch {
      // Fallback: press Enter if the dropdown list does not appear in time
      await this.streetAddress.press('Enter');
    }
  }

  /**
   * Verifies that the city, state, and zip fields were auto-populated correctly from the address.
   *
   * @param data Object containing expected city, state, and zip
   */
  async verifyAddressDetails(data: {
    city: string;
    state: string;
    zip: string;
  }) {
    await expect(this.city).toHaveValue(data.city);
    await expect(this.state).toHaveValue(data.state);
    await expect(this.zip).toHaveValue(data.zip);
  }

  /**
   * Selects the project type from the dropdown.
   *
   * @param projectType Type of project (e.g. 'Residential')
   */
  async selectProjectType(projectType: string) {
    await this.projectType.click();
    await this.page.getByRole('option', { name: projectType }).click();
  }

  /**
   * Selects the building type from the dropdown.
   *
   * @param buildingType Type of building (e.g. 'Townhouse')
   */
  async selectBuildingType(buildingType: string) {
    await this.buildingType.click();
    await this.page.getByRole('option', { name: buildingType }).click();
  }

  /**
   * Selects the configuration option from the dropdown.
   *
   * @param configuration Configuration name (e.g. 'EversourceUI')
   */
  async selectConfiguration(configuration: string) {
    await this.configuration.click();
    await this.page.getByRole('option', { name: configuration }).click();
  }

  /**
   * Selects the program type option from the dropdown.
   *
   * @param programType Program type name (e.g. 'HESIE')
   */
  async selectProgramType(programType: string) {
    await this.programType.click();
    await this.page.getByRole('option', { name: programType }).click();
  }

  /**
   * Submits the project form by clicking 'Continue'.
   * 1. Clicks the continue button.
   * 2. Asserts the 'Project created successfully!' notification appears.
   * 3. Confirms redirect to /project-details/:id.
   * 4. Saves the newly created project ID to a local JSON file so dependent test suites can locate it.
   */
  async continue() {
    // Step 1: Click the Continue button
    await this.continueButton.click();

    // Step 2: Verify success confirmation message
    await expect(
      this.page.getByText('Project created successfully!', {
        exact: true,
      })
    ).toBeVisible();

    // Step 3: Verify URL redirects to project-details
    await expect(this.page).toHaveURL(/project-details/, { timeout: 15_000 });

    // Step 4: Extract project ID from URL and persist for downstream tests
    const match = this.page.url().match(/\/project-details\/([a-zA-Z0-9-]+)/);
    if (match) {
      try {
        const fsSync = await import('node:fs');
        const pathSync = await import('node:path');
        const targetPath = pathSync.resolve('playwright/.auth/createdProject.json');
        fsSync.writeFileSync(targetPath, JSON.stringify({ id: match[1] }, null, 2), 'utf8');
      } catch (e) {}
    }
  }
}
