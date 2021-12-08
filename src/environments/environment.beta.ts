// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  beta: true,
  MATOMO_URL: '',
  MATOMO_SITE: -1,
  API_LOGIN: 'http://audrey.athenarc.gr:8080/observatory',
  API_ENDPOINT: '/observatory',
  API_TOKEN_ENDPOINT: '',
  projectName: 'Observatory',
  projectMail: 'example@oac.eu',
  serviceORresource: 'Resource',
  hasUserConsent: true,
  showHelpContent: false,
  privacyPolicyURL: '',
  marketplaceBaseURL: ''
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
