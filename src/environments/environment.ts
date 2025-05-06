// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  beta: false,
  // API_LOGIN: 'http://localhost:8280/observatory/login',
  API_LOGIN: '/api/oauth2/authorization/eosc',
  API_ENDPOINT: '/api',
  WS_ENDPOINT: '/api/websocket',
  MESSAGING_ENDPOINT: '/api',
  projectName: 'Observatory',
  // STATS_API_ENDPOINT: 'https://stats.madgik.di.uoa.gr/stats-api/',
  STATS_API_ENDPOINT: '/api/statistics/',
  profileName: 'eosc-obs',
  OSO_STATS_API_ENDPOINT: 'https://services.openaire.eu/stats-tool/',
  osoStatsProfileName: 'observatory',
  matomoTrackerUrl: '',
  matomoSiteId: -2,
  RECAPTCHA_V3_KEY: '6Lc_SFEmAAAAAPULH3Rw_Umpa-UVJ2n1qJ0dOcJ7',
  enableSentry: false,
  sentry: {
    dsn: 'https://f3877c1b0e3334d3869db0c5113dc30e@sentry.vereniki.athenarc.gr/5',
    environment: 'develop',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.2,
    replaysOnErrorSampleRate: 1.0
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
