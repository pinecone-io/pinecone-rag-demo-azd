import { NextResponse } from "next/server";
import { Pinecone } from '@pinecone-database/pinecone'
import { connectPinecone, checkAndCreateIndex } from '@/lib/pinecone'

export async function POST() {
  // Instantiate a new Pinecone client
  const pinecone = await connectPinecone();
  // Select the desired index
  const index = pinecone.Index(process.env.PINECONE_INDEX!)

  // Use the custom namespace, if provided, otherwise use the default
  const namespaceName = process.env.PINECONE_NAMESPACE ?? ''
  const namespace = index.namespace(namespaceName)

  // Delete everything within the namespace
  await namespace.deleteAll();

  return NextResponse.json({
    success: true
  })
}
