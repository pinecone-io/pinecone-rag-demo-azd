#!/bin/bash

merge_env_files() {
    local base=$1
    local with=$2
    local output=$3

    declare -A hash

    while IFS='=' read -r key value; do
        hash[$key]=$value
    done < <(cat "$base" "$with")

    {
        for key in "${!hash[@]}"; do
            echo "$key=${hash[$key]}"
        done | sort
    } > "$output"
}

script_dir="$(dirname "$(readlink -f "$0")")"

env_local="$script_dir/../../.env.local"
env_azd="$script_dir/../../.azure/${AZURE_ENV_NAME}/.env"

env_azure="$script_dir/../../.env.azure"

if [[ ! -f $env_local ]]; then
    cp "$env_azd" "$env_azure"
    exit 0
fi

merge_env_files "$env_local" "$env_azd" "$env_azure"
