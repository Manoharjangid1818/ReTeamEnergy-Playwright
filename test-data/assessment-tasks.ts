/**
 * Defines the supported UI input control types across assessment task forms.
 */
export type FieldKind = 'text' | 'textarea' | 'select' | 'checkbox';

/**
 * Specification for an individual field inside an appliance section.
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
