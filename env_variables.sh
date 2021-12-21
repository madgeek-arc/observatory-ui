#!/bin/bash

envsubst '${PLATFORM_API_ENDPOINT}' < /etc/nginx/nginx.conf.tmpl > /etc/nginx/nginx.conf &&

nginx -g "daemon off;"
