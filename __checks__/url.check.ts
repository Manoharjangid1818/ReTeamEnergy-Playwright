import { UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'

new UrlMonitor('reteam-energy-web-availability', {
  name: 'ReTeam Energy web availability',
  activated: true,
  maxResponseTime: 20_000,
  degradedResponseTime: 5000,
  request: {
    url: process.env.RETEAM_BASE_URL ?? 'https://dev.reteamenergy.com',
    followRedirects: true,
    assertions: [
      UrlAssertionBuilder.statusCode().equals(200),
    ]
  }
})
