#!/bin/bash

script_dir="$(dirname "$(readlink -f "$0")")"

# Create a `.env.local` file by merging values from the current environment with a template

template_path="$script_dir/../../.env.local.template"

if [[ ! -f $template_path ]]; then
    # Template file does not exist so we can't go any further
    exit 0
fi

output_path="$script_dir/../../.env.local"

if [[ -f $output_path ]]; then
    # We only want to create the `.env.local` file if it does not already exist
    # In the development environment the developer should be in control of their `.env.local` file so it should exist
    # In CI the `.env.local` file should not exist as it should not be committed to the repo
    exit 0
fi

# Read the template file

declare -A template

while IFS='=' read -r key value; do
    template["$key"]="$value"
done < "$template_path"

# For each key in the template, check if there is a corresponding environment variable and if so, add it to an object

declare -A env_vars

for key in "${!template[@]}"; do
    if [[ -n ${!key} ]]; then
        env_vars["$key"]="${!key}"
    else
        env_vars["$key"]=""
    fi
done

# Write the object to the output file in env file format

{
    for key in "${!env_vars[@]}"; do
        echo "$key=${env_vars[$key]}"
    done | sort
} > "$output_path"
