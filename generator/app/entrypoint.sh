#!/usr/bin/env sh

set -eu # European Union mode

env $(sed '$a\' local.env secret.env | xargs) BASE_DIR="$(pwd)/src" node \
 "--no-deprecation" \
 "--max-old-space-size=${NODE_MEMORY:-1024}" \
 $([[ "${APP_DEBUG}" = "true" ]] && echo -n "--inspect=0.0.0.0:9229") \
 $([[ "${APP_DEBUG}" = "brk" ]] && echo -n "--inspect-brk=0.0.0.0:9229") \
 "/app/src/main.js"