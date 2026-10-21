# Deployment

`observatory-ui` is deployed as one Docker image: a multi-stage build compiles the Angular bundle, and the runtime is
`nginx:alpine`, which serves the static files and reverse-proxies the backend. There is no database and no
migration step.

## Prerequisites

| Item | Requirement |
|---|---|
| Build host | Docker (BuildKit enabled in CI), network access to the npm registry |
| Source tree | **Submodules checked out** (`git submodule update --init --recursive`). The Dockerfile copies the whole tree, and the app does not compile without `src/survey-tool`, `src/survey-tool/catalogue-ui` and `src/messaging-system-ui` |
| Build image | `node:20` (Angular 20 needs Node 20.19+) |
| Runtime image | `nginx:alpine` plus `bash`; the entrypoint is `init.sh` |
| Runtime network | Container can reach the Observatory backend (`PLATFORM_API_ENDPOINT`), the statistics upstream (`STATS_API_ENDPOINT`) and `https://dl001.madgik.di.uoa.gr` (Joomla pages) |
| Visitor network | Browsers must reach the OpenAIRE stats-tool and OS-Europe API, Matomo, Sentry, Google Fonts, jsDelivr and Google reCAPTCHA (see [integration.md](integration.md)) |

There is no `.dockerignore`, so build from a clean checkout (CI does): a local `node_modules/` or `dist/` would be
copied into the build context and over the freshly installed dependencies.

## Build and artefact

```bash
docker build --build-arg configuration=prod -t observatory-ui:<version> .
```

| Stage | What happens |
|---|---|
| `build` (`node:20`) | `npm ci`, then `npm run build:<configuration>` (`prod` or `beta`) with a 4 GB heap; output `dist/observatory-ui`. If `sentry_token` and `sentry_endpoint` are given, source maps are injected and uploaded to Sentry, otherwise that step is skipped |
| runtime (`nginx:alpine`) | Copies `dist/observatory-ui` to `/usr/share/nginx/html`, `nginx.conf.txt` to `/etc/nginx/nginx.conf.txt` and `init.sh` to `/` |

The artefact is the image. Exposed port: `80`. No volumes are declared. Configuration is described in
[configuration.md](configuration.md).

## Run

```bash
docker run -d --name observatory-ui -p 8080:80 \
  -e PLATFORM_API_ENDPOINT=<backend base URL> \
  -e STATS_API_ENDPOINT=<statistics upstream URL> \
  -e ENABLE_SSL=FALSE \
  -e MATOMO_URL=<matomo URL> -e MATOMO_SITE_ID=<id> \
  -e RECAPTCHA_V3_SITE_KEY=<site key> \
  -e SENTRY_DSN=<dsn or empty> -e SENTRY_ENV=<label> \
  observatory-ui:<version>
```

Values come from the deployment's secret/config store, not from this repository.

`init.sh` does the following at every start:

1. Finds `main.*.js` in the web root and runs `envsubst` over exactly `MATOMO_URL`, `MATOMO_SITE_ID`,
   `RECAPTCHA_V3_SITE_KEY`, `SENTRY_DSN` and `SENTRY_ENV`.
2. If `ENABLE_SSL` is `TRUE`, installs `certbot-nginx` with `apk` (needs internet access at start-up).
3. If `/etc/nginx/conf.d/nginx.conf` does not exist yet: renders it from `nginx.conf.txt` (`ADD_SERVER_NAME`,
   `PLATFORM_API_ENDPOINT`, `STATS_API_ENDPOINT`), removes the default site, tests and reloads nginx. With SSL it then
   runs `certbot install` or, failing that, requests a certificate for `SERVER_NAME`.
4. Starts `nginx -g "daemon off;"` in the foreground.

nginx routes (`nginx.conf.txt`):

| Location | Behaviour |
|---|---|
| `/` | SPA fallback to `index.html`, `Cache-Control: no-cache` |
| `/api` | Proxy to `PLATFORM_API_ENDPOINT`, WebSocket upgrade enabled, 300 s timeouts, 200 MB request body limit |
| `/stats/api` | Proxy to `STATS_API_ENDPOINT`, 90 s timeouts |
| `/pages`, `/(templates\|component\|media\|files)/` | Proxy to the Joomla host |
| `*.eot`, `*.ttf`, `*.woff` | `Access-Control-Allow-Origin: *` |

## Deployment order and dependencies

1. Backend API (and what it depends on) is running and reachable at `PLATFORM_API_ENDPOINT`, with its OAuth2 login
   (reached by the browser at `/api/oauth2/authorization/eosc`) working behind the same public host name as the UI.
2. The statistics upstream and the Joomla host are reachable from the container.
3. Deploy the UI container. It can start before the backend, but the application will not load data until the
   backend is up.
4. If a load balancer or reverse proxy terminates TLS in front of the container, forward the `Host`,
   `X-Forwarded-For` and `X-Forwarded-Proto` headers and keep WebSocket upgrades enabled. Otherwise use `ENABLE_SSL=TRUE`.

## Production considerations

- Use the `prod` configuration for production. The image must be started with the five `envsubst` variables, because
  the prod bundle contains the literal placeholders.
- The Sentry token is needed only at image build time and must come from CI credentials.
- With built-in certbot, certificates live inside the container filesystem (no volume is declared). Mount
  `/etc/letsencrypt` if the container is recreated often, to avoid re-issuing certificates.
- Publish and deploy versioned tags (`x.y.z`) rather than `latest`, so a rollback target always exists.

## CI/CD (Jenkinsfile)

| Aspect | Behaviour |
|---|---|
| Version | Read from `package.json` (`"version"`) |
| Configuration | `beta` by default; `prod` for tag builds and the `main` branch |
| Image | `docker-registry.openaire.eu/eoscobservatory/observatory-ui:<version>` |
| Pushed tags | Tag build: `x.y.z`, `x.y` and `latest`. `main`: `latest`. `develop`: `dev`. Other branches build but do not push |
| Releases | On `main` (not PRs), `release-please` creates the GitHub release and the release PR; it bumps `package.json`/`CHANGELOG.md` according to conventional commits |
| Tests | The pipeline does not run `npm test` |
| Notifications | E-mail to developers on failure and on recovery |

## Post-deployment verification

There is no dedicated health endpoint. Use these checks:

| Check | Expected |
|---|---|
| `GET /` | `200`, the `app-root` page |
| `GET /home/x/y` (any unknown route) | `200` with the same `index.html` (SPA fallback) |
| `GET /api/user/info` | A response produced by the backend (its status depends on whether a session exists). `502`/`504` from nginx means the proxy cannot reach `PLATFORM_API_ENDPOINT` |
| `GET /api/websocket/info` | JSON from the backend's SockJS endpoint (the client connects with SockJS) |
| Browser console on `/home` | No failed requests to `/api`, the statistics service or `/pages` |
| Login | The login button redirects to the identity provider and returns to the same page |
| Cookie banner | Appears on first visit; no request is sent to Matomo until analytics is accepted |
| Container log | `nginx -t` reports `syntax is ok`; no `unary operator expected` message (set `ENABLE_SSL` explicitly) |

## Rollback

The image is stateless, so rollback is redeploying the previous version tag with the same environment variables.
Check that the backend API version in use is still compatible with the older UI. Browsers pick up the older
bundle on the next load because `index.html` is served with `no-cache` and the bundle files are content-hashed.
