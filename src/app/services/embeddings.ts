import { OpenAIClient, AzureKeyCredential } from '@azure/openai'

const endpoint = process.env.AZURE_OPENAI_ENDPOINT || ''
const apiKey = process.env.AZURE_OPENAI_API_KEY || ''
const embeddingModel = process.env.AZURE_OPENAI_EMBEDDING_MODEL || ''

export async function getEmbeddings(input: string) {
  //console.log('Getting embeddings for input:', input)
  //console.log('Endpoint:', endpoint)
  //console.log('API Key:', apiKey)
  //console.log('embeddingModel:', embeddingModel)

  let client: OpenAIClient
  try {
    client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey))
  } catch (e) {
    console.log('Error creating Azure OpenAI client:', e)
    throw e
  }

  try {
    const response = await client.getEmbeddings(embeddingModel, [
      input.replace(/\n/g, ' ')
    ])
    return response.data[0].embedding as number[]
  } catch (e) {
    console.log('Error calling Azure OpenAI embedding API: ', e)
    throw e
  }
}
