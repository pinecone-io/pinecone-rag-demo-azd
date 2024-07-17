import { connectPinecone, getOrCreateIndex, INDEX_NAME } from '@/lib/pinecone'

// The function `getMatchesFromEmbeddings` is used to retrieve matches for the given embeddings
const getMatchesFromEmbeddings = async (
  embeddings: number[],
  topK: number,
  namespace: string
) => {
  // Obtain a client for Pinecone
  const pinecone = await connectPinecone()

  // Get the Pinecone index
  const index = await getOrCreateIndex(pinecone, INDEX_NAME)

  // Get the namespace
  const pineconeNamespace = index.namespace(namespace ?? '')

  try {
    // Query the index with the defined request
    const queryResult = await pineconeNamespace.query({
      vector: embeddings,
      topK,
      includeMetadata: true
    })
    return queryResult.matches || []
  } catch (e) {
    // Log the error and throw it
    console.log('Error querying embeddings: ', e)
    throw new Error(`Error querying embeddings: ${e}`)
  }
}

export { getMatchesFromEmbeddings }
