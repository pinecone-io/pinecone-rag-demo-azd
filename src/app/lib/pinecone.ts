import { Pinecone, Index } from '@pinecone-database/pinecone'
import {
  CreateIndexRequestMetricEnum,
  CreateIndexRequestSpec,
  IndexList,
  ServerlessSpecCloudEnum
} from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch'
import { prop } from 'cheerio/lib/api/attributes'
import exp from 'constants'

const PINECONE_REGION = process.env.PINECONE_REGION || 'us-west-2'
const PINECONE_CLOUD =
  (process.env.PINECONE_CLOUD as 'aws' | 'gcp' | 'azure') || 'aws'
export const INDEX_NAME = process.env.PINECONE_INDEX || 'pinecone-azd-rag-demo'

export type IndexProperties = {
  name: string
  dimension: number
  waitUntilReady: boolean
  metric: CreateIndexRequestMetricEnum
  spec: CreateIndexRequestSpec
}

export function connectPinecone(): Pinecone {
  const pineconeApiKey = process.env.PINECONE_API_KEY

  if (!pineconeApiKey) {
    throw new Error('Pinecone API key is required but not provided.')
  }

  const pc = new Pinecone({
    apiKey: pineconeApiKey,
    sourceTag: 'pinecone_azd_rag_demo'
  })
  return pc
}

export async function getOrCreateIndex(
  pc: Pinecone,
  indexName: string = process.env.PINECONE_INDEX || 'pinecone-azd-rag-demo',
  dimension: number = 1536,
  metric: CreateIndexRequestMetricEnum = 'cosine',
  spec: CreateIndexRequestSpec = {
    serverless: {
      region: PINECONE_REGION,
      cloud: PINECONE_CLOUD
    }
  }
) {
  console.log('Checking for index ', indexName)
  const indexList = await pc.listIndexes()
  const indexes = indexList.indexes
  console.log('Indexes: ', indexes)
  const indexExists =
    indexes && indexes.some((index) => index.name === indexName)
  if (!indexExists) {
    // Create Pinecone index if it does not exist
    console.log('Creating index ', indexName)
    var properties: IndexProperties = {
      name: indexName,
      dimension: dimension,
      waitUntilReady: true,
      metric: metric,
      spec: spec
    }
    try {
      await pc.createIndex(properties)
    } catch (error) {
      console.error('Error creating index: ', error)
      console.log('Properties: ', properties)
      throw error
    }
  }
  const index = await pc.Index(indexName)
  return index
}

export async function getIndex(pc: Pinecone, indexName: string) {
  const index = await getOrCreateIndex(pc, indexName)
  return index
}
