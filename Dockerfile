### Install and Build ###
FROM node:22 AS build

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci
ENV NODE_OPTIONS="--max-old-space-size=4096"
COPY . .
ARG configuration=prod
RUN npm run build:$configuration

ARG sentry_token=''
ARG sentry_endpoint=''
RUN ./node_modules/.bin/sentry-cli sourcemaps inject --org madgeek --project observatory-ui ./dist/observatory-ui && SENTRY_AUTH_TOKEN=$sentry_token ./node_modules/.bin/sentry-cli --url $sentry_endpoint sourcemaps upload --org madgeek --project observatory-ui ./dist/observatory-ui || echo "Skipping sending sourcemaps to Sentry.."


### Run Tests ###
# Not part of the image: BuildKit skips this stage unless it is asked for with `docker build --target test`.
FROM build AS test

RUN apt-get update && apt-get install -y --no-install-recommends chromium && rm -rf /var/lib/apt/lists/*
ENV CHROME_BIN=/usr/bin/chromium
# Exit codes are recorded instead of failing the build, so the reports can still be exported
RUN mkdir -p reports \
 && { npm run test:ci; echo $? > reports/karma.exit; } \
 && { npm run test:scripts:ci; echo $? > reports/scripts.exit; }


### Export Test Reports ###
# Used with `docker build --target test-reports --output type=local,dest=<dir>`
FROM scratch AS test-reports
COPY --from=test /usr/src/app/reports /


### Create Container ###
FROM nginx:alpine

COPY --from=build /usr/src/app/dist/observatory-ui /usr/share/nginx/html
COPY nginx.conf.txt /etc/nginx/nginx.conf.txt
COPY init.sh /

RUN apk update && apk add bash
ENTRYPOINT ["/bin/bash", "/init.sh"]
EXPOSE 80
