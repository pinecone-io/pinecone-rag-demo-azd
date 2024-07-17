import { Pinecone } from '@pinecone-database/pinecone'
import { NextResponse } from 'next/server'
import { connectPinecone, getOrCreateIndex, INDEX_NAME } from '@/lib/pinecone'

export async function POST() {
  // Instantiate a new Pinecone client
  const pinecone = await connectPinecone()
  // Select the desired index
  try {
    await getOrCreateIndex(pinecone, INDEX_NAME)
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      success: false,
      error: (error as Error).cause || 'An unexpected error occurred'
    })
  }
  const index = await pinecone.Index(INDEX_NAME)

  // Use the custom namespace, if provided, otherwise use the default
  const namespaceName = process.env.PINECONE_NAMESPACE ?? ''
  const namespace = index.namespace(namespaceName)

  // Delete everything within the namespace
  const stats = await namespace.describeIndexStats()

  return NextResponse.json({
    ...stats
  })
}
