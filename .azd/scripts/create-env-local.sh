#!/bin/bash

# Function to remove quotes from a value
remove_quotes() {
    local value=$1
    local quote_char=${2:-'"'}
    echo "$value" | sed "s/^$quote_char//;s/$quote_char$//"
}

# Function to read env vars from a file and store them in a global array
read_env_vars() {
    local path=$1
    local -a required_vars=("PINECONE_API_KEY" "OPENAI_API_KEY" "PINECONE_REGION" "PINECONE_INDEX_NAME")
    local -a temp_vars=()

    if [[ ! -f $path ]]; then
        return
    fi

    while IFS= read -r line || [ -n "$line" ]; do
        # Remove comments and trim whitespace
        line=$(echo "$line" | cut -d'#' -f1 | xargs)

        # Skip empty lines
        if [[ -z $line ]]; then
            continue
        fi

        # Split the line into key and value
        IFS='=' read -r key value <<< "$line"

        # Remove newlines and carriage returns
        value=$(echo "$value" | tr -d '\n\r')

        # Remove quotes
        value=$(remove_quotes "$value" '"')
        value=$(remove_quotes "$value" "'")

        # Check for the required environment variables, if one is blank throw an error
        if [[ " ${required_vars[@]} " =~ " ${key} " ]] && [[ -z $value ]]; then
            if [[ -z ${!key} ]]; then
                echo "$key is not set in the current environment, please supply it."
                exit 1
            else
                value=${!key}
            fi
        fi

        # Store the key-value pair in the temp array
        temp_vars+=("$key=$value")
    done < "$path"

    # Merge temp_vars into env_vars, overwriting existing keys
    for entry in "${temp_vars[@]}"; do
        key=$(echo "$entry" | cut -d'=' -f1)
        value=$(echo "$entry" | cut -d'=' -f2-)
        found=false

        for i in "${!env_vars[@]}"; do
            if [[ "${env_vars[$i]}" == "$key="* ]]; then
                env_vars[$i]="$key=$value"
                found=true
                break
            fi
        done

        if [[ $found == false ]]; then
            env_vars+=("$key=$value")
        fi
    done
}

# Function to update an entry in env_vars array
update_env_var() {
    local var_name=$1
    local var_value=$2
    for i in "${!env_vars[@]}"; do
        if [[ "${env_vars[$i]}" == "$var_name" ]]; then
            env_vars[$i]="$var_name=\"$var_value\""
            return
        fi
    done
}

# Initialize the env_vars array
env_vars=()

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

read_env_vars "$template_path"

# Check for required environment variables

for entry in "${required_vars[@]}"; do
    if [[ -z ${!entry} ]]; then
        echo "${entry} is not set in the current environment, please supply it."
        update_env_var "$entry" "$line"
    fi
done

# Print the env vars to the `.env.local` file
for entry in "${env_vars[@]}"; do
    key=$(echo "$entry" | cut -d'=' -f1)
    value=$(echo "$entry" | cut -d'=' -f2-)
    echo "$key=\"$value\"" >> "$output_path"
done
