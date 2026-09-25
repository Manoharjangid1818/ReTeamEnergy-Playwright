/**
 * Shared application routes and project identity used across the end-to-end workflow.
 */
export const appRoutes = {
  signIn: '/sign-in',
  manageProject: '/manage-project',
} as const;

/**
 * Project values created in the initial workflow and reused to locate and verify it later.
 */
export const projectIdentityData = {
  firstName: 'Sterling',
  lastName: 'Beaumont',
  streetAddress: '29 Briarwood Lane, East Hartford, CT, USA',
  city: 'East Hartford',
  state: 'CT',
  zip: '06118',
  buildingType: 'Townhouse',
} as const;
