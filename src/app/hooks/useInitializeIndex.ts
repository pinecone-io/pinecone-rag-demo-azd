import { useEffect, useState, useCallback } from 'react'
import { connectPinecone, getOrCreateIndex, INDEX_NAME } from '@/lib/pinecone'

const useInitializeIndex = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const initializeIndex = useCallback(async () => {
    try {
      const pinecone = connectPinecone()
      console.log('Connected to Pinecone, initializing index ', INDEX_NAME)
      await getOrCreateIndex(pinecone, INDEX_NAME)
      console.log('Connected to index ', INDEX_NAME)
      setIsInitialized(true)
    } catch (e: any) {
      console.error('Error initializing index', e)
      setError(e.message || 'An unexpected error occurred')
    }
  }, [])

  useEffect(() => {
    initializeIndex()
  }, [initializeIndex])

  return { isInitialized, initializeIndex, error }
}

export default useInitializeIndex
