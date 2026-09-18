import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

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

  constructor(page: import('@playwright/test').Page) {
    super(page);

    this.addPropertyProfileHeading = page.getByRole('heading', {
      name: 'Add Property Profile',
      exact: true,
    });

    this.rentOwnSelect = page.locator(
      '#field-rent_or_own [role="combobox"]'
    );

    this.buildingTypeSelect = page.locator(
      '#field-residence_type [role="combobox"]'
    );

    this.houseTypeSelect = page.locator(
      '#field-house_type [role="combobox"]'
    );

    this.homeOrientationSelect = page.locator(
      '#field-home_orientation [role="combobox"]'
    );

    this.numberOfAttachedSidesSelect = page.locator(
      '#field-number_of_attached_sides [role="combobox"]'
    );

    this.yearBuiltInput = page.locator(
      '#field-year_built input'
    );

    this.numberOfFloorsAboveGradeSelect = page.locator(
      '#field-number_of_floors_above_grade [role="combobox"]'
    );

    this.heatedAboveGradeSquareFeetInput = page.locator(
      '#field-heated_above_grade_square_feet input'
    );

    this.aboveGradeCeilingHeightInput = page.locator(
      '#field-above_grade_ceiling_height input'
    );

    this.basementTypeSelect = page.locator(
      '#field-basement_type [role="combobox"]'
    );

    this.basementSquareFeetInput = page.locator(
      '#field-basement_square_feet input'
    );

    this.heatedBasementSquareFeetInput = page.locator(
      '#field-heated_basement_square_feet input'
    );

    this.basementCeilingHeightInput = page.locator(
      '#field-basement_ceiling_height input'
    );

    this.numberOfOccupantsInput = page.locator(
      '#field-number_of_occupants input'
    );

    this.numberOfBedroomsInput = page.locator(
      '#field-number_of_bedrooms input'
    );

    this.outsideTemperatureInput = page.locator(
      '#field-outside_temperature input'
    );

    this.heatingTypeSelect = page.locator(
      '#field-heating_type [role="combobox"]'
    );

    this.primaryHeatingFuelSelect = page.locator(
      '#field-primary_heating_fuel [role="combobox"]'
    );

    this.secondaryHeatingFuelSelect = page.locator(
      '#field-secondary_heating_fuel [role="combobox"]'
    );

    this.coolingTypeSelect = page.locator(
      '#field-cooling_type [role="combobox"]'
    );

    this.centralAcPresentSelect = page.locator(
      '#field-central_ac_present [role="combobox"]'
    );

    this.ductworkPresentSelect = page.locator(
      '#field-ductwork_present [role="combobox"]'
    );

    this.primaryDhwFuelSelect = page.locator(
      '#field-primary_dhw_fuel [role="combobox"]'
    );

    this.totalHeatedSquareFeetInput = page.locator(
      '#field-total_heated_square_feet input'
    );

    this.totalHeatedVolumeInput = page.locator(
      '#field-total_heated_volume input'
    );

    this.mvgInput = page.locator(
      '#field-minimum_ventilation_guideline input'
    );

    this.saveButton = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
  }

  async waitForPageReady() {
    await this.addPropertyProfileHeading.waitFor({
      state: 'visible',
    });

    await this.rentOwnSelect.waitFor({
      state: 'visible',
    });
  }

  // Property Details

  async selectRentOrOwn(value: string) {
    await this.selectDropdown(
      this.rentOwnSelect,
      value
    );
  }

  async selectBuildingType(value: string) {
    await this.selectDropdown(
      this.buildingTypeSelect,
      value
    );
  }

  async selectHouseType(value: string) {
    await this.selectDropdown(
      this.houseTypeSelect,
      value
    );
  }

  async selectHomeOrientation(value: string) {
    await this.selectDropdown(
      this.homeOrientationSelect,
      value
    );
  }

  async selectNumberOfAttachedSides(value: number) {
    await this.selectDropdown(
      this.numberOfAttachedSidesSelect,
      value
    );
  }

  async fillYearBuilt(value: string) {
    await this.fillInput(
      this.yearBuiltInput,
      value
    );
  }

  // Square Footage & Height

  async selectNumberOfFloorsAboveGrade(value: number) {
    await this.selectDropdown(
      this.numberOfFloorsAboveGradeSelect,
      value
    );
  }

  async fillHeatedAboveGradeSquareFeet(value: number) {
    await this.fillInput(
      this.heatedAboveGradeSquareFeetInput,
      value
    );
  }

  async fillAboveGradeCeilingHeight(value: number) {
    await this.fillInput(
      this.aboveGradeCeilingHeightInput,
      value
    );
  }

  // Basement

  async selectBasementType(value: string) {
    await this.selectDropdown(
      this.basementTypeSelect,
      value
    );
  }

  async fillBasementSquareFeet(value: number) {
    await this.fillInput(
      this.basementSquareFeetInput,
      value
    );
  }

  async fillHeatedBasementSquareFeet(value: number) {
    await this.fillInput(
      this.heatedBasementSquareFeetInput,
      value
    );
  }

  async fillBasementCeilingHeight(value: number) {
    await this.fillInput(
      this.basementCeilingHeightInput,
      value
    );
  }

  // Occupancy

  async fillNumberOfOccupants(value: number) {
    await this.fillInput(
      this.numberOfOccupantsInput,
      value
    );
  }

  async fillNumberOfBedrooms(value: number) {
    await this.fillInput(
      this.numberOfBedroomsInput,
      value
    );
  }

  async fillOutsideTemperature(value: number) {
    await this.fillInput(
      this.outsideTemperatureInput,
      value
    );
  }

  // Heating

  async selectHeatingType(value: string) {
    await this.selectDropdown(
      this.heatingTypeSelect,
      value
    );
  }

  async selectPrimaryHeatingFuel(value: string) {
    await this.selectDropdown(
      this.primaryHeatingFuelSelect,
      value
    );
  }

  async selectSecondaryHeatingFuel(value: string) {
    await this.selectDropdown(
      this.secondaryHeatingFuelSelect,
      value
    );
  }

  // Cooling

  async selectCoolingType(value: string) {
    await this.selectDropdown(
      this.coolingTypeSelect,
      value
    );
  }

  async selectCentralAcPresent(value: string) {
    await this.selectDropdown(
      this.centralAcPresentSelect,
      value
    );
  }

  async selectDuctworkPresent(value: string) {
    await this.selectDropdown(
      this.ductworkPresentSelect,
      value
    );
  }

  // DHW Fuel

  async selectPrimaryDhwFuel(value: string) {
    await this.selectDropdown(
      this.primaryDhwFuelSelect,
      value
    );
  }

  // Calculated Values

  async verifyTotalHeatedSquareFeet(expectedValue: number) {
    await this.verifyInputValue(
      this.totalHeatedSquareFeetInput,
      expectedValue
    );
  }

  async verifyTotalHeatedVolume(expectedValue: number) {
    await this.verifyInputValue(
      this.totalHeatedVolumeInput,
      expectedValue
    );
  }

  async verifyMVG(expectedValue: number) {
    await this.verifyInputValue(
      this.mvgInput,
      expectedValue
    );
  }

  // Save

  async clickSave() {
    await this.clickButton(this.saveButton);
  }
}