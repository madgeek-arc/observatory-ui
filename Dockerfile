### Install and Build ###
FROM node:16 AS build

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci
COPY . .
ARG configuration=prod
RUN npm run build:$configuration


### Create Container ###
FROM nginx:alpine

COPY --from=build /usr/src/app/dist/observatory-ui /usr/share/nginx/html
COPY nginx.conf.txt /etc/nginx/nginx.conf.txt
COPY init.sh /

RUN apk update && apk add bash
ENTRYPOINT ["/bin/bash", "/init.sh"]
EXPOSE 80
