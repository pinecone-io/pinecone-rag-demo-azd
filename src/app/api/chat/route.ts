import { Metadata, getContext } from '@/services/context'
import type { PineconeRecord } from '@pinecone-database/pinecone'
import {
  Message,
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData
} from 'ai'
import { OpenAIClient, AzureKeyCredential } from '@azure/openai'

const endpoint = process.env['ENDPOINT'] || 'text-embedding-ada-002'
const azureApiKey = process.env['AZURE_API_KEY'] || '<api key>'
console.log('endpoint', endpoint)
console.log('azureApiKey', azureApiKey)

// Create an OpenAI API client (that's edge friendly!)
const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey))

export async function POST(req: Request) {
  try {
    const { messages, withContext, messageId } = await req.json()
    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // Get the context from the last message
    const context = withContext
      ? await getContext(lastMessage.content, '', 3000, 0.8, false)
      : ''

    console.log('withContext', context.length)

    const docs =
      withContext && context.length > 0
        ? (context as PineconeRecord[]).map(
            (match) => (match.metadata as Metadata).chunk
          )
        : []

    // Join all the chunks of text together, truncate to the maximum number of tokens, and return the result
    const contextText = docs.join('\n').substring(0, 3000)

    const prompt = [
      {
        role: 'system',
        content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Azure.
      START CONTEXT BLOCK
      ${contextText}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `
      }
    ]

    const sanitizedMessages = messages.map((message: any) => {
      const { createdAt, id, ...rest } = message
      return rest
    })

    // Ask OpenAI for a streaming chat completion given the prompt
    const deploymentId = 'text-embedding-ada-002'
    console.log('client', client)
    const events = await client.streamChatCompletions(
      deploymentId,
      [
        ...prompt,
        ...sanitizedMessages.filter((message: Message) => message.role === 'user')
      ],
      { maxTokens: 128 }
    )
    const data = new experimental_StreamData()

    /*const stream = OpenAIStream(response, {
      onFinal(completion) {
        // IMPORTANT! you must close StreamData manually or the response will never finish.
        data.close()
      },
      // IMPORTANT! until this is stable, you must explicitly opt in to supporting streamData.
      experimental_streamData: true
    })
*/
    if (withContext) {
      data.append({
        context: [...(context as PineconeRecord[])]
      })
    }

    // IMPORTANT! If you aren't using StreamingTextResponse, you MUST have the `X-Experimental-Stream-Data: 'true'` header
    // in your response so the client uses the correct parsing logic.
    return new StreamingTextResponse(events, {}, data)
  } catch (e) {
    throw e
  }
}
