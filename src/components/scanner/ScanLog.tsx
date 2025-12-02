import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui'

interface ScanLogProps {
  logs: string[]
  onClear: () => void
}

export function ScanLog({ logs, onClear }: ScanLogProps) {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  if (logs.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-content-secondary">Skanningslogg</h4>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Rensa
        </Button>
      </div>
      <div
        ref={logRef}
        className="bg-bg-primary border border-line rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs"
      >
        {logs.map((log, index) => {
          const isError = log.toLowerCase().includes('error') || log.toLowerCase().includes('fel')
          const isSuccess = log.toLowerCase().includes('success') || log.toLowerCase().includes('done')

          return (
            <div
              key={index}
              className={
                isError
                  ? 'text-energy-f'
                  : isSuccess
                  ? 'text-energy-a'
                  : 'text-content-muted'
              }
            >
              {log}
            </div>
          )
        })}
      </div>
    </div>
  )
}
