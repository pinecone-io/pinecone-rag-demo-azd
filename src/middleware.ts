import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const requiredEnvVars = [
    'PINECONE_API_KEY',
    'PINECONE_REGION',
    'PINECONE_INDEX',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_GPT_DEPLOYMENT',
    'AZURE_OPENAI_EMBEDDING_DEPLOYMENT',
    'AZURE_OPENAI_API_VERSION'
  ]
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar] && !process.env.CI) {
      throw new Error(`${envVar} environment variable is not defined`)
    }
  })
  return NextResponse.next()
}
