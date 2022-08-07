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
  "sync_file_range": {
    "unit": "$(retrieveDatum "1" 'sync percentiles \(([a-z]+)')",
    "99th_percentile": $(retrieveDatum "3" 'fsync(\n|.)*sync percentiles(\n|.)*99\.00th=\[[[:space:]]*([0-9]+)')
  },
  "read": "$(retrieveDatum "1" 'READ\: bw\=([0-9a-zA-Z\/]+)')",
  "write": "$(retrieveDatum "1" 'WRITE\: bw\=([0-9a-zA-Z\/]+)')"
}
EOF