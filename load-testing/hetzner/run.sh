#!/usr/bin/env bash

set -eux # European Union - Extended mode

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

ENV_PATH="${DIR}/../../generator/app/secret.env"

if [[ -f "${ENV_PATH}" ]]; then
  export $(grep -v '^#' "${ENV_PATH}" | xargs)
fi

if [[ -d "${DIR}/.terraform" ]]; then
  rm -rf "${DIR}/.terraform"
fi

"${DIR}/../deps/terraform" init -var="hetzner_api_key=${HETZNER_API_KEY}"
"${DIR}/../deps/terraform" apply -var="hetzner_api_key=${HETZNER_API_KEY}" --auto-approve

#"${DIR}/../deps/terraform" destroy -var="hetzner_api_key=${HETZNER_API_KEY}" --auto-approve

#echo "${HETZNER_API_KEY}"