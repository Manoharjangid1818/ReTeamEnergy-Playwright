/**
 * User credentials loaded from environment variables (.env file)
 * used by global authentication setup to sign in.
 */
export const testUser = {
  /** User login email address */
  email: process.env.RETEAM_EMAIL || '',

  /** User login password */
  password: process.env.RETEAM_PASSWORD || '',
};