import { projectIdentityData } from './commonTestData';

/** Values entered on the Basic Project Details creation page. */
export const basicProjectDetailsData = {
  ...projectIdentityData,
  assessor: 'Anjali Priya',
  projectType: 'Residential',
  configuration: 'EversourceUI',
  programType: 'HESIE',
} as const;
