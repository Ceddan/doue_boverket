import { useState } from 'react'
import { useScan } from '@/hooks/useScan'
import { ScanForm } from './ScanForm'
import { ScanLog } from './ScanLog'

export function Scanner() {
  const [isOpen, setIsOpen] = useState(false)
  const { runScan, isScanning, logs, abort, clearLogs } = useScan()

  return (
    <div className="border-t border-line">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-3 flex items-center justify-between text-content-secondary hover:bg-bg-hover transition-colors"
      >
        <span className="text-sm font-medium">Manuell Skanning</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 py-4 bg-bg-secondary/30">
          <ScanForm onScan={runScan} isScanning={isScanning} onAbort={abort} />
          <ScanLog logs={logs} onClear={clearLogs} />
        </div>
      )}
    </div>
  )
}
