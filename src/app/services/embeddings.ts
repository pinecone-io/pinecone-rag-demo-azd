import { DefaultAzureCredential } from '@azure/identity'
import { SecretClient } from '@azure/keyvault-secrets'
import { Configuration, OpenAIApi } from 'openai-edge'

let openai: OpenAIApi

async function initializeOpenAI() {
  const credential = new DefaultAzureCredential()
  const keyVaultName = process.env.AZURE_KEY_VAULT_NAME
  const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`
  const secretClient = new SecretClient(keyVaultUrl, credential)

  const openAIApiKey = await secretClient.getSecret('AZURE-OPENAI-API-KEY')

  const config = new Configuration({
    apiKey: openAIApiKey.value,
    basePath: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}`,
    defaultQueryParams: new URLSearchParams({
      'api-version': process.env.AZURE_OPENAI_API_VERSION as string
    })
  })

  openai = new OpenAIApi(config)
}

export async function getEmbeddings(input: string) {
  if (!openai) {
    await initializeOpenAI()
  }

  try {
    const response = await openai.createEmbedding({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT as string,
      input: input.replace(/\n/g, ' ')
    })

    const result = await response.json()
    return result.data[0].embedding as number[]
  } catch (error) {
    console.error('Error generating embeddings: ', error)
    return null
  }
}
