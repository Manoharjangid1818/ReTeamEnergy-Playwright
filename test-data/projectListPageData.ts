import { projectIdentityData } from './commonTestData';

/** Search values for locating the project from the project list page. */
export const projectListPageData = {
  projectName: `${projectIdentityData.firstName} ${projectIdentityData.lastName}`,
  projectAddress: projectIdentityData.streetAddress,
} as const;
