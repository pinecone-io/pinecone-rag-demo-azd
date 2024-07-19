import { OpenAIClient, AzureKeyCredential } from '@azure/openai'

const endpoint = process.env.AZURE_OPENAI_ENDPOINT || ''
const apiKey = process.env.AZURE_OPENAI_API_KEY || ''
const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey))

export async function getEmbeddings(input: string) {
  try {
    const response = await client.getEmbeddings('text-embedding-ada-002', [
      input.replace(/\n/g, ' ')
    ])
    return response.data[0].embedding as number[]
  } catch (e) {
    console.log('Error calling Azure OpenAI embedding API: ', e)
    throw new Error(`Error calling Azure OpenAI embedding API: ${e}`)
  }
}
