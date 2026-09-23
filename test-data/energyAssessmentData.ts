/**
 * Test dataset and field specifications for Energy Assessment tasks:
 * - Air Sealing
 * - Appliances (6 section tabs, multi-instance)
 * - Domestic Hot Water
 * - Safety Information & Air Flow
 * - Water Package
 * - Insulation (11 section tabs)
 */

/**
 * Defines the supported UI input control types across assessment task forms.
 */
export type FieldKind = 'text' | 'textarea' | 'select' | 'checkbox';

/**
 * Specification for an individual field inside an assessment form.
 */
export interface FieldSpec {
  /** The visible label or placeholder of the form field */
  label: string;

  /** The type of input element (text input, multiline textarea, select dropdown, or checkbox) */
  kind: FieldKind;

  /**
   * The test value to input:
   * - text / textarea : string value to type
   * - select          : exact option text to pick (if omitted, the first option is chosen)
   * - checkbox        : true to check, false to uncheck
   */
  value?: string | boolean;

  /** Only fill/expect this field when the field named here equals this value. */
  showWhen?: { label: string; equals: string };
}

// ============================================================================
// Appliances Task Data
// ============================================================================

/**
 * All six appliance section tab names available inside the Appliances task.
 */
export const APPLIANCE_SECTIONS = [
  'Refrigerator',
  'Advanced Power Strip',
  'Clothes Washer',
  'Clothes Dryer',
  'Freezer',
  'Dehumidifier',
] as const;

/**
 * Type representing any valid appliance section name.
 */
export type ApplianceSection = (typeof APPLIANCE_SECTIONS)[number];

/**
 * Mapping of each appliance section tab to its list of fields and test values.
 * Note: Refrigerator uses "Unit Age" as its label, whereas other tabs use "Age".
 */
export const APPLIANCE_FIELDS: Record<ApplianceSection, FieldSpec[]> = {
  Refrigerator: [
    { label: 'kWh', kind: 'text', value: '450' },
    { label: 'Unit Age', kind: 'text', value: '12' },
    { label: 'Usage', kind: 'select' },
    { label: 'Equipment Owner', kind: 'select' },
    { label: 'Upgrade Recommended', kind: 'select' },
    { label: 'Notes', kind: 'textarea', value: 'Refrigerator test notes' },
    { label: 'Gallon Capacity', kind: 'text', value: '18' },
    { label: 'Voltage', kind: 'text', value: '120' },
    { label: 'Input Watts', kind: 'text', value: '150' },
    { label: 'Serial Number', kind: 'text', value: '12345678' },
  ],

  'Advanced Power Strip': [
    { label: 'Installed', kind: 'checkbox', value: true },
    { label: 'Notes', kind: 'textarea', value: 'Power strip test notes' },
    { label: 'Serial Number', kind: 'text', value: '12345678' },
  ],

  'Clothes Washer': [
    { label: 'kWh', kind: 'text', value: '120' },
    { label: 'Age', kind: 'text', value: '8' },
    { label: 'Usage', kind: 'select' },
    { label: 'Upgrade Recommended', kind: 'select' },
    { label: 'Serial Number', kind: 'text', value: '12345678' },
  ],

  'Clothes Dryer': [
    { label: 'Dryer Type', kind: 'select', value: 'Electricity' },
    { label: 'Age', kind: 'text', value: '10' },
    { label: 'Upgrade Recommended', kind: 'select' },
    { label: 'Serial Number', kind: 'text', value: '12345678' },
  ],

  Freezer: [
    { label: 'Age', kind: 'text', value: '15' },
    { label: 'kWh', kind: 'text', value: '380' },
    { label: 'Usage', kind: 'select' },
    { label: 'Upgrade Recommended', kind: 'select' },
    { label: 'Notes', kind: 'textarea', value: 'Freezer test notes' },
    { label: 'Serial Number', kind: 'text', value: '12345678' },
  ],

  Dehumidifier: [
    { label: 'Age', kind: 'text', value: '5' },
    { label: 'Usage', kind: 'select' },
    { label: 'Upgrade Recommended', kind: 'select' },
    { label: 'Measure Type', kind: 'select' },
    { label: 'Serial Number', kind: 'text', value: '12345678' },
  ],
};

/**
 * High-level task metadata used to verify progress indicators on the Kanban board.
 */
export const ASSESSMENT_TASKS = {
  /** Air Sealing has a single section (0 / 1 sections) */
  airSealing: { name: 'Air Sealing', totalSections: 1 },

  /** Appliances has six section tabs (0 / 6 sections) */
  appliances: { name: 'Appliances', totalSections: APPLIANCE_SECTIONS.length },
} as const;

// ============================================================================
// Air Sealing Task Data
// ============================================================================

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

// ============================================================================
// Domestic Hot Water Task Data
// ============================================================================

// Single form, 1 instance. "Upgrade Recommended" = Yes reveals 4 extra fields.
export const DOMESTIC_HOT_WATER_FIELDS: FieldSpec[] = [
  { label: 'Equipment Type', kind: 'select', value: 'Heat pump water heater' },
  { label: 'Equipment Location', kind: 'select', value: 'Conditioned basement' },
  { label: 'Ownership', kind: 'select', value: 'Owned' },
  { label: 'Equipment Usage', kind: 'select', value: 'Primary' },
  { label: 'Tank Size', kind: 'text', value: '50' },
  { label: 'Fuel Type', kind: 'select', value: 'Electricity' },
  { label: 'Upgrade Recommended', kind: 'select', value: 'Yes' },
  {
    label: 'Recommend Water Heater Tune-up',
    kind: 'select',
    showWhen: { label: 'Upgrade Recommended', equals: 'Yes' },
  },
  {
    label: 'Recommended Fuel Type',
    kind: 'select',
    showWhen: { label: 'Upgrade Recommended', equals: 'Yes' },
  },
  {
    label: 'Recommended DHW Equipment Type',
    kind: 'select',
    showWhen: { label: 'Upgrade Recommended', equals: 'Yes' },
  },
  {
    label: 'Recommended Tank Size',
    kind: 'text',
    value: '40',
    showWhen: { label: 'Upgrade Recommended', equals: 'Yes' },
  },
  { label: 'Notes', kind: 'textarea', value: 'Domestic Hot Water test notes' },
];

// ============================================================================
// Safety Information & Air Flow Task Data
// ============================================================================

// Single form, 1 instance. 8 combustion-testing dropdowns + 16 barrier checkboxes.
export const SAFETY_INFO_FIELDS: FieldSpec[] = [
  { label: 'Combustion Test Performed', kind: 'select', value: 'Yes' },
  { label: 'Combustion Test Results', kind: 'select', value: 'Pass' },
  { label: 'Combustion Test IN Performed', kind: 'select', value: 'Yes' },
  { label: 'Spillage (Combustion Test IN)', kind: 'select', value: 'Pass' },
  { label: 'CO in the Flu Test (Combustion Test IN)', kind: 'select', value: 'Pass' },
  { label: 'Combustion Test OUT Performed', kind: 'select', value: 'Yes' },
  { label: 'Spillage (Combustion Test OUT)', kind: 'select', value: 'Pass' },
  { label: 'CO in the Flu Test (Combustion Test OUT)', kind: 'select', value: 'Pass' },
  { label: 'Notes', kind: 'textarea', value: 'Safety Information & Air Flow test notes' },
];

/** The 16 Barriers checkboxes. Left unchecked by default (all optional). */
export const SAFETY_BARRIER_LABELS: string[] = [
  'Active Fire',
  'PACM',
  'Domestic Hygiene',
  'Structural Hazard',
  'Gas Leak',
  'Knob and Tube',
  'Open Construction (Less Than 4 Sq Ft)',
  'Open Construction (Greater Than 4 Sq Ft)',
  'Unvented Appliance',
  'Vermiculite',
  'High Ambient CO',
  'Failed CAZ',
  'Mold (Less Than 10 Sq Ft)',
  'Mold (Greater Than 10 Sq Ft)',
  '2-4 Family Home (Partial Access)',
  'Customer Declined',
  'Other Issue',
];

// ============================================================================
// Water Package Task Data
// ============================================================================

// Single form, 1 instance. All plain numeric text fields + Notes.
export const WATER_PACKAGE_FIELDS: FieldSpec[] = [
  { label: 'Low Flow Faucet Head', kind: 'text', value: '2' },
  { label: 'Dual Thread Aerator', kind: 'text', value: '2' },
  { label: 'Flip/Swivel Aerator', kind: 'text', value: '1' },
  { label: 'Handheld Shower Head', kind: 'text', value: '1' },
  { label: 'Low Flow Shower Head', kind: 'text', value: '2' },
  { label: 'Pipe Wrap - 1/2 inch (Feet)', kind: 'text', value: '10' },
  { label: 'Pipe Wrap - 3/4 inch (Feet)', kind: 'text', value: '10' },
  { label: 'Notes', kind: 'textarea', value: 'Water Package test notes' },
];

export const SINGLE_FORM_TASKS = {
  domesticHotWater: {
    name: 'Domestic Hot Water',
    fields: DOMESTIC_HOT_WATER_FIELDS,
  },
  safetyInformationAirFlow: {
    name: 'Safety Information & Air Flow',
    fields: SAFETY_INFO_FIELDS,
    checkboxLabels: SAFETY_BARRIER_LABELS,
  },
  waterPackage: {
    name: 'Water Package',
    fields: WATER_PACKAGE_FIELDS,
  },
} as const;

export type SingleFormTaskKey = keyof typeof SINGLE_FORM_TASKS;

// ============================================================================
// Insulation Task Data
// ============================================================================

export interface InsulationSectionSpec {
  /** Tab name, exactly as shown on the Insulation task screen. */
  name: string;
  /**
   * Label of the type dropdown shown when "Is Auditable" = Yes.
   * Attic - Hatch, Attic - Pull Down Stairs and Attic - Knee Wall Slope have
   * no type field.
   */
  typeFieldLabel?: string;
}

/** The 11 tabs on the Insulation task screen, in the order shown on screen. */
export const INSULATION_SECTIONS: InsulationSectionSpec[] = [
  { name: 'Attic - Open', typeFieldLabel: 'Attic Type' },
  { name: 'Basement - Ceiling', typeFieldLabel: 'Foundation Type' },
  { name: 'Wall - Exterior', typeFieldLabel: 'Wall Type' },
  { name: 'Rim Joists', typeFieldLabel: 'Foundation Type' },
  { name: 'Attic - Hatch' },
  { name: 'Attic - Floored', typeFieldLabel: 'Attic Type' },
  { name: 'Attic - Pull Down Stairs' },
  { name: 'Attic - Slope (Dense Pack)', typeFieldLabel: 'Attic Type' },
  { name: 'Attic - Floored - Kneewall Floor (Dense Pack)', typeFieldLabel: 'Attic Type' },
  { name: 'Attic - Open - Kneewall Floor', typeFieldLabel: 'Attic Type' },
  { name: 'Attic - Knee Wall Slope' },
];

/**
 * Builds the field list for one Insulation section. When auditable is true,
 * the type field (if any), Square Foot, R-Value, Existing Insulation Type,
 * Upgrade Recommended and Notes are all included and filled. When false,
 * only "Is Auditable" itself is set, matching what the screen shows.
 */
export function insulationFields(
  section: InsulationSectionSpec,
  auditable: boolean,
): FieldSpec[] {
  const fields: FieldSpec[] = [
    { label: 'Is Auditable', kind: 'select', value: auditable ? 'Yes' : 'No' },
  ];

  if (!auditable) {
    return fields;
  }

  if (section.typeFieldLabel) {
    fields.push({
      label: section.typeFieldLabel,
      kind: 'select',
      showWhen: { label: 'Is Auditable', equals: 'Yes' },
    });
  }
  fields.push(
    { label: 'Square Foot', kind: 'text', value: '200', showWhen: { label: 'Is Auditable', equals: 'Yes' } },
    { label: 'R-Value', kind: 'text', value: '19', showWhen: { label: 'Is Auditable', equals: 'Yes' } },
    {
      label: 'Existing Insulation Type',
      kind: 'select',
      showWhen: { label: 'Is Auditable', equals: 'Yes' },
    },
    { label: 'Upgrade Recommended', kind: 'select', showWhen: { label: 'Is Auditable', equals: 'Yes' } },
    {
      label: 'Notes',
      kind: 'textarea',
      value: `${section.name} test notes`,
      showWhen: { label: 'Is Auditable', equals: 'Yes' },
    },
  );
  return fields;
}
