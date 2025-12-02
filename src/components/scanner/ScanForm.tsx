import { useState } from 'react'
import { Input, Button, Spinner } from '@/components/ui'
import type { ScanParams } from '@/types/property'

interface ScanFormProps {
  onScan: (params: ScanParams) => void
  isScanning: boolean
  onAbort: () => void
}

export function ScanForm({ onScan, isScanning, onAbort }: ScanFormProps) {
  const [baseName, setBaseName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [kommun, setKommun] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!baseName || !start || !end || !kommun) return

    onScan({
      base_name: baseName,
      start: parseInt(start, 10),
      end: parseInt(end, 10),
      kommun,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-1">
            Basnamn
          </label>
          <Input
            type="text"
            value={baseName}
            onChange={(e) => setBaseName(e.target.value)}
            placeholder="t.ex. KRUTDURKEN"
            disabled={isScanning}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-1">
            Kommun
          </label>
          <Input
            type="text"
            value={kommun}
            onChange={(e) => setKommun(e.target.value)}
            placeholder="t.ex. SOLNA"
            disabled={isScanning}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-1">
            Start nummer
          </label>
          <Input
            type="number"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="1"
            min="1"
            disabled={isScanning}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-1">
            Slut nummer
          </label>
          <Input
            type="number"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="10"
            min="1"
            disabled={isScanning}
          />
        </div>
      </div>

      <div className="flex gap-2">
        {isScanning ? (
          <Button type="button" variant="secondary" onClick={onAbort}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Avbryt
          </Button>
        ) : (
          <Button type="submit" disabled={!baseName || !start || !end || !kommun}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Starta Skanning
          </Button>
        )}
        {isScanning && <Spinner />}
      </div>
    </form>
  )
}
