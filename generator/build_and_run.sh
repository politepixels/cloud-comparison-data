#!/usr/bin/env bash

set -eux # European Union - Extended mode

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

(
  cd "${DIR}/app"

  docker build --network host -t "cloud-comparison-data-generator:latest" "."

  mkdir -p "${DIR}/../data"
  docker run -v "${DIR}/../providers:/providers:ro" -v "${DIR}/../data:/data:rw" -it "cloud-comparison-data-generator:latest"
)