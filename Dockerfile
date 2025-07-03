### Install and Build ###
FROM node:16 AS build

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci
COPY . .
ARG configuration=prod
RUN npm run build:$configuration

ARG sentry_token=''
ARG sentry_endpoint=''
RUN ./node_modules/.bin/sentry-cli sourcemaps inject --org madgeek --project observatory-ui ./dist/observatory-ui && SENTRY_AUTH_TOKEN=$sentry_token ./node_modules/.bin/sentry-cli --url $sentry_endpoint sourcemaps upload --org madgeek --project observatory-ui ./dist/observatory-ui || echo "Skipping sending sourcemaps to Sentry.."


### Create Container ###
FROM nginx:alpine

COPY --from=build /usr/src/app/dist/observatory-ui /usr/share/nginx/html
COPY nginx.conf.txt /etc/nginx/nginx.conf.txt
COPY init.sh /

RUN apk update && apk add bash
ENTRYPOINT ["/bin/bash", "/init.sh"]
EXPOSE 80
