export const environment = {
  production: true,
  beta: false,
  API_LOGIN: '/api/oauth2/authorization/eosc',
  API_ENDPOINT: '/api',
  WS_ENDPOINT: '/api/websocket',
  MESSAGING_ENDPOINT: '/api',
  projectName: 'Observatory',
  STATS_API_ENDPOINT: '/api/statistics/',
  OS_EUROPE_API_ENDPOINT: 'https://oseurope.openaire.eu/api/',
  profileName: 'eosc-obs',
  OSO_STATS_API_ENDPOINT: 'https://services.openaire.eu/stats-tool/',
  osoStatsProfileName: 'observatory',
  matomoTrackerUrl: '$MATOMO_URL',
  matomoSiteId: '$MATOMO_SITE_ID',
  RECAPTCHA_V3_KEY: '$RECAPTCHA_V3_SITE_KEY',
  enableSentry: true,
  sentry: {
    dsn: '$SENTRY_DSN',
    environment: '$SENTRY_ENV',
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0
  }
};
