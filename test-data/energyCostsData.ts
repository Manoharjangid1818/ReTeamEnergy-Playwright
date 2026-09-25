/** Fuel cost records managed from the Energy Costs page. */
export const energyCostsData = {
  fuelCosts: [
    { fuelType: 'Electricity', costPerUnit: 0.15, annualUsage: 1000, expectedAnnualFuelCost: 150 },
    { fuelType: 'Natural Gas', costPerUnit: 1.25, annualUsage: 800, expectedAnnualFuelCost: 1000 },
    { fuelType: 'Propane', costPerUnit: 2.10, annualUsage: 500, expectedAnnualFuelCost: 1050 },
    { fuelType: 'Oil', costPerUnit: 6.10, annualUsage: 35, expectedAnnualFuelCost: 213.5 },
    { fuelType: 'Wood/Coal', costPerUnit: 6.10, annualUsage: 35, expectedAnnualFuelCost: 213.5 },
    { fuelType: 'Kerosene', costPerUnit: 6.10, annualUsage: 35, expectedAnnualFuelCost: 213.5 },
    {
      fuelType: 'Other',
      unit: 'Unit',
      costPerUnit: 6.10,
      annualUsage: 35,
      expectedAnnualFuelCost: 213.5,
      defaultCostValue: 0,
    },
  ],
} as const;
