import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object representing the Property Profile form under Project Details.
 * Handles entering house dimensions, floors, basement, HVAC specifications,
 * occupancy details, and verifying calculated engineering metrics (e.g. heated sq ft, volume, MVG).
 */
export class PropertyProfilePage extends BasePage {
  // Property Details Section
  readonly addPropertyProfileHeading: Locator;
  readonly rentOwnSelect: Locator;
  readonly buildingTypeSelect: Locator;
  readonly houseTypeSelect: Locator;
  readonly homeOrientationSelect: Locator;
  readonly numberOfAttachedSidesSelect: Locator;
  readonly yearBuiltInput: Locator;

  // Square Footage & Height Section
  readonly numberOfFloorsAboveGradeSelect: Locator;
  readonly heatedAboveGradeSquareFeetInput: Locator;
  readonly aboveGradeCeilingHeightInput: Locator;

  // Basement Section
  readonly basementTypeSelect: Locator;
  readonly basementSquareFeetInput: Locator;
  readonly heatedBasementSquareFeetInput: Locator;
  readonly basementCeilingHeightInput: Locator;

  // Occupancy Section
  readonly numberOfOccupantsInput: Locator;
  readonly numberOfBedroomsInput: Locator;
  readonly outsideTemperatureInput: Locator;

  // Heating Section
  readonly heatingTypeSelect: Locator;
  readonly primaryHeatingFuelSelect: Locator;
  readonly secondaryHeatingFuelSelect: Locator;

  // Cooling Section
  readonly coolingTypeSelect: Locator;
  readonly centralAcPresentSelect: Locator;
  readonly ductworkPresentSelect: Locator;

  // DHW Fuel Section
  readonly primaryDhwFuelSelect: Locator;

  // Calculated Values Section
  readonly totalHeatedSquareFeetInput: Locator;
  readonly totalHeatedVolumeInput: Locator;
  readonly mvgInput: Locator;

  // Save Button
  readonly saveButton: Locator;

  /**
   * Initializes locators for all fields on the Property Profile form.
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    super(page);

    // Main form heading
    this.addPropertyProfileHeading = page.getByRole('heading', {
      name: 'Add Property Profile',
      exact: true,
    });

    // Property Details
    this.rentOwnSelect = page.locator('#field-rent_or_own [role="combobox"]');
    this.buildingTypeSelect = page.locator('#field-residence_type [role="combobox"]');
    this.houseTypeSelect = page.locator('#field-house_type [role="combobox"]');
    this.homeOrientationSelect = page.locator('#field-home_orientation [role="combobox"]');
    this.numberOfAttachedSidesSelect = page.locator('#field-number_of_attached_sides [role="combobox"]');
    this.yearBuiltInput = page.locator('#field-year_built input');

    // Square Footage & Height
    this.numberOfFloorsAboveGradeSelect = page.locator('#field-number_of_floors_above_grade [role="combobox"]');
    this.heatedAboveGradeSquareFeetInput = page.locator('#field-heated_above_grade_square_feet input');
    this.aboveGradeCeilingHeightInput = page.locator('#field-above_grade_ceiling_height input');

    // Basement
    this.basementTypeSelect = page.locator('#field-basement_type [role="combobox"]');
    this.basementSquareFeetInput = page.locator('#field-basement_square_feet input');
    this.heatedBasementSquareFeetInput = page.locator('#field-heated_basement_square_feet input');
    this.basementCeilingHeightInput = page.locator('#field-basement_ceiling_height input');

    // Occupancy
    this.numberOfOccupantsInput = page.locator('#field-number_of_occupants input');
    this.numberOfBedroomsInput = page.locator('#field-number_of_bedrooms input');
    this.outsideTemperatureInput = page.locator('#field-outside_temperature input');

    // Heating
    this.heatingTypeSelect = page.locator('#field-heating_type [role="combobox"]');
    this.primaryHeatingFuelSelect = page.locator('#field-primary_heating_fuel [role="combobox"]');
    this.secondaryHeatingFuelSelect = page.locator('#field-secondary_heating_fuel [role="combobox"]');

    // Cooling
    this.coolingTypeSelect = page.locator('#field-cooling_type [role="combobox"]');
    this.centralAcPresentSelect = page.locator('#field-central_ac_present [role="combobox"]');
    this.ductworkPresentSelect = page.locator('#field-ductwork_present [role="combobox"]');

    // DHW (Domestic Hot Water) Fuel
    this.primaryDhwFuelSelect = page.locator('#field-primary_dhw_fuel [role="combobox"]');

    // Calculated Values (auto-computed by the application based on inputs)
    this.totalHeatedSquareFeetInput = page.locator('#field-total_heated_square_feet input');
    this.totalHeatedVolumeInput = page.locator('#field-total_heated_volume input');
    this.mvgInput = page.locator('#field-minimum_ventilation_guideline input');

    // Save Button
    this.saveButton = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
  }

  /**
   * Waits for the Property Profile form to finish rendering.
   */
  async waitForPageReady() {
    await this.addPropertyProfileHeading.waitFor({
      state: 'visible',
    });

    await this.rentOwnSelect.waitFor({
      state: 'visible',
    });
  }

  // ---------- Property Details ----------

  /** Selects 'Rent' or 'Own' from the dropdown */
  async selectRentOrOwn(value: string) {
    await this.selectDropdown(this.rentOwnSelect, value);
  }

  /** Selects residence / building type (e.g. 'Townhouse') */
  async selectBuildingType(value: string) {
    await this.selectDropdown(this.buildingTypeSelect, value);
  }

  /** Selects house architectural type (e.g. 'Ranch') */
  async selectHouseType(value: string) {
    await this.selectDropdown(this.houseTypeSelect, value);
  }

  /** Selects orientation of the home (e.g. 'East') */
  async selectHomeOrientation(value: string) {
    await this.selectDropdown(this.homeOrientationSelect, value);
  }

  /** Selects the number of attached sides */
  async selectNumberOfAttachedSides(value: number) {
    await this.selectDropdown(this.numberOfAttachedSidesSelect, value);
  }

  /** Enters the year the home was built */
  async fillYearBuilt(value: string) {
    await this.fillInput(this.yearBuiltInput, value);
  }

  // ---------- Square Footage & Height ----------

  /** Selects the number of floors above grade */
  async selectNumberOfFloorsAboveGrade(value: number) {
    await this.selectDropdown(this.numberOfFloorsAboveGradeSelect, value);
  }

  /** Enters heated above-grade square feet */
  async fillHeatedAboveGradeSquareFeet(value: number) {
    await this.fillInput(this.heatedAboveGradeSquareFeetInput, value);
  }

  /** Enters above-grade ceiling height in feet */
  async fillAboveGradeCeilingHeight(value: number) {
    await this.fillInput(this.aboveGradeCeilingHeightInput, value);
  }

  // ---------- Basement ----------

  /** Selects basement type (e.g. 'Partial Heat') */
  async selectBasementType(value: string) {
    await this.selectDropdown(this.basementTypeSelect, value);
  }

  /** Enters total basement square feet */
  async fillBasementSquareFeet(value: number) {
    await this.fillInput(this.basementSquareFeetInput, value);
  }

  /** Enters heated basement square feet */
  async fillHeatedBasementSquareFeet(value: number) {
    await this.fillInput(this.heatedBasementSquareFeetInput, value);
  }

  /** Enters basement ceiling height in feet */
  async fillBasementCeilingHeight(value: number) {
    await this.fillInput(this.basementCeilingHeightInput, value);
  }

  // ---------- Occupancy ----------

  /** Enters number of home occupants */
  async fillNumberOfOccupants(value: number) {
    await this.fillInput(this.numberOfOccupantsInput, value);
  }

  /** Enters number of bedrooms */
  async fillNumberOfBedrooms(value: number) {
    await this.fillInput(this.numberOfBedroomsInput, value);
  }

  /** Enters outside temperature at the time of assessment */
  async fillOutsideTemperature(value: number) {
    await this.fillInput(this.outsideTemperatureInput, value);
  }

  // ---------- Heating ----------

  /** Selects heating system type (e.g. 'Geothermal') */
  async selectHeatingType(value: string) {
    await this.selectDropdown(this.heatingTypeSelect, value);
  }

  /** Selects primary heating fuel source (e.g. 'Natural Gas') */
  async selectPrimaryHeatingFuel(value: string) {
    await this.selectDropdown(this.primaryHeatingFuelSelect, value);
  }

  /** Selects secondary heating fuel source (e.g. 'Propane') */
  async selectSecondaryHeatingFuel(value: string) {
    await this.selectDropdown(this.secondaryHeatingFuelSelect, value);
  }

  // ---------- Cooling ----------

  /** Selects cooling system type (e.g. 'Central AC') */
  async selectCoolingType(value: string) {
    await this.selectDropdown(this.coolingTypeSelect, value);
  }

  /** Selects whether central AC is present ('Yes' or 'No') */
  async selectCentralAcPresent(value: string) {
    await this.selectDropdown(this.centralAcPresentSelect, value);
  }

  /** Selects ductwork configuration (e.g. 'Cooling') */
  async selectDuctworkPresent(value: string) {
    await this.selectDropdown(this.ductworkPresentSelect, value);
  }

  // ---------- Domestic Hot Water (DHW) Fuel ----------

  /** Selects primary fuel used for domestic hot water */
  async selectPrimaryDhwFuel(value: string) {
    await this.selectDropdown(this.primaryDhwFuelSelect, value);
  }

  // ---------- Calculated Values ----------

  /** Verifies total heated square feet calculated by the system */
  async verifyTotalHeatedSquareFeet(expectedValue: number) {
    await this.verifyInputValue(this.totalHeatedSquareFeetInput, expectedValue);
  }

  /** Verifies total heated volume calculated by the system */
  async verifyTotalHeatedVolume(expectedValue: number) {
    await this.verifyInputValue(this.totalHeatedVolumeInput, expectedValue);
  }

  /** Verifies Minimum Ventilation Guideline (MVG) calculated value */
  async verifyMVG(expectedValue: number) {
    await this.verifyInputValue(this.mvgInput, expectedValue);
  }

  // ---------- Save ----------

  /** Clicks the Save button to persist the property profile */
  async clickSave() {
    await this.clickButton(this.saveButton);
  }
}