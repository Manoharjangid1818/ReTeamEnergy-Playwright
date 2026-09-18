export const airSealingTask = {
  taskName: 'Air Sealing',
  partialFill: {
    dropdowns: [
      { label: 'Home is at BAS', option: 'No' },
      { label: 'Air Sealing Action', option: 'Core Assessment with Services' },
    ],
  },
  remainingFill: {
    dropdowns: [{ label: 'Air Sealing Performed', option: 'Yes' }],
    textFields: [{ label: 'Total Technician Hours', value: '2' }],
    checkboxes: ['Attic'],
  },
} as const;
