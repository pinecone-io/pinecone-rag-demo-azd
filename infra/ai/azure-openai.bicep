@description('The name of the Azure OpenAI resource')
param name string

@description('The location of the Azure OpenAI resource')
param location string

@description('The SKU name for Azure OpenAI')
param skuName string = 'S0'

@description('The tags to apply to the Azure OpenAI resource')
param tags object = {}

resource openAI 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: name
  location: location
  tags: tags
  kind: 'OpenAI'
  sku: {
    name: skuName
  }
  properties: {
    customSubDomainName: name
    publicNetworkAccess: 'Enabled'
  }
}

@description('The name of the deployment for the GPT model')
param gptDeploymentName string = 'gpt-4o-mini'

@description('The name of the GPT model to deploy')
param gptModelName string = 'gpt-4o-mini'

@description('The name of the deployment for the embedding model')
param embeddingDeploymentName string = 'text-embedding-3-small'

@description('The name of the embedding model to deploy')
param embeddingModelName string = 'text-embedding-3-small'

resource gptDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAI
  name: gptDeploymentName
  sku: {
    name: 'Standard'
    capacity: 1
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: gptModelName
      version: '2024-07-18'
    }
  }
}

resource embeddingDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAI
  name: embeddingDeploymentName
  dependsOn: [
    gptDeployment
  ]
  sku: {
    name: 'Standard'
    capacity: 1
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: embeddingModelName
      version: '1'
    }
  }
}

output name string = openAI.name
output id string = openAI.id
output endpoint string = openAI.properties.endpoint
//output apiKey string = openAI.listKeys().key1
output apiVersion string = openAI.apiVersion
output gptDeploymentName string = gptDeployment.name
output embeddingDeploymentName string = embeddingDeployment.name
