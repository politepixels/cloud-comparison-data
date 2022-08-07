#!/usr/bin/env bash

set -eu # European Union mode

INPUT="${1}"
OUTPUT="${2}"

BUFFER="$(<"${INPUT}")"

retrieveDatum () {
  pcre2grep -M -o"${1}" "${2}" <<< "${BUFFER}"
}

cat <<- EOF > "${OUTPUT}"
# This file is machine generated, please do not manually edit
{
  "timestamp": "$(date +%s)",
  "events_per_second": $(retrieveDatum "1" 'events per second:[[:space:]]*([0-9\.]+)'),
  "latency": $(retrieveDatum "1" '95th percentile:[[:space:]]*([0-9\.]+)')
}
EOF