# Configuration

The application is configured in three layers. They apply in this order, and a later layer can overwrite what an
earlier one produced:

1. **Build-time:** the Angular build picks one `src/environments/environment*.ts` file (`fileReplacements` in `angular.json`).
2. **Container start:** `init.sh` substitutes five placeholders inside the built `main.*.js` and renders the nginx
   configuration from `nginx.conf.txt`.
3. **Local development:** `proxy.conf.js` routes `/api` and Joomla paths to local or remote targets.

There is no `.env` file and no configuration endpoint. Values that must differ per deployment are either
placeholders (layer 2) or proxied targets, because the browser uses same-origin relative URLs for the API.

> **Secrets.** Nothing in these layers is a server-side secret: every value that ends up in the bundle is visible to
> any visitor (the reCAPTCHA *site* key and the Sentry DSN are public identifiers by design). Do not put
> credentials in `environment*.ts`. The only secret in the toolchain is the Sentry auth token used at image build time (see
> [Build arguments](#build-arguments)).

## 1. Environment files (`src/environments`)

| File | Used by | Selected with |
|---|---|---|
| `environment.ts` | Local development, tests | default (no replacement) |
| `environment.beta.ts` | Beta/staging image | `ng build --configuration beta` (`npm run build:beta`) |
| `environment.prod.ts` | Production image | `ng build --configuration production` (`npm run build:prod`) |

All three files export the same `environment` object. New keys must be added to all three.

| Key | Required | Dev | Beta | Prod | Description |
|---|---|---|---|---|---|
| `production` | yes | `false` | `false` | `true` | Enables Angular production mode (`main.ts`) |
| `beta` | no | `false` | `true` | `false` | Declared on `AppEnvironment`; not read by application code today |
| `API_ENDPOINT` | yes | `/api` | `/api` | `/api` | Base URL of the Observatory REST API. Relative, so it is served by the dev proxy or the nginx `/api` location |
| `API_LOGIN` | yes | `/api/login` | `/api/oauth2/authorization/eosc` | `/api/oauth2/authorization/eosc` | URL the browser is sent to for login (full-page redirect) |
| `WS_ENDPOINT` | yes | `/api/websocket` | `/api/websocket` | `/api/websocket` | SockJS/STOMP endpoint for live updates and messaging notifications |
| `WS_TOPICS` | no | unset | unset | unset | Optional overrides for catalogue-ui's STOMP topic templates (see catalogue-ui configuration) |
| `MESSAGING_ENDPOINT` | yes | `/api` | `/api` | `/api` | Base URL of the messaging REST API (same backend today) |
| `STATS_API_ENDPOINT` | yes | `/api/statistics/` | `/api/statistics/` | `/api/statistics/` | Statistics API for survey data (`raw?json=`, `chart?json=`). Trailing slash required |
| `profileName` | yes | `eosc-obs` | `eosc-obs` | `eosc-obs` | Profile name sent with statistics queries against `STATS_API_ENDPOINT` |
| `OSO_STATS_API_ENDPOINT` | yes | OpenAIRE stats-tool URL | same | same | OpenAIRE stats-tool base URL. Trailing slash required |
| `osoStatsProfileName` | yes | `observatory` | `observatory` | `observatory` | Profile name sent with OpenAIRE stats-tool queries |
| `OS_EUROPE_API_ENDPOINT` | yes | OS-Europe API URL | same | same | OS-Europe API base URL (public answers for country pages) |
| `projectName` | no | `Observatory` | `Observatory` | `Observatory` | Not read by application code today |
| `matomoTrackerUrl` | yes | fixed URL | fixed URL | `$MATOMO_URL` | Matomo tracker. Tracking only starts after the visitor consents |
| `matomoSiteId` | yes | `3` | `2` | `$MATOMO_SITE_ID` | Matomo site id (a string in prod because of the placeholder) |
| `RECAPTCHA_V3_KEY` | yes | public site key | `$RECAPTCHA_V3_SITE_KEY` | `$RECAPTCHA_V3_SITE_KEY` | reCAPTCHA v3 **site** key for the public contact form |
| `enableSentry` | yes | `false` | `true` | `true` | Initialises Sentry in `main.ts` |
| `sentry.dsn` | if Sentry on | fixed DSN | fixed DSN | `$SENTRY_DSN` | Sentry project DSN |
| `sentry.environment` | if Sentry on | `develop` | `beta` | `$SENTRY_ENV` | Environment label on Sentry events |
| `sentry.tracesSampleRate` | if Sentry on | `1.0` | `1.0` | `1.0` | Fraction of transactions traced |
| `sentry.replaysSessionSampleRate` | if Sentry on | `0.2` | `0.2` | `0.0` | Fraction of sessions recorded |
| `sentry.replaysOnErrorSampleRate` | if Sentry on | `1.0` | `1.0` | `1.0` | Fraction of error sessions recorded |

Values shown as "fixed URL", "public site key" and "fixed DSN" are committed in the file; read them there rather than
copying them into other documents.

The `environment` object is also supplied to the submodules as the `APP_ENV` provider (`app.module.ts`), and
`src/survey-tool/environments/environment.ts` re-exports it, so a single set of keys serves the host and all three
submodules.

## 2. Container runtime variables (`init.sh`, `nginx.conf.txt`)

Set these with `docker run -e ...` or the orchestrator's equivalent.

| Variable | Required | Default | Effect |
|---|---|---|---|
| `PLATFORM_API_ENDPOINT` | **Yes** | none | Upstream URL for nginx `location /api` (`proxy_pass`), e.g. the backend's base URL. Empty makes `nginx -t` fail |
| `STATS_API_ENDPOINT` | **Yes** | none | Upstream URL for nginx `location /stats/api`. Rendered into the template, so it must be non-empty for nginx to start. Note this is a different thing from the `STATS_API_ENDPOINT` key in the Angular environment file. The application does not call this route (its statistics calls go through `/api/statistics/`); it is kept for existing external callers, see the note on statistics in [integration.md](integration.md) |
| `ENABLE_SSL` | Recommended | unset | Set to `TRUE` to install `certbot-nginx` at start-up and obtain/install a certificate. Set it explicitly (`FALSE` otherwise): when unset, bash prints `[: ==: unary operator expected` and continues without SSL |
| `SERVER_NAME` | With SSL | unset | Adds `server_name` to nginx; the certificate is requested for this name |
| `SSL_EMAIL` | No | unset | Contact e-mail for certbot. Without it certbot registers without an e-mail |
| `MATOMO_URL` | Prod build | none | Replaces `$MATOMO_URL` in `main.*.js` |
| `MATOMO_SITE_ID` | Prod build | none | Replaces `$MATOMO_SITE_ID` in `main.*.js` |
| `RECAPTCHA_V3_SITE_KEY` | Prod and beta builds | none | Replaces `$RECAPTCHA_V3_SITE_KEY` in `main.*.js` |
| `SENTRY_DSN` | Prod build, if Sentry is wanted | none | Replaces `$SENTRY_DSN` in `main.*.js`; with an empty value Sentry has no destination and sends nothing |
| `SENTRY_ENV` | Prod build | none | Replaces `$SENTRY_ENV` in `main.*.js` |

How the substitution behaves:

- `envsubst` is limited to exactly the five variables above (`MATOMO_URL`, `MATOMO_SITE_ID`, `RECAPTCHA_V3_SITE_KEY`,
  `SENTRY_DSN`, `SENTRY_ENV`). Any of them that is unset becomes an empty string.
- The **beta** build only contains the `$RECAPTCHA_V3_SITE_KEY` placeholder. Its Matomo settings and Sentry DSN are
  baked in at build time, so setting `MATOMO_*` or `SENTRY_*` has no effect there.
- The nginx file is generated once. If `/etc/nginx/conf.d/nginx.conf` already exists (a restarted container with a
  persisted layer, or a mounted file), `init.sh` leaves it untouched and the nginx variables are not re-read.
- Fixed nginx behaviour (not configurable by variable): `client_max_body_size 200M` and 300 s read/send timeouts on
  `/api`; 90 s on `/stats/api`; `Cache-Control: no-cache` on the SPA fallback; Joomla upstream
  `https://dl001.madgik.di.uoa.gr`. Change them by editing `nginx.conf.txt` and rebuilding.

## 3. Development proxy (`proxy.conf.js`)

Used by `npm start`. Edit the file to point at another backend.

| Context | Target | Notes |
|---|---|---|
| `/api/websocket/**` | `http://localhost:8280/` | `ws: true` |
| `/api/**` | `http://localhost:8280/` | |
| `/pages/**` | `https://dl001.madgik.di.uoa.gr/` | Path rewritten (`/pages` → `/`) |
| `/templates/yootheme/**`, `/component/content/**`, `/media/system/**`, `/media/vendor/**` | `https://dl001.madgik.di.uoa.gr/` | Joomla assets |

## Build arguments

`Dockerfile` accepts:

| Argument | Default | Meaning |
|---|---|---|
| `configuration` | `prod` | Selects `npm run build:<configuration>` (`prod` or `beta`) |
| `sentry_token` | empty | Sentry auth token used to upload source maps. Supply it only from CI credentials; never commit or log it |
| `sentry_endpoint` | empty | Sentry URL for the upload. With no token the upload step is skipped |

The Jenkins pipeline passes only `configuration` (see [deployment.md](deployment.md)). `NODE_OPTIONS` is set to
`--max-old-space-size=4096` in the build stage.

## Other build settings

- `angular.json`: assets, styles and scripts from the submodules are listed here (see [architecture.md](architecture.md)).
- `tsconfig.json`: `strictTemplates` is on; `strict` is off.
- `release-please-config.json` / `.release-please-manifest.json`: release automation. The manifest holds the current
  version; do not edit by hand.
- Third-party resources loaded by `index.html` at run time: Google Fonts (Material Icons/Symbols) and a flags
  stylesheet from jsDelivr. Networks that block these will show missing icons or flags.
