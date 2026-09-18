import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CustomerProfilePage extends BasePage {
  // Existing / prefilled fields
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly streetAddressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly buildingTypeSelect: Locator;

  // Applicant Information
  readonly secondaryProjectNumberInput: Locator;

  // Contact Information
  readonly homePhoneInput: Locator;
  readonly cellPhoneInput: Locator;
  readonly applicantEmailInput: Locator;

  // Property Information
  readonly rentOwnSelect: Locator;

  // Utility Information
  readonly electricCompanySelect: Locator;
  readonly electricMeterNumberInput: Locator;
  readonly electricAccountNumberInput: Locator;
  readonly gasAccountNumberInput: Locator;
  readonly gasMeterNumberInput: Locator;
  readonly gasCompanySelect: Locator;

  // Program
  readonly programTypeInput: Locator;

  // Landlord Information
  readonly landlordFirstNameInput: Locator;
  readonly landlordLastNameInput: Locator;
  readonly landlordAddressInput: Locator;
  readonly landlordCityInput: Locator;
  readonly landlordPhoneInput: Locator;

  // Save
  readonly saveButton: Locator;

  // Page sections
  readonly applicantInformationHeading: Locator;
  readonly propertyInformationHeading: Locator;
  readonly utilityInformationHeading: Locator;
  readonly landlordInformationHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Existing / Prefilled Fields
    this.firstNameInput = page.locator(
      '#field-first_name input'
    );

    this.lastNameInput = page.locator(
      '#field-last_name input'
    );

    this.streetAddressInput = page.locator(
      '#field-service_address input'
    );

    this.cityInput = page.locator(
      '#field-city input'
    );

    this.stateInput = page.locator(
      '#field-state input'
    );

    this.zipCodeInput = page.locator(
      '#field-zip input'
    );

    this.buildingTypeSelect = page.locator(
      '#field-building_type [role="combobox"]'
    );

    // Applicant Information
    this.secondaryProjectNumberInput = page.locator(
      '#field-secondary_project_number input'
    );

    // Contact Information
    this.homePhoneInput = page.locator(
      '#field-home_phone input[type="tel"]'
    );

    this.cellPhoneInput = page.locator(
      '#field-cell_phone input[type="tel"]'
    );

    this.applicantEmailInput = page.locator(
      '#field-email input'
    );

    // Property Information
    this.rentOwnSelect = page.locator(
      '#field-rent_or_own [role="combobox"]'
    );

    // Utility Information
    this.electricCompanySelect = page.locator(
      '#field-electric_company [role="combobox"]'
    );

    this.electricMeterNumberInput = page.locator(
      '#field-electric_meter_number input'
    );

    this.electricAccountNumberInput = page.locator(
      '#field-electric_account_number input'
    );

    this.gasAccountNumberInput = page.locator(
      '#field-gas_account_number input'
    );

    this.gasMeterNumberInput = page.locator(
      '#field-gas_meter_number input'
    );

    this.gasCompanySelect = page.locator(
      '#field-gas_company [role="combobox"]'
    );

    // Program
    this.programTypeInput = page.locator(
      '#field-program_type input'
    );

    // Landlord Information
    this.landlordFirstNameInput = page.locator(
      '#field-landlord_first_name input'
    );

    this.landlordLastNameInput = page.locator(
      '#field-landlord_last_name input'
    );

    this.landlordAddressInput = page.locator(
      '#field-landlord_address input'
    );

    this.landlordCityInput = page.locator(
      '#field-landlord_city input'
    );

    this.landlordPhoneInput = page.locator(
      '#field-landlord_phone_number input[type="tel"]'
    );

    // Save
    this.saveButton = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });

    // Section Headings
    this.applicantInformationHeading = page.getByText(
      'Applicant Information',
      { exact: true }
    );

    this.propertyInformationHeading = page.getByText(
      'Property Information',
      { exact: true }
    );

    this.utilityInformationHeading = page.getByText(
      'Utility Information',
      { exact: true }
    );

    this.landlordInformationHeading = page.getByText(
      'Landlord Information',
      { exact: true }
    );
  }

  async waitForPageReady() {
    await this.verifyVisible(
      this.applicantInformationHeading
    );

    await this.verifyVisible(
      this.firstNameInput
    );

    await this.verifyVisible(
      this.saveButton
    );
  }

  async verifyProjectData(projectData: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    buildingType: string;
  }) {
    await this.verifyInputValue(
      this.firstNameInput,
      projectData.firstName
    );

    await this.verifyInputValue(
      this.lastNameInput,
      projectData.lastName
    );

    await this.verifyInputValue(
      this.streetAddressInput,
      projectData.streetAddress
    );

    await this.verifyInputValue(
      this.cityInput,
      projectData.city
    );

    await this.verifyInputValue(
      this.stateInput,
      projectData.state
    );

    await this.verifyInputValue(
      this.zipCodeInput,
      projectData.zipCode
    );

    await expect(this.buildingTypeSelect).toHaveText(
      projectData.buildingType,
      { ignoreCase: true }
    );
  }

  // Applicant Information

  async fillApplicantInformation(data: {
    secondaryProjectNumber: string;
  }) {
    await this.fillInput(
      this.secondaryProjectNumberInput,
      data.secondaryProjectNumber
    );
  }

  // Contact Information

  async fillContactInformation(data: {
    homePhone: string;
    cellPhone: string;
    email: string;
  }) {
    await this.fillInput(
      this.homePhoneInput,
      data.homePhone
    );

    await this.fillInput(
      this.cellPhoneInput,
      data.cellPhone
    );

    await this.fillInput(
      this.applicantEmailInput,
      data.email
    );
  }

  // Property Information

  async selectRentOrOwn(value: string) {
    await this.selectDropdown(
      this.rentOwnSelect,
      value
    );
  }

  async selectRent() {
    await this.selectRentOrOwn('Rent');

    await this.verifyVisible(
      this.landlordInformationHeading
    );
  }

  async selectOwn() {
    await this.selectRentOrOwn('Own');

    await expect(
      this.landlordInformationHeading
    ).toBeHidden();
  }

  async selectRentAgain() {
    await this.selectRentOrOwn('Rent');

    await this.verifyVisible(
      this.landlordInformationHeading
    );
  }

  // Landlord Information

  async fillLandlordInformation(data: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    phone: string;
  }) {
    await this.fillInput(
      this.landlordFirstNameInput,
      data.firstName
    );

    await this.fillInput(
      this.landlordLastNameInput,
      data.lastName
    );

    // Same address autocomplete behavior as Scenario 1
    await this.fillInput(
      this.landlordAddressInput,
      data.address
    );

    const addressSuggestion = this.page.getByText(
      data.address,
      { exact: true }
    );

    await this.verifyVisible(
      addressSuggestion
    );

    await addressSuggestion.click();

    await this.landlordAddressInput.press('Enter');

    // Verify city is automatically populated
    await this.verifyInputValue(
      this.landlordCityInput,
      data.city
    );

    await this.fillInput(
      this.landlordPhoneInput,
      data.phone
    );
  }

  // Utility Information

  async selectElectricCompany(company: string) {
    await this.selectDropdown(
      this.electricCompanySelect,
      company
    );

    await expect(
      this.electricCompanySelect
    ).toHaveText(company);
  }

  async fillUtilityInformation(data: {
    electricMeterNumber: string;
    electricAccountNumber: string;
    gasAccountNumber: string;
    gasMeterNumber: string;
  }) {
    await this.fillInput(
      this.electricMeterNumberInput,
      data.electricMeterNumber
    );

    await this.fillInput(
      this.electricAccountNumberInput,
      data.electricAccountNumber
    );

    await this.fillInput(
      this.gasAccountNumberInput,
      data.gasAccountNumber
    );

    await this.fillInput(
      this.gasMeterNumberInput,
      data.gasMeterNumber
    );
  }

  async selectGasCompany(company: string) {
    await this.selectDropdown(
      this.gasCompanySelect,
      company
    );

    await expect(
      this.gasCompanySelect
    ).toHaveText(company);
  }

  // Save

  async save() {
    await this.clickButton(
      this.saveButton
    );

    await expect(
      this.page.getByText(
        'Client info saved successfully!',
        { exact: true }
      )
    ).toBeVisible();
  }
}