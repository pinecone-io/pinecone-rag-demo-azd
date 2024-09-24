@description('The name of the Key Vault')
param keyVaultName string

@description('The name of the Pinecone index')
param pineconeIndexName string

@description('The region for the Pinecone index')
param pineconeRegion string

@description('The cloud provider for the Pinecone index')
param pineconeCloud string = 'azure'

resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' existing = {
  name: keyVaultName
}

resource pineconeIndexDeployment 'Microsoft.Resources/deploymentScripts@2020-10-01' = {
  name: 'pineconeIndexDeployment'
  location: resourceGroup().location
  kind: 'AzurePowerShell'
  properties: {
    azPowerShellVersion: '7.0'
    timeout: 'PT30M'
    arguments: '-KeyVaultName "${keyVaultName}" -PineconeIndexName "${pineconeIndexName}" -PineconeRegion "${pineconeRegion}" -PineconeCloud "${pineconeCloud}"'
    scriptContent: '''
      param(
        [string] $KeyVaultName,
        [string] $PineconeIndexName,
        [string] $PineconeRegion,
        [string] $PineconeCloud
      )

      $PineconeApiKey = (Get-AzKeyVaultSecret -VaultName $KeyVaultName -Name "PINECONE_API_KEY").SecretValueText

      $headers = @{
        "Api-Key" = $PineconeApiKey
        "Content-Type" = "application/json"
        "Accept" = "application/json"
        "X-Pinecone-Api-Version" = "2024-07"
      }

      # Rest of the script remains the same
      # ...
    '''
    retentionInterval: 'P1D'
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${resourceId('Microsoft.ManagedIdentity/userAssignedIdentities', 'webAppServiceIdentity')}': {}
    }
  }
}

output indexCreated bool = pineconeIndexDeployment.properties.outputs.created
