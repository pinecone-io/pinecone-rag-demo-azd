import { useEffect, useState, useCallback } from 'react'
import { Pinecone } from '@pinecone-database/pinecone'
import { connectPinecone, getOrCreateIndex, INDEX_NAME } from '@/lib/pinecone'

const useInitializeIndex = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const initializeIndex = useCallback(async () => {
    try {
      const pinecone = connectPinecone()
      console.log('Connected to Pinecone')
      await getOrCreateIndex(pinecone, INDEX_NAME)
      console.log('Connected to index', INDEX_NAME)
      setIsInitialized(true)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'An unexpected error occurred')
    }
  }, [])

  useEffect(() => {
    initializeIndex()
  }, [initializeIndex])

  return { isInitialized, initializeIndex, error }
}

export default useInitializeIndex
