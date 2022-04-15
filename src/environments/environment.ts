// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  beta: false,
  MATOMO_URL: '',
  MATOMO_SITE: -1,
  API_LOGIN: 'http://localhost:8280/observatory',
  API_ENDPOINT: '/observatory',
  API_TOKEN_ENDPOINT: '',
  projectName: 'Observatory',
  projectMail: 'example@oac.eu',
  serviceORresource: 'Resource',
  hasUserConsent: true,
  showHelpContent: false,
  privacyPolicyURL: '',
  marketplaceBaseURL: '',
  STATS_API_ENDPOINT: 'https://stats.madgik.di.uoa.gr/stats-api/',
  profileName: 'eosc-obs'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
