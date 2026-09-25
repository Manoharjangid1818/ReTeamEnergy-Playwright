import type { ApplianceSection } from './energyAssessmentData';

/**
 * Specification for a field to edit on the Snapshot tab.
 */
export interface SnapshotEdit {
  /** Visible label or placeholder of the target field */
  label: string;

  /**
   * Candidate values to write. The first candidate that differs from what is
   * currently in the field is selected to avoid false-positive test passes.
   */
  candidates: string[];
}

/**
 * Specification for an appliance field to edit on the Snapshot tab.
 */
export interface ApplianceSnapshotEdit extends SnapshotEdit {
  /** The appliance section tab (e.g. 'Refrigerator', 'Advanced Power Strip') */
  section: ApplianceSection;
}

/**
 * Record of a field and the specific value written to it.
 */
export interface WrittenEdit {
  label: string;
  value: string;
}

/**
 * Record of an appliance field and the specific value written to it.
 */
export interface WrittenApplianceEdit extends WrittenEdit {
  section: ApplianceSection;
}

const suffix = Date.now().toString().slice(-6);

/**
 * Test dataset defining 1-2 edits per Snapshot section, and the values tested for persistence.
 */
export const snapshotEdits = {
  /**
   * Verified on the Customer profile tab.
   * Note: Do NOT edit First Name or Last Name here, as the snapshot test suite
   * relies on searching for the dedicated project by its unique name.
   */
  customerInformation: [
    { label: 'Secondary Project Number', candidates: [`SEC-CT-${suffix}`] },
    { label: 'Apt./Flr', candidates: [`Unit ${suffix}`] },
  ] as SnapshotEdit[],

  /** Verified on the Property profile tab */
  propertyProfile: [
    { label: 'Year Built', candidates: ['2018', '2019'] },
    { label: 'Number of Occupants', candidates: ['6', '7'] },
  ] as SnapshotEdit[],

  /** Verified on Energy assessment -> Appliances task */
  appliances: [
    { section: 'Refrigerator', label: 'kWh', candidates: ['500', '510'] },
    { section: 'Refrigerator', label: 'Serial Number', candidates: [`88${suffix}`, `99${suffix}`] },
    { section: 'Advanced Power Strip', label: 'Notes', candidates: [`Snapshot note ${suffix}`] },
  ] as ApplianceSnapshotEdit[],
};
