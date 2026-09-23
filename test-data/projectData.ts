/**
 * Comprehensive test data used across all test suites to create and verify a project.
 * Contains customer details, property profile fields, utilities, and fuel costs.
 */
export const projectData = {
  // --- Basic Project Information ---
  firstName: 'Sterling',
  lastName: 'Beaumont',
  assessor: 'Anjali Priya',

  // --- Project Address ---
  streetAddress: '29 Briarwood Lane, East Hartford, CT, USA',
  city: 'East Hartford',
  state: 'CT',
  zip: '06118',

  // --- Project Configuration ---
  projectType: 'Residential',
  buildingType: 'Townhouse',
  configuration: 'EversourceUI',
  programType: 'HESIE',

  // --- Applicant Information ---
  secondaryProjectNumber: 'SEC-CT-001',

  // --- Customer Contact Information ---
  homePhone: '2035554729',
  cellPhone: '2035554728',
  applicantEmail: 'sterling.beaumont@yopmail.com',

  // --- Utility Information ---
  electricCompany: 'Eversource',
  electricMeterNumber: 'EM458721963',
  electricAccountNumber: 'EA785214963',

  gasAccountNumber: 'GA369852147',
  gasMeterNumber: 'GM741258963',
  gasCompany: 'CNG',

  // --- Landlord Information (used when Rent is selected) ---
  landlordFirstName: 'Marcus',
  landlordLastName: 'Whitmore',
  landlordAddress: '314 Harbor View Avenue, Stamford, CT, USA',
  landlordCity: 'Stamford',
  landlordPhone: '2035556197',

  // --- Property Profile Details ---
  rentOrOwn: 'Rent',
  yearBuilt: '2025',
  numberofattachedsides: 2,
  numberOfFloorsAboveGrade: 2,
  houseType: 'Ranch',
  homeOrientation: 'East',
  heatedAboveGradeSquareFeet: 2123,
  aboveGradeCeilingHeight: 12,
  basementType: 'Partial Heat',
  basementSquareFeet: 750,
  heateBasementSquareFeet: 450,
  basementCeilingHeight: 12,
  numberoOfOccupants: 5,
  numberOfBedrooms: 4,
  outsideTemperature: 23,
  heatingtype: 'Geothermal',
  primaryheatingfuel: 'Natural Gas',
  secondaryheatingfuel: 'Propane',
  coolingtype: 'Central AC',
  centralacpresent: 'Yes',
  ductworkpresent: 'Cooling',
  primarydhwfuel: 'Natural Gas',
  expectedTotalHeatedSquareFeet: 2573,
  expectedTotalHeatedVolume: 30876,
  expectedMVG: 1254.3,

  // --- Fuel Costs Data Array ---
  fuelCosts: [
    {
      fuelType: 'Electricity',
      costPerUnit: 0.15,
      annualUsage: 1000,
      expectedAnnualFuelCost: 150,
    },
    {
      fuelType: 'Natural Gas',
      costPerUnit: 1.25,
      annualUsage: 800,
      expectedAnnualFuelCost: 1000,
    },
    {
      fuelType: 'Propane',
      costPerUnit: 2.10,
      annualUsage: 500,
      expectedAnnualFuelCost: 1050,
    },
    {
      fuelType: 'Oil',
      costPerUnit: 6.10,
      annualUsage: 35,
      expectedAnnualFuelCost: 213.5,
    },
    {
      fuelType: 'Wood/Coal',
      costPerUnit: 6.10,
      annualUsage: 35,
      expectedAnnualFuelCost: 213.5,
    },
    {
      fuelType: 'Kerosene',
      costPerUnit: 6.10,
      annualUsage: 35,
      expectedAnnualFuelCost: 213.5,
    },
    {
      fuelType: 'Other',
      unit: 'Unit',
      costPerUnit: 6.10,
      annualUsage: 35,
      expectedAnnualFuelCost: 213.5,
      defaultCostValue: 0,
    },
  ],
};
