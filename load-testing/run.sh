#!/usr/bin/env bash

set -eux # European Union - Extended mode

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

ENV_PATH="${DIR}/../generator/app/secret.env"

if [[ -f "${ENV_PATH}" ]]; then
  export $(grep -v '^#' "${ENV_PATH}" | xargs)
fi

PROVIDERS="$(find providers -mindepth 1 -maxdepth 1 -type d -prune | grep -iE "${1:-.}")" #so you can filter what providers to test with ./run "aws|gcloud"

while read -r PROVIDER; do
  PROVIDER_BASENAME="$(basename "${PROVIDER}")"

  echo "Running Provider: ${PROVIDER_BASENAME}"

  mkdir -p "${DIR}/results/${PROVIDER_BASENAME}"

  (
    cd "${DIR}/${PROVIDER}" || exit

    if [[ -d "${DIR}/${PROVIDER}/.terraform" ]]; then
      rm -rf "${DIR}/${PROVIDER}/.terraform"
    fi

    "${DIR}/deps/terraform" init -var="hetzner_api_key=${HETZNER_API_KEY}"
    "${DIR}/deps/terraform" apply -var="hetzner_api_key=${HETZNER_API_KEY}" --auto-approve
    "${DIR}/deps/terraform" destroy -var="hetzner_api_key=${HETZNER_API_KEY}" --auto-approve
  )
done <<< "${PROVIDERS}"