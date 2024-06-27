import { CreateIndexOptions, Pinecone } from "@pinecone-database/pinecone";
import {
  CreateIndexRequestMetricEnum,
  CreateIndexRequestSpec,
} from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";

export type IndexProperties = {
  name: string;
  dimension: number;
  metric: CreateIndexRequestMetricEnum;
  cloud: 'aws' | 'gcp' | 'azure'
  spec: CreateIndexRequestSpec;
};

function connectPinecone(apiKey?: string): Pinecone {
  const pineconeApiKey = apiKey ?? process.env.PINECONE_API_KEY;

  if (!pineconeApiKey) {
    throw new Error('Pinecone API key is required but not provided.');
  }

  const pc = new Pinecone({
    apiKey: pineconeApiKey,
    sourceTag: 'pinecone_azd_rag_demo'
  });

  return pc
}

const indexName = process.env.PINECONE_API_KEY ?? 'pinecone-azd-rag-demo';
export { connectPinecone, indexName }
