import { Metadata, getContext } from '@/services/context'
import type { PineconeRecord } from '@pinecone-database/pinecone'
import { Message } from 'ai'
import { OpenAIClient, AzureKeyCredential } from '@azure/openai'

const endpoint = process.env['AZURE_OPENAI_ENDPOINT'] || ''
const azureApiKey = process.env['AZURE_OPENAI_API_KEY'] || ''
const deploymentId = process.env['AZURE_OPENAI_DEPLOYMENT_ID'] || 'gpt-4o'

// Create an Azure OpenAI API client
const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey))

export async function POST(req: Request) {
  if (!endpoint || !azureApiKey) {
    throw new Error('Azure OpenAI endpoint and API key must be set')
  }

  try {
    const { messages, withContext, messageId } = await req.json()
    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // Get the context from the last message
    const context = withContext
      ? await getContext(lastMessage.content, '', 3000, 0.8, false)
      : ''

    //console.log('withContext', context.length)

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

    // Ask Azure OpenAI for a streaming chat completion given the prompt
    const events = await client.streamChatCompletions(
      deploymentId,
      [
        ...prompt,
        ...sanitizedMessages.filter(
          (message: Message) => message.role === 'user'
        )
      ],
      { maxTokens: 128 }
    )

    let responseContent: string = ''
    for await (const event of events) {
      for (const choice of event.choices) {
        responseContent += choice.delta?.content || ''
      }
    }

    const response = new Response(responseContent, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response
  } catch (e) {
    throw e
  }
}
