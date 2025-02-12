# pinecone-rag-demo-azd

An `azd` ([Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)) template for getting a [Next.js](https://nextjs.org/) app running on Azure Container Apps with CDN and Application Insights.

The Next.js app included with the template has been generated with [`create-next-app`](https://nextjs.org/docs/getting-started/installation#automatic-installation) and has some additional code and components specific to this template that provide:

* [Server-side and client-side instrumentation and logging via App Insights](#application-insights)
* [Serving of Next.js static assets through an Azure CDN (with cache busting)](#azure-cdn)
* [Support for custom domain names and automatic canonical host name redirect](#adding-a-custom-domain-name)
* [Support for checking the current environment at runtime](#checking-the-current-environment-at-runtime)

Of course with this being an `azd` template you are free to build on top of the sample app, replace the sample app with your own, or cherry-pick what you want to keep or remove.

## Quickstart

### Setting up the environment

Before starting, be sure you have set all of the required secrets and environment variables in your Github repo, under Settings -> Environments. Please see [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) for more details on how to set up environments.

The minimum environment variables and secrets you will need to set are:

- PINECONE_API_KEY: You can retrieve this from your [Pinecone project's list of API keys](https://app.pinecone.io/-/projects/-/keys).
- OPENAI_API_KEY: From [your OpenAI project's keys](https://platform.openai.com/api-keys)
- PINECONE_REGION: The region your index is in (or will be in).
- PINECONE_INDEX: The name of your index. Defaults to "pinecone-azd-rag-demo".
- AZURE_SUBSCRIPTION_ID: Run `azd config show` locally to retrieve your subscription ID.
- AZURE_ENV_NAME: The name of your Azure environment.
- AZURE_LOCATION: The Azure region you are using.

There are other variables available but those are optional.

### Proceeding with the first deployment

The quickest way to try this `azd` template out is using [GitHub Codespaces](https://docs.github.com/en/codespaces) or in a [VS Code Dev Container](https://code.visualstudio.com/docs/devcontainers/containers):

[![Open in GitHub Codespaces](https://img.shields.io/static/v1?style=for-the-badge&label=GitHub+Codespaces&message=Open&color=brightgreen&logo=github)](https://codespaces.new/pinecone-io/pinecone-rag-demo-azd)
[![Open in Dev Container](https://img.shields.io/static/v1?style=for-the-badge&label=Dev+Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/pinecone-io/pinecone-rag-demo-azd)

Then from a Terminal:

```bash
# install dependencies
npm i

# create a `.env.local` file from the provided template
npm run env:init

# follow the prompts to sign in to your Azure account
azd auth login

# follow the prompts to provision the infrastructure resources in Azure
azd provision

# deploy the app to the provisioned infrastructure
azd deploy
```

> The output from the `azd deploy` command includes a link to the Resource Group in your Azure Subscription where you can see the provisioned infrastructure resources. A link to the Next.js app running in Azure is also included so you can quickly navigate to your Next.js app that is now hosted in Azure.

🚀 You now have a Next.js app running in Container Apps in Azure with a CDN for fast delivery of static files and Application Insights attached for monitoring!

💥 When you're done testing you can run `azd down` in the terminal and that will delete the Resource Group and all of the resources in it.

## Setting up locally

If you do not have access to or do not want to work in Codespaces or a Dev Container you can of course work locally, but you will need to ensure you have the following pre-requisites installed:

* [Node.js](https://nodejs.org/) v18.17 or later
  * This Node.js version is a [minimum requirement of Next.js](https://nextjs.org/docs/getting-started/installation)
  * Use of [`nvm`](https://github.com/nvm-sh/nvm) or [`fnm`](https://github.com/Schniz/fnm) is recommended
* [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

> `azd` supports several [development environments](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/supported-languages-environments#supported-development-environments). This template was developed in VS Code, and has been tested in GitHub Codespaces and Dev Containers (via VS Code). Visual Studio has not been tested.
>
> `npm` is used as it is the "safest" default. You should be able to switch out for the package manager of your choice, but only `npm` has been tested.

✔️ Once you have everything installed you can clone this repo and [start developing](#developing-your-app-with-this-template) or [deploy to Azure with the `azd` CLI](#deploying-to-azure-with-the-azd-cli).

## Deploying to Azure with the `azd` CLI

To deploy your app from your Terminal with `azd` run:

```bash
# install dependencies (if you have not already done so)
npm i

# follow the prompts to sign in to your Azure account (if you are not already signed in)
azd auth login

# create a `.env.local` file from the provided template (if you don't already have a `.env.local` file - this will be a no-op if you have)
npm run env:init

# follow the prompts to provision the infrastructure resources in Azure
azd provision

# deploy the app to the provisioned infrastructure
azd deploy
```

Then when you're finished with the deployment run:

```bash
# delete the app and its infrastructure from Azure
azd down
```

> `azd` has an `azd up` command, which the [docs describe as](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create#update-azureyaml) *"You can run `azd up` to perform both `azd provision` and `azd deploy` in a single step"*. Running `azd up` is actually the equivalent of `azd package` -> `azd provision` -> `azd deploy` though, which does not work for this template because outputs from the `azd provision` step such as the app's URL and the CDN endpoint URL are required by `next build`, which is run inside the `Dockerfile` during `azd package`. So unless the behaviour of `azd up` can be changed in future you will need to continue to run `azd provision` -> `azd deploy`.

## Deploying to Azure with `azd` in a CI/CD pipeline

This template supports automated provisioning and deployment of your application and its infrastructure via a CI/CD pipeline running in GitHub Actions or Azure DevOps via the same `azd` process that you can run locally:

* Please refer to the [Environment variables](#how-the-envlocal-file-is-generated-when-running-in-a-pipeline) section of this document to read up on how environment variables are catered for inside CI/CD pipelines
* Please refer to the [Pipelines](#pipelines) section of this document for information on how to setup a CI/CD pipeline on either of the supported platforms

## Application Insights

The template includes instrumentation and components to enable server-side and client-side instrumentation and logging via App Insights when deployed to Azure.

### Server-side instrumentation and components

Server-side instrumentation is implemented using the [Application Insights for Node.js (Beta)](https://github.com/microsoft/ApplicationInsights-node.js/tree/beta) package. The package is initialised via Next.js's [Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation) feature and leverages Next.js's support for [OpenTelemetry](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry).

The template also provides a logging implementation to allow for explicit logging of errors, warnings etc in your app's server-side code (including inside server components). The logger is implemented using [`pino`](https://getpino.io/) and sends logs to Application Insights via a `pino` [transport](https://github.com/CMeeg/pino-appinsights-transport). To use the logger in your app you can `import { logger } from '@/lib/instrumentation/logger'`.

💡 To prevent runtime errors the `applicationinsights` and `pino` packages are opted-out of Next.js's bundling process via [`serverComponentsExternalPackages`](https://nextjs.org/docs/app/api-reference/next-config-js/serverComponentsExternalPackages).

> Server-side instrumentation and logging to Application Insights requires a connection string to an Application Insights resource to be provided via the environment variable `APPLICATIONINSIGHTS_CONNECTION_STRING`. This environment variable is provided to the app automatically by `azd provision`.
>
> If the connection string is not available, for example when running in your development environment outside of `azd provision`, the instrumentation will not be initialised and the logger will fallback to using the [`pino-pretty`](https://github.com/pinojs/pino-pretty) transport to log to `console`.

### Client-side instrumentation and logging

Client-side instrumentation is implemented using the [Microsoft Application Insights JavaScript SDK - React Plugin](https://github.com/microsoft/applicationinsights-react-js) package. The package is initialised in a `AppInsightsProvider` server component, which is a wrapper around a client component that renders the `AppInsightsContext` component from the React Plugin. You can `import { AppInsightsProvider } from '@/components/instrumentation/AppInsightsProvider'` and place it somewhere fairly high up in the component tree, for example this template renders the component inside its [Root Layout](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required).

Client-side logging can be performed by using the `useAppInsightsContext` hook from within client components as described in the [documentation for the React Plugin](https://learn.microsoft.com/en-gb/azure/azure-monitor/app/javascript-framework-extensions?tabs=react#use-application-insights-with-react-context).

> Client-side instrumentation and logging to Application Insights requires a connection string to an Application Insights resource to be provided via the environment variable `APPLICATIONINSIGHTS_CONNECTION_STRING`. This environment variable is provided to the app automatically by `azd provision`.
>
> If the connection string is not available, for example when running in your development environment outside of `azd provision`, the `AppInsightsProvider` will not render and `useAppInsightsContext` will return `undefined`.

🙏 Thank you to [Jonathan Rupp](https://github.com/jorupp) who very kindly shared his implementation for client-side instrumentation in this [GitHub discussion](https://github.com/vercel/next.js/discussions/55405#discussioncomment-7118671), which was mostly reused for the implementation in this template.

## Azure CDN

An [Azure CDN endpoint](https://learn.microsoft.com/en-us/azure/cdn/cdn-create-endpoint-how-to) is deployed and configured to work in "origin pull" mode, which means the first request made for a resource to the CDN will proxy through to the Container App (the origin) and the response will be cached on the CDN for subsequent requests.

For this to work the static assets from the Next.js build output and [`public` folder](https://nextjs.org/docs/getting-started/installation#the-public-folder-optional) are included in the Docker image that is created during the `azd deploy` step and deployed to your Container App.

To configure the CDN to be used for requests to Next.js's static assets the [`assetPrefix`](https://nextjs.org/docs/app/api-reference/next-config-js/assetPrefix) configuration option is set in `next.config.js`.

To use the CDN for requests to other resources (such as those in the `public` folder) you can `import { getCdnUrl } from '@/lib/url'` and use the `getCdnUrl` function to generate a URL that will proxy the request through the CDN.

The template also includes a function that allows you to generate an absolute URL from a relative path if you require it (i.e. direct to the origin without proxying through the CDN). To use the function you can `import { getAbsoluteUrl } from '@/lib/url'`.

> For an example of how `getCdnUrl` can be used see `page.tsx`. An example of `getAbsoluteUrl` can be seen in `robots.ts`.

As well as `assetPrefix` there are some other related configuration options set in `next.config.js`:

* The [`compress`](https://nextjs.org/docs/app/api-reference/next-config-js/compress) option is set to `true` by default because although the CDN will provide compression for static assets pulled from the origin the CDN doesn't cover dynamic assets
* The [`remotePatterns`](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns) option is set to allow CDN URLs to be used by the Next.js's `<Image>` component
* A far-future `Cache-Control` header is set via the [`headers`](https://nextjs.org/docs/app/api-reference/next-config-js/headers) option for requests that include the `buildId` in the URL (the `getCdnUrl` function adds this by default as a cache-busting strategy)

💡 The template also adds a [`preconnect`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preconnect) for the CDN in `layout.tsx`.

> The features described above require the presence of the environment variables `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_CDN_HOSTNAME`, `NEXT_COMPRESS`, `NEXT_PUBLIC_BUILD_ID` and `NEXT_PUBLIC_BASE_URL`. These are all provided to the app automatically with the exception of `NEXT_COMPRESS`, which is provided by `.env.production`.
>
> If these environment variables are not provided, for example when running in your development environment outside of `azd provision`, the `assetPrefix`, `remotePatterns` and `headers` will not be set, the `getCdnUrl` and `getAbsoluteUrl` functions will return the relative path that was provided as input to the function, and the `preconnect` will not be added.

## Checking the current environment at runtime

The template includes functions for checking the environment that the application is currently running in. You can `import { environment, currentEnvironment } from '@/lib/environment'` and then add conditional logic where required, for example:

```javascript
if (currentEnvironment === environment.production) {
  // Do production stuff
} else {
  // Do non-production stuff
}
```

💡 If you want to change the environment names or add support for additional environments you can edit the environments in `src/lib/environment.ts`.

> `currentEnvironment` is set using an environment variable `NEXT_PUBLIC_APP_ENV`. This is provided automatically by `azd provision` or by `.env.development` when running the development server.
>
> If the environment variable is not set for some reason the default value for `currentEnvironment` is `environment.development`.

## Environment variables

When developing your app you should use environment variables as per the [Next documentation](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables):

* Use `.env` for default vars for all builds and environments
* Use `.env.development` for default development build (i.e. `next dev`) vars
* Use `.env.production` for default production build (i.e. `next build`) vars
* Use `.env.local` for secrets, environment-specific values, or overrides of development or production build defaults set in any of the other files above

> `.env.local` should never be committed to your repo, but this repo includes a `.env.local.template` file that should be maintained as an example of what environment variables your app can support or is expecting in `.env.local`.
>
> The `.env.local.template` file is also [used in CI/CD pipelines](#how-the-envlocal-file-is-generated-when-running-in-a-pipeline) to generate a `env.local` file for the target environment. It is therefore important to keep this file updated as and when you add additional environment variables to your app.

### How `azd` uses environment variables in this template

When running `azd provision`:

1. A `preprovision` hook runs the `.azd/hooks/preprovision.ps1` script
   * The `.azd/scripts/create-infra-env-vars.ps1` script runs
   * The entries from the `.env`, `.env.production` and `.env.local` files (if they exist) are read and merged together (matching entries from the later files override entries from earlier files)
   * The merged entries are written to a `infra/env-vars.json` file as key value pairs (values are always of type `string`)
2. `azd` runs the `main.bicep` file
   * The `infra/env-vars.json` file created by the `preprovision` hook is loaded into a variable named `envVars` to be used during provisioning of the infrastructure
   * The environment variables exposed via `envVars` can be used to set properties of the infratructure resources defined in the `main.bicep` script such as min/max scale replicas, custom domain name, and to pass environment variables through to the Container App that are required at runtime
3. `azd` writes any `output`(s) from the `main.bicep` file to `.azure/{AZURE_ENV_NAME}/.env`
   * This is standard behaviour of `azd provision` and not specific to this template
4. A `postprovision` hook runs the `.azd/hooks/postprovision.ps1` script
   * The contents of the `.azure/{AZURE_ENV_NAME}/.env` file are merged with the `.env.local` file (if one exists) and the results are written to a `.env.azure` file
   * The `.env.azure` file will be used by `azd deploy`

> The `main.bicep` script will error if it is expecting a key to be present in your `infra/env-vars.json` file, but it is missing. This is why you must keep your [environment variables](#environment-variables) updated.
>
> The `infra/env-vars.json` and `.env.azure` files should not be committed to your repo as they may contain secret or sensitive values from your `.env.local` file.

When running `azd deploy`:

1. The `Dockerfile` copies all `.env*` files from the local disk
2. It then copies `.env.azure` and renames and overwrites the `.env.local` file with it
3. `next build` then runs, which loads in env files as normal including the `.env.local` file

### How the `.env.local` file is generated when running in a pipeline

The `.env.local` file is required to provision, build and deploy the app, but it should never be committed to your repository and so is not available to the CI/CD pipeline when it clones your repo.

To overcome this problem the pipelines provided in this template are capable of generating an `env.local` file by reading environment variables from the pipeline build agent context and merging them with the `.env.local.template` file.

Exactly how the environment variables are surfaced to the build agent is slightly different depending on whether you are using an [Azure DevOps (AZDO)](#azure-devops-pipelines) or [GitHub Actions](#github-actions) pipeline due to the specific capabilities of each, but the approach used to generate the `.env.local` file is broadly the same:

1. The pipeline determines the target environment for the deployment based on the branch ref that triggered the pipeline to run
   * This can be extended to support multiple target environments
2. Environment variables specific to the target environment are loaded into the build agent context
   * These environment variables are named with the same keys used in the `.env.local.template` file
3. The pipeline runs `npm run env:init`, which merges the contents of the `.env.local.template` file with the environment variables in the build agent context and outputs the result to `.env.local`

⚡ `azd provision` and `azd deploy` then run as they would [locally](#how-azd-uses-environment-variables-in-this-template), using the `env.local` file created during the current pipeline run.

## Pipelines

This template includes support for running a CI/CD pipeline in GitHub Actions or Azure DevOps Pipelines. The specifics of the pipelines does differ due to the different capabilities and behaviour of each platform, but an effort has been made to keep the two pipelines broadly in line with each other so that the steps are comparable:

1. Determine the name of the target environment based on the branch ref that triggered the pipeline to run e.g. `refs/heads/main` -> `production`
2. Load environment variables specific to the target environment in the pipeline's build context
3. Execute `npm run env:init` to [generate a `.env.local` file](#how-the-envlocal-file-is-generated-when-running-in-a-pipeline) from the environment variables loaded into the build context
4. Run `azd provision`
5. Run `azd deploy`

Below are some instructions for how to setup and configure the pipelines included with this template for:

* [GitHub Actions](#github-actions)
* [Azure DevOps Pipelines](#azure-devops-pipelines)

> `azd` includes an `azd pipeline config` command that can be used to help initialise a pipeline on either platform. This is not recommended by this template because a) it requires creating target environments locally and having access to their environment variables, which doesn't "feel right" (i.e. having access to production secrets in a development environment doesn't "feel right"); and b) it creates "global" environment variables in GitHub, but this template recommends that you scope environment variables to specific target environments.
>
> Hopefully in future `azd` will offer hooks into the `azd pipeline` commands that allow for the below steps to be automated, but for now they are manual steps.

💡 The instructions below are written as if you are adding a `production` environment as that is assumed to be required and is catered for "out of the box" with the template, but you can add support for other environments also. For example you could map pipeline runs triggered by a push to a `canary` branch on your repo to a `uat` target environment.

### GitHub Actions

You don't need to do anything specific to add the workflow in GitHub Actions, the presence of the `.github/workflows/azure-dev.yml` file is enough, but you will need to:

1. [Create an Environment](#create-an-environment)
2. [Setup permissions in Azure](#setup-permissions-in-azure) to allow GitHub Actions to create resources in your Azure subscription
3. [Add Environment variables](#add-environment-variables)

#### Create an Environment

1. Sign in to [GitHub](https://github.com/)
2. Find the repo where you have pushed your code, or your fork if you forked this repo
3. Go to `Settings` -> `Environments`
   * Click `New environment`, name it `production`, and click `Configure environment`
   * Add protection rules if you wish, though it's not required

> You can read more about creating environments in the [GitHub documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#creating-an-environment). Note that there are limitations with Environments in GitHub if you are using a Free acount and your repository is private.

#### Setup permissions in Azure

1. Create a Service principal in Azure
   * Sign into the [Azure Portal](https://portal.azure.com)
   * Make sure you are signed into the tenant you want the pipeline to deploy to
   * Go to `Microsoft Entra ID` -> `App registrations`
   * Click `New registration`
   * Enter a `name` for your Service principal, and click `Register`
   * Copy the newly created Service principal's `Application ID` and `Directory (tenant) ID` - we will need those later
   * Go to `Certificates & secrets`
   * Select `Federated credentials` and click `Add credential`
   * Select the `GitHub Actions deploying Azure resources` scenario, and fill in the required information
     * `Organization`: your GitHub username
     * `Repository`: your GitHub repository name
     * `Entity type`: `Environment`
     * `GitHub environment name`: the environment name (`production`)
     * `Name`: a name for the scenario
       * e.g. `{Organization}-{Repository}-{GitHub environment name}`
   * Click `Add`
2. Give the Service principal the permissions required to deploy to your Azure Subscription
   * Go to `Subscriptions`
   * Select an existing or create a new Subscription where you will be deploying to
   * Copy the `Subscription ID` - we will need this later
   * Go to `Access control (IAM)` -> `Role assignments`
   * Assign the `Contributor` role
     * Click `Add` -> `Add role assignment`
     * Select `Privileged administrator roles` -> `Contributor`
     * Click `Next`
     * Click `Select members` and select your Service principal
     * Click `Review + assign` and complete the Role assignment
   * Assign the `Role Based Access Control Administrator` role
     * Click `Add` -> `Add role assignment`
     * Select `Privileged administrator roles` -> `Role Based Access Control Administrator`
     * Click `Next`
     * Click `Select members` and select your Service principal
     * Click `Next`
     * Select `Constrain roles` and only allow assignment of the `AcrPull` role
     * Click `Review + assign` and complete the Role assignment

#### Add Environment variables

1. Find and edit the Environment that you created in GitHub repo earlier
2. Add Environment variables
   * `PINECONE_API_KEY={your Pinecone API key}`
     * As stated earlier, you can retrieve this from your [Pinecone project's list of API keys](https://app.pinecone.io/-/projects/-/keys).
   * `OPENAI_API_KEY={your OpenAI API key}`
     * This can be retrieved from your [OpenAI project](https://platform.openai.com/api-keys).
   * `PINECONE_REGION={your Pinecone region}`
     * The region your index is hosted in, or will be created in.
   * `PINECONE_INDEX={your index name}`
     * Defaults to `pinecone-rag-demo-azd`.
   * `AZURE_ENV_NAME=prod`
     * This doesn't need to match the GitHub Environment name and because it is used when generating Azure resource names it's a good idea to keep it short
   * `AZURE_TENANT_ID={tenant_id}`
     * Replace `{tenant_id}` with your Tenant's `Tenant ID`
   * `AZURE_SUBSCRIPTION_ID={subscription_id}`
     * Replace `{subscription_id}` with your Subscription's `Subscription ID`
   * `AZURE_CLIENT_ID={service_principal_id}`
     * Replace `{service_principal_id}` with your Service principal's `Application ID`
   * `AZURE_LOCATION={location_name}`
     * Replace `{location_name}` with your desired region name
     * You can see a list of region names using the Azure CLI: `az account list-locations -o table`
   * `SERVICE_WEB_CONTAINER_MIN_REPLICAS=1`
     * Assuming that you don't want your production app to scale to zero
3. If you want to add additional variables (e.g. those found in the `.env.local.template` file) then you can continue to do so e.g. `SERVICE_WEB_CONTAINER_MAX_REPLICAS=5`
   * If you don't add them then they will fallback to any default value set in the app or in the `main.bicep` file

### Azure DevOps Pipelines

You need to manually create a pipeline in Azure DevOps - the presence of the `.azdo/pipelines/azure-dev.yml` file is not enough by itself - you will need to:

1. [Create the Pipeline](#create-the-pipeline)
2. [Setup permissions](#setup-permissions) to allow the Pipeline to create resources in your Azure subscription
3. [Create an Environment](#create-an-environment-1)
4. [Create a Variable group for your Environment](#create-a-variable-group-for-your-environment)

#### Create the Pipeline

1. Sign into [Azure DevOps](https://dev.azure.com)
2. Select an existing or create a new Project where you will create the pipeline
3. Go to `Pipelines` -> `Pipelines`
4. Click `New pipeline`
   * Connect to your repository
   * When prompted to `Configure your pipeline`, select `Existing Azure Pipelines YAML file` and select the `.azdo/pipelines/azure-dev.yml` file
   * `Save` (don't `Run`) the pipeline

#### Setup permissions

1. Create a Service connection for you Pipeline
   * Still in your Azure DevOps Project, go to `Project settings` -> `Service connections`
   * Click `New service connection`
     * Select `Azure Resource Manager`
     * Select `Service pincipal (automatic)`
     * Choose the `Subscription` that you wish to deploy your resources to
     * Don't select a `Resource group`
     * Name the Service connection `azconnection`
       * This is the default name used by `azd` - feel free to change it, but if you do you will need to update your `azure-dev.yml` file also
     * Add a `Description` if you want
     * Check `Grant access permissions to all pipelines`
       * You can setup more fine grained permissions if you don't wish to do this
     * Click `Save`
2. Give the Service connection the permissions required to deploy to your Azure Subscription
   * After your Service connection has been created, click on it to edit it
   * Click on `Manage Service Principal`, which will take you to the Service Principal in the Azure Portal
   * Copy the `Display name`
     * If you don't like the generated name you can go to `Branding & properties` and change the `Name`
   * Copy the Service principal's `Directory (tenant) ID` - we will need that later
   * Go back to your Service connection in Azure DevOps
   * Click on `Manage service connection roles`, which will take you to the Subscription in the Azure Portal
   * Go to `Role assignments`
   * Assign the `Role Based Access Control Administrator` role
     * Click `Add` -> `Add role assignment`
     * Select `Privileged administrator roles` -> `Role Based Access Control Administrator`
     * Click `Next`
     * Click `Select members` and select your Service principal
     * Click `Next`
     * Select `Constrain roles` and only allow assignment of the `AcrPull` role
     * Click `Review + assign` and complete the Role assignment
   * Go to the `Overview` tab of your Subscription
   * Copy the `Subscription ID` - we will need this later
   * Go back to your Service connection in Azure DevOps

#### Create an Environment

1. Still in your Azure DevOps Project, go to `Pipelines` -> `Environments`
2. Create a `production` environment
   * Add a `Description` if you want
   * For `Resource` select `None`
   * You can setup Approvals & checks if you wish

#### Create a Variable group for your Environment

1. Still in your Azure DevOps Project, go to `Pipelines` -> `Library`
2. Add a `Variable group` called `production`
3. Add the following variables:
   * `AZURE_ENV_NAME=prod`
     * This doesn't need to match the Environment name and because it is used when generating Azure resource names it's a good idea to keep it short
   * `AZURE_TENANT_ID={tenant_id}`
     * Replace `{tenant_id}` with your Tenant's `Tenant ID`
   * `AZURE_SUBSCRIPTION_ID={subscription_id}`
     * Replace `{subscription_id}` with your Subscription's `Subscription ID`
   * `AZURE_LOCATION={location_name}`
     * Replace `{location_name}` with your desired region name
     * You can see a list of region names using the Azure CLI: `az account list-locations -o table`
   * `SERVICE_WEB_CONTAINER_MIN_REPLICAS=1`
     * Assuming that you don't want your production app to scale to zero
4. If you want to add additional variables (e.g. those found in the `.env.local.template` file) then you can continue to do so e.g. `SERVICE_WEB_CONTAINER_MAX_REPLICAS=5`
   * If you don't add them then they will fallback to any default value set in the app or in the `main.bicep` file

💡 If you add additional environment variables for use in your app and want to override them in this environment then you can come back here later to add or change anything as needed.

> The first time you run the pipeline it will ask you to permit access to the `production` Environment and Variable group that you just created, which you should allow for the pipeline to run succesfully.

## Adding a custom domain name

Azure supports adding custom domain names with free managed SSL certificates to Container Apps. The Bicep scripts included in this template are setup to provide this capability, but before we can add a custom domain name and managed certificate Azure requires that DNS records be created to verify domain ownership.

### Verify domain ownership

The verification process is described in steps 7 and 8 of the [Container Apps documentation](https://learn.microsoft.com/en-us/azure/container-apps/custom-domains-managed-certificates?pivots=azure-portal#add-a-custom-domain-and-managed-certificate), so please refer to that for specifics, but in summary you must add the following records via your DNS provider:

* A `TXT` record containing a domain verification code; and
* An `A` record containing the static IP address of the Container Apps Environment; or
* A `CNAME` record containing the FQDN of the Container App

To get the information that you require for these DNS records you can:

* When running `azd` locally
  * Run `azd provision` (if you have not already)
  * Run `npm run env:dv`
* When running `azd` in a pipeline
  * Run the pipeline (if you have not already)
  * Check the output of the `Domain Verification` task

Included in the output are the `Static IP`, `FQDN` and `Verification code` - use these values to set your DNS records as per the Container Apps documentation (linked above).

### Set your custom domain name

To set your custom domain name on your Container App you will need to add (or update) an environment variable named `SERVICE_WEB_CUSTOM_DOMAIN_NAME`:

> For example, to set the domain name for the container app to `www.example.com` you would add an environment variable `SERVICE_WEB_CUSTOM_DOMAIN_NAME=www.example.com`.

* In your local dev environment: to your `.env.local` file
* In GitHub Actions: as an [Environment variable](#add-environment-variables) in the target Environment (e.g. `production`)
* In Azure DevOps: as a [Variable in the Variable group](#create-a-variable-group-for-your-environment) for the target Environment (e.g. `production`)

You will then need to:

* When running `azd` locally
  * Run `azd provision`
* When running `azd` in a pipeline
  * Run the pipeline

💡 When you add a custom domain name a redirect rule is automatically added so that if you attempt to navigate to the default domain of the Container App there will be a permanent redirect to the custom domain name - this redirect is configured in `next.config.js`. The [`getAbsoluteUrl`](#azure-cdn) function provided by this template will also use the custom domain name you have set rather than the default domain of the Container App.

### Add a free managed certificate for your custom domain

The final step is to create a free managed SSL certificate for your custom domain name and add it to your Container App:

1. Create the certificate
   * Sign in to the [Azure Portal](https://portal.azure.com)
   * Go to your Container Apps Environment resource
   * Go to `Certificates` -> `Managed certificate`
   * Click `Add certificate`
     * Select your `Custom domain` name
     * Choose the appropriate `Hostname record type`
     * `Validate` the custom domain name
     * `Add` the certificate
   * Azure will now provision the certificate
2. Get the `Certificate ID`
   * Wait for the `Certificate Status` to become `Suceeded`
   * The `Certificate ID` is not exposed in a convenient place in the Azure Portal, but you can work it out from the information provided:
     * Copy the `Certificate Name`
     * Go to `Overview` -> `JSON View`
     * Copy the `Resource ID`
     * Create the `Certificate ID` using the pattern:
       * `{Resource ID}/managedCertificates/{Certificate Name}`

You will then need to add (or update) an environment variable named `SERVICE_WEB_CUSTOM_DOMAIN_CERT_ID` and with the value of your `Certificate ID`:

* In your local dev environment: to your `.env.local` file
* In GitHub Actions: as an [Environment variable](#add-environment-variables) in the target Environment (e.g. `production`)
* In Azure DevOps: as a [Variable in the Variable group](#create-a-variable-group-for-your-environment) for the target Environment (e.g. `production`)

And finally you will need to:

* When running `azd` locally
  * Run `azd provision`
  * Run `azd deploy`
* When running `azd` in a pipeline
  * Run the pipeline

⚡ The custom domain and SSL certificate will now be bound to your Container App.

> It is possible to automate the creation of managed certificates through Bicep, which would be preferable to the above manual process, but there are a few ["chicken and egg" issues](https://johnnyreilly.com/azure-container-apps-bicep-managed-certificates-custom-domains) that make automation difficult at the moment. In the context of this template it was decided that a manual solution is the most pragmatic solution.
>
> The situation with managed certificates is discussed on this [GitHub issue](https://github.com/microsoft/azure-container-apps/issues/607) so hopefully there will be better support for automation in the future - one to keep an eye on!
>
> If a manual approach is not scaleable for your needs then have a read through the links provided above for some ideas of how others have approached an automated solution.

## Application architecture

This template uses the following Azure resources:

* [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/overview) to host the Next.js app
* [Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview?tabs=net) for monitoring and logging
* [Azure CDN](https://learn.microsoft.com/en-us/azure/cdn/cdn-overview) for efficient serving of static application assets

Here's a high level architecture diagram that illustrates these components. Notice that these are all contained within a single [resource group](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal) that will be created for you when you create the resources.

!["Application architecture diagram"](docs/assets/nextjs-aca-architecture.png)

### Cost of provisioning and deploying this template

This template provisions resources to an Azure subscription that you will select upon provisioning them. Refer to the [Pricing calculator for Microsoft Azure](https://azure.microsoft.com/pricing/calculator/) to estimate the cost you might incur when this template is running on Azure and, if needed, update the included Azure resource definitions found in `infra/main.bicep` to suit your needs.

### Security

#### Managed Identity

This template creates a [Managed Identity](https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview) for your app inside your Azure Active Directory tenant. It is used to permit the Container App to pull images from the Container Registry.

To view your managed identity in the Azure Portal follow these [steps](https://learn.microsoft.com/en-gb/azure/active-directory/managed-identities-azure-resources/how-to-view-managed-identity-service-principal-portal).
