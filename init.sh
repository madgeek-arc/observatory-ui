#!/bin/bash

# Substitute Matomo, reCAPTCHA and Sentry properties
# The environment placeholders can end up in a shared chunk-*.js and not only in main-*.js, so every bundle containing one is substituted
PROPERTY_FILES=$(find /usr/share/nginx/html -name '*.js' -exec grep -lF -e '$MATOMO_URL' -e '$MATOMO_SITE_ID' -e '$RECAPTCHA_V3_SITE_KEY' -e '$SENTRY_DSN' -e '$SENTRY_ENV' {} +)
for PROPERTY_FILE in $PROPERTY_FILES; do
  PROPERTY_TMP="$PROPERTY_FILE.tmp"
  echo "Substituting properties in $PROPERTY_FILE"
  cp $PROPERTY_FILE $PROPERTY_TMP
  envsubst '${MATOMO_URL} ${MATOMO_SITE_ID} ${RECAPTCHA_V3_SITE_KEY} ${SENTRY_DSN} ${SENTRY_ENV}' < $PROPERTY_TMP > $PROPERTY_FILE
  rm $PROPERTY_TMP
done

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
