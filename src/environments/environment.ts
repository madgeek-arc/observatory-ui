// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  beta: false,
  API_LOGIN: 'http://localhost:8280/observatory/login',
  API_ENDPOINT: '/observatory',
  projectName: 'Observatory',
  // STATS_API_ENDPOINT: 'https://stats.madgik.di.uoa.gr/stats-api/',
  STATS_API_ENDPOINT: 'http://dl123.madgik.di.uoa.gr/stats/api/',
  profileName: 'eosc-obs',
  OSO_STATS_API_ENDPOINT: 'https://services.openaire.eu/stats-tool/',
  osoStatsProfileName: 'observatory'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
