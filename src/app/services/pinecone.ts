import { Pinecone, type ScoredPineconeRecord } from "@pinecone-database/pinecone";
import { connectPinecone, getOrCreateIndex, INDEX_NAME } from "@/lib/pinecone";

export type Metadata = {
  url: string,
  text: string,
  chunk: string,
  hash: string
}

// The function `getMatchesFromEmbeddings` is used to retrieve matches for the given embeddings
const getMatchesFromEmbeddings = async (embeddings: number[], topK: number, namespace: string): Promise<ScoredPineconeRecord<Metadata>[]> => {
  // Obtain a client for Pinecone
  const pinecone = await connectPinecone();

  // Get the Pinecone index
  const index = await getOrCreateIndex(pinecone, INDEX_NAME);

  // Get the namespace
  const pineconeNamespace = index.namespace(namespace ?? '')
  // console.log("embeddings", JSON.stringify(embeddings))

  try {
    // Query the index with the defined request
    const queryResult = await pineconeNamespace.query({
      vector: embeddings,
      topK,
      includeMetadata: true,
    })
    return queryResult.matches || []
  } catch (e) {
    // Log the error and throw it
    console.log("Error querying embeddings: ", e)
    throw new Error(`Error querying embeddings: ${e}`)
  }
}

export { getMatchesFromEmbeddings };

