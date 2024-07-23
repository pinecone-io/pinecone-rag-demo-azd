import { OpenAIClient, AzureKeyCredential } from '@azure/openai'

const endpoint = process.env.AZURE_OPENAI_ENDPOINT || ''
const apiKey = process.env.AZURE_OPENAI_API_KEY || ''

export async function getEmbeddings(input: string) {
  console.log('Getting embeddings for input:', input)
  console.log('Endpoint:', endpoint)
  console.log('API Key:', apiKey)

  // Ensure this code runs only in the browser
  /*if (typeof navigator === 'undefined') {
    global.navigator = {
      userAgent: 'Node.js',
      userAgentData: {
        platform: 'Node.js',
        brands: [{ brand: 'Node.js', version: '14' }],
        mobile: false
      }
    } as any
  }*/

  let client: OpenAIClient
  try {
    client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey))
  } catch (e) {
    console.log('Error creating Azure OpenAI client:', e)
    throw e
  }

  try {
    const response = await client.getEmbeddings('text-embedding-ada-002', [
      input.replace(/\n/g, ' ')
    ])
    return response.data[0].embedding as number[]
  } catch (e) {
    console.log('Error calling Azure OpenAI embedding API: ', e)
    throw e
  }
}
