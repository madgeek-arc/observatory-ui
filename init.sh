#!/bin/bash

# Substitute Matomo Properties
MAIN_PROXY_CONF_FILE=$(echo "/usr/share/nginx/html/$(ls /usr/share/nginx/html/ | grep -e 'main.')")
MAIN_TMP=$(echo "$MAIN_PROXY_CONF_FILE.tmp")
echo "main.js = $MAIN_PROXY_CONF_FILE | main-tmp: $MAIN_TMP"
cp $MAIN_PROXY_CONF_FILE $MAIN_TMP
envsubst '${MATOMO_URL} ${MATOMO_SITE_ID}' < $MAIN_TMP > $MAIN_PROXY_CONF_FILE
rm $MAIN_TMP

# Create Nginx configuration
CONF_TMPL=/etc/nginx/nginx.conf.txt
PROXY_CONF_FILE=/etc/nginx/conf.d/nginx.conf
EMAIL_ARG="--register-unsafely-without-email"
ADD_SERVER_NAME=""

if [ $ENABLE_SSL == "TRUE" ]; then
    apk add certbot-nginx
fi
if [ -f "$PROXY_CONF_FILE" ]; then
    echo "Nginx configuration already exists: $PROXY_CONF_FILE "
else
    echo "Creating Nginx configuration: $PROXY_CONF_FILE"

    [ ! -z ${SERVER_NAME+x} ] && export ADD_SERVER_NAME="server_name ${SERVER_NAME}";
    envsubst '${ADD_SERVER_NAME} ${PLATFORM_API_ENDPOINT} ${STATS_API_ENDPOINT}' < $CONF_TMPL > $PROXY_CONF_FILE

    rm /etc/nginx/conf.d/default.conf || echo "File '/etc/nginx/conf.d/default.conf' already deleted. OK"
    nginx -t
    cat $PROXY_CONF_FILE
    nginx -s reload

    if [ ! "$ENABLE_SSL" == "TRUE" ]; then
      echo "Simple Configuration"
    else
      echo "Using SSL Configuration"

      if [ ! -z ${SSL_EMAIL+x} ]; then
          EMAIL_ARG="-m $SSL_EMAIL"
      fi

      certbot install --cert-name $SERVER_NAME || certbot --nginx -d $SERVER_NAME --non-interactive --agree-tos $EMAIL_ARG

      nginx -t
      cat $PROXY_CONF_FILE
      nginx -s reload
    fi
fi

nginx -g "daemon off;"
