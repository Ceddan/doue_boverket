import { useState, useCallback, useRef } from 'react'
import { useFetchProperty } from './useProperties'
import type { Property } from '@/types/property'

const BATCH_SIZE = 20
const DELAY_MS = 250 // Rate limit: 10 requests per 2 seconds

export function useBatchFetch() {
  const { mutateAsync: fetchProperty } = useFetchProperty()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const abortRef = useRef(false)

  const batchFetch = useCallback(async (properties: Property[]) => {
    const pending = properties.filter(p => !p.fetched_at).slice(0, BATCH_SIZE)

    if (pending.length === 0) return

    setIsProcessing(true)
    setProgress({ current: 0, total: pending.length })
    abortRef.current = false

    for (let i = 0; i < pending.length; i++) {
      if (abortRef.current) break

      const prop = pending[i]
      try {
        await fetchProperty({
          id: prop.id,
          kommun: prop.kommun,
          fastighet: prop.fastighetsbeteckning,
        })
      } catch (error) {
        console.error(`Failed to fetch property ${prop.id}:`, error)
      }

      setProgress({ current: i + 1, total: pending.length })

      // Rate limiting delay
      if (i < pending.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    }

    setIsProcessing(false)
  }, [fetchProperty])

  const abort = useCallback(() => {
    abortRef.current = true
  }, [])

  return { batchFetch, isProcessing, progress, abort }
}
