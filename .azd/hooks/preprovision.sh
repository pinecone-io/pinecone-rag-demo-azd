#!/bin/bash

script_dir="$(dirname "$(readlink -f "$0")")"

# Run script to generate a `.env.local` file
"$script_dir/../scripts/create-env-local.sh"

# Run script to generate an `env-vars.json` file used by the infra scripts
"$script_dir/../scripts/create-infra-env-vars.sh"
