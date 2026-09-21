export type FieldKind = 'text' | 'textarea' | 'select' | 'checkbox';

export interface FieldSpec {
  label: string;
  kind: FieldKind;
  /**
   * text / textarea : the text to type
   * select          : option text to pick (omit to pick the first option)
   * checkbox        : true = check, false = uncheck (default true)
   */
  value?: string | boolean;
}

export const APPLIANCE_SECTIONS = [
  'Refrigerator',
  'Advanced Power Strip',
  'Clothes Washer',
  'Clothes Dryer',
  'Freezer',
  'Dehumidifier',
] as const;

export type ApplianceSection = (typeof APPLIANCE_SECTIONS)[number];

/**
 * Fields on each tab, taken from the screenshots (image uploads left out on
 * purpose). Note Refrigerator says "Unit Age" while the other tabs say "Age".
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
    { label: 'Dryer Type', kind: 'select' },
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

export const ASSESSMENT_TASKS = {
  airSealing: { name: 'Air Sealing', totalSections: 1 },
  appliances: { name: 'Appliances', totalSections: APPLIANCE_SECTIONS.length },
} as const;
