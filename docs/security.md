# Security

This document describes the security-relevant behaviour of the frontend. Access control and data protection are
enforced by the backend; the browser application can only hide or redirect.

## Authentication

- **Mechanism:** server-side session established by an OAuth2/OIDC authorisation-code flow handled entirely by the
  backend. The UI starts it by navigating the whole window to `API_LOGIN` (`/api/oauth2/authorization/eosc` in beta and
  production, `/api/login` in development) and never sees tokens or client secrets.
- **Session discovery:** `AuthenticationService.authenticated` is true when `UserService` holds a user from
  `GET /api/user/info`. `AuthGuard` calls that endpoint; on an empty answer or an error it stores the current path in
  `sessionStorage.redirectUrl` and starts the login. After login `AppComponent` navigates back to the stored path.
- **Refresh:** `UserService` re-reads `/user/info` every 60 minutes. A `401` from any call clears the cached user
  (`HttpInterceptorService`).
- **Logout:** clears `sessionStorage`, removes the `AccessToken` cookie if present, drops the cached user and
  navigates to `/api/logout`.

## Authorisation

`GET /user/info` returns the groups the user belongs to: `stakeholders`, `coordinators`, `administrators`, and an `admin`
flag. The UI uses them to choose the landing page (stakeholder, coordinator or administrator home) and to enable
screens:

| Guard / check | Rule |
|---|---|
| `AuthGuard` | A user must be logged in |
| `ArchiveGuardService`, `EoscReadinessGuard` | Coordinator of type `eosc-sb`, or admin of an `eosc-sb` stakeholder group |
| Country pages configuration | Platform admin, or `eosc-sb` coordinator or administrator |

A `StakeholderManagerGuard` (stakeholder `admins` contains the user's e-mail) exists in survey-tool but is not attached
to any route at present.

These checks are conveniences. Every request is authorised again by the backend, and a `403` response makes the UI
show "You do not have access to this resource" and navigate to `/home`.

## Token and session handling

| Item | Where | Notes |
|---|---|---|
| Session cookie (`SESSION`) | Browser cookie set by the backend | Not readable or written by application code |
| `XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header | Angular `withXsrfConfiguration` in `app.module.ts` | Added by Angular to state-changing requests to the same origin; also sent in the STOMP CONNECT headers |
| `userInfo`, `currentStakeholder`, `currentCoordinator`, `currentAdministrator`, `redirectUrl` | `sessionStorage` | Per tab; cleared on logout. `userInfo` contains the user's name, e-mail and profile |
| `consent` cookie | First-party | Cookie-consent choice, `SameSite=Lax`, `Secure` on HTTPS, 395 days |
| `AccessToken` cookie | Browser cookie | Not created by this application. It is only deleted on logout; messaging-system-ui no longer sends it as an `Authorization` header (see its [security notes](../src/messaging-system-ui/docs/security.md)) |

## CORS and CSRF

The UI and `/api` share one origin (the nginx proxy), so no CORS configuration is needed for the application's own
calls. Font files are served with `Access-Control-Allow-Origin: *`. CSRF protection relies on the
`XSRF-TOKEN`/`X-XSRF-TOKEN` double-submit mechanism above, which the backend must enforce.

## Consent, analytics and error reporting

- Matomo is created with `requireConsent: 'tracking'` (`app.module.ts`): no data is sent and no Matomo cookie is set
  until the visitor accepts analytics in the cookie banner (`shared/cookies`). Rejecting or withdrawing deletes Matomo's cookies.
- Sentry is enabled by `enableSentry`. Session replay is sampled (`sentry.replaysSessionSampleRate`, `0.0` in
  production, replays on error at `1.0`); the SDK error dialog is disabled. Review what pages can show before raising
  these rates.
- reCAPTCHA v3 protects the public contact form; the token is sent to the backend in the `g-recaptcha-response` header.

## Input and content handling

- Content from the backend that contains HTML (survey answers, descriptions, message bodies) is bound with
  `[innerHTML]`, so Angular's built-in sanitizer removes scripts and unsafe attributes.
- Some code deliberately bypasses the sanitizer (`DomSanitizer.bypassSecurityTrust*`, the `safeUrl` pipe): iframe URLs
  (Joomla pages, the country-page and archive chart iframes), inline SVG icons, the profile picture data URL, and
  form-model descriptions in catalogue-ui. Such a value must come from a fixed list or a trusted source; do not add a
  bypass for a string a visitor can influence, and review these sites whenever their inputs change.
- The Joomla iframe loader accepts `postMessage` events only from a fixed list of origins and only for the
  `joomla-navigate` message type. Its `path` query parameter is used only when it resolves to an http(s) URL on the
  application's own origin (`safeIframePath` in `pages/iframe-loader/iframe-path.ts`, which returns the normalised
  path); any other value is ignored and the default page is shown.
- Rich text entered by users is produced by the TipTap editor in catalogue-ui, which limits what users can create
  but is not a sanitizer (see its [security notes](../src/survey-tool/catalogue-ui/docs/security.md)).

## Secrets and configuration

- No server-side secret belongs in this repository. Values in `environment*.ts` end up in the public bundle.
- Public client identifiers (reCAPTCHA site key, Sentry DSN, Matomo URL) are supplied at container start for production
  (see [configuration.md](configuration.md)).
- The Sentry auth token for source-map upload is passed as a Docker build argument from CI credentials. Do not
  commit it, print it in logs, or reuse it as a runtime variable.
- `.sentryclirc` is git-ignored; if a local Sentry CLI token is needed, keep it only there.

## Transport

- Production must be served over HTTPS, either terminated upstream (load balancer or ingress) or in the container with
  `ENABLE_SSL=TRUE` (certbot). The consent cookie adds `Secure` automatically on HTTPS.
- The nginx image adds no security response headers (no CSP, HSTS, `X-Frame-Options`, ...). Add them at the
  upstream proxy or extend `nginx.conf.txt`. Note that the Joomla pages are embedded in an iframe and Highcharts/UIkit
  inject inline styles, so a Content-Security-Policy needs testing before it is enforced.

## Logging

- The UI logs to the browser console only; do not log tokens, session identifiers or personal data. The existing
  `console.log` of route parameters in `iframe-loader.component.ts` and of cookie-presence in `AuthenticationService`
  should not be extended to sensitive values.
- Sentry events and replays may contain URLs, user actions and page content: keep PII out of URLs and error messages.
