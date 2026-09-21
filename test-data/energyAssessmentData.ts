/**
 * Test dataset for the Air Sealing task under Energy Assessment.
 * Defines the fields required for partial completion and full completion.
 */
export const airSealingTask = {
  /** Name of the task card on the Kanban board */
  taskName: 'Air Sealing',

  /** Initial fields filled to transition the task from 'Not Started' to 'In Progress' */
  partialFill: {
    dropdowns: [
      { label: 'Home is at BAS', option: 'No' },
      { label: 'Air Sealing Action', option: 'Core Assessment with Services' },
    ],
  },

  /** Additional fields filled to transition the task to 'Completed' (1 / 1 sections) */
  remainingFill: {
    dropdowns: [{ label: 'Air Sealing Performed', option: 'Yes' }],
    textFields: [{ label: 'Total Technician Hours', value: '2' }],
    checkboxes: ['Attic'],
  },
} as const;
