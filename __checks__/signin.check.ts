import { Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs';

/**
 * Checkly URL Monitor: Web Platform Availability
 *
 * Validates HTTP response status and uptime of the ReTeam Energy platform.
 * Runs every 5 minutes from US East and EU Central data centers.
 */
export const signinCheck = new UrlMonitor('signin-url-monitor', {
  name: 'ReTeam Energy - Web Platform Availability',
  activated: true,
  frequency: Frequency.EVERY_5M,
  locations: ['us-east-1', 'eu-central-1'],
  tags: ['production', 'availability'],
  request: {
    url: 'https://dev.reteamenergy.com',
    followRedirects: true,
    assertions: [
      UrlAssertionBuilder.statusCode().equals(200),
    ],
  },
});
