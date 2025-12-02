import { useState, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { scanProperties } from '@/api/properties'
import type { ScanParams } from '@/types/property'

export function useScan() {
  const [isScanning, setIsScanning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const queryClient = useQueryClient()
  const abortRef = useRef(false)

  const runScan = useCallback(async (params: ScanParams) => {
    setIsScanning(true)
    setLogs([])
    abortRef.current = false

    try {
      for await (const line of scanProperties(params)) {
        if (abortRef.current) break
        setLogs(prev => [...prev, line])
      }

      // Refresh properties after scan completes
      await queryClient.invalidateQueries({ queryKey: ['properties'] })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setLogs(prev => [...prev, `Error: ${message}`])
    } finally {
      setIsScanning(false)
    }
  }, [queryClient])

  const abort = useCallback(() => {
    abortRef.current = true
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return { runScan, isScanning, logs, abort, clearLogs }
}
