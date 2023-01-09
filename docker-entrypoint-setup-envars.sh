#!/usr/bin/env sh
set -eo pipefail

# Find and replace environment variable placeholder names with their values at run time.
echo "Replacing environment variables"
replace() {
  find $DEPLOYMENT_PATH/ -name '*.js' | xargs sed -i "s|$1|$2|g"
  find $DEPLOYMENT_PATH/ -name '*.html' | xargs sed -i "s|$1|$2|g"
}
replace REACT_APP_SITE "${REACT_APP_SITE}"
replace REACT_APP_CLIENT_ID "${REACT_APP_CLIENT_ID}"
replace REACT_APP_AUTH_URL "${REACT_APP_AUTH_URL}"
replace REACT_APP_CONTENT_REPO "${REACT_APP_CONTENT_REPO}"
replace REACT_APP_PREVIEW_HOST "${REACT_APP_PREVIEW_HOST}"
replace REACT_APP_API_STAGING_HOST "${REACT_APP_API_STAGING_HOST}"
replace REACT_APP_API_HOST "${REACT_APP_API_HOST}"
