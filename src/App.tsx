import { useState, useMemo } from 'react'
import type { SortingState, PaginationState } from '@tanstack/react-table'
import { useProperties } from '@/hooks/useProperties'
import { PropertiesTable } from '@/components/table/PropertiesTable'
import { Spinner } from '@/components/ui'

function App() {
  const { data: properties = [], isLoading, error } = useProperties()

  // Table state
  const [globalFilter, setGlobalFilter] = useState('')
  const [showFetchedOnly, setShowFetchedOnly] = useState(false)
  const [selectedKommun, setSelectedKommun] = useState('')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'fastighetsbeteckning', desc: false },
  ])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })

  // Computed values
  const loadedCount = useMemo(
    () => properties.filter(p => p.energiklass).length,
    [properties]
  )

  const kommunOptions = useMemo(() => {
    const kommuner = [...new Set(properties.map(p => p.kommun).filter(Boolean))].sort()
    return [
      { value: '', label: 'Alla kommuner' },
      ...kommuner.map(k => ({ value: k, label: k }))
    ]
  }, [properties])

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-primary">
        <div className="text-center">
          <h2 className="text-xl font-bold text-content-primary mb-2">
            Kunde inte ladda data
          </h2>
          <p className="text-content-muted">
            {error instanceof Error ? error.message : 'Ett fel uppstod'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface-primary">
      {/* Header */}
      <header className="bg-surface-secondary border-b border-border-primary px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-content-primary">
              Energideklarationer
            </h1>
            <p className="text-xs sm:text-sm text-content-muted">
              {loadedCount} av {properties.length} med energiklass
            </p>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-surface-secondary border-b border-border-primary px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Sök fastighet, adress..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="px-3 py-2 border border-border-primary rounded-md bg-surface-primary text-content-primary placeholder:text-content-muted w-full sm:w-64"
          />

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedKommun}
              onChange={(e) => setSelectedKommun(e.target.value)}
              className="px-3 py-2 border border-border-primary rounded-md bg-surface-primary text-content-primary flex-1 sm:flex-none"
            >
              {kommunOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-content-secondary whitespace-nowrap">
              <input
                type="checkbox"
                checked={showFetchedOnly}
                onChange={(e) => setShowFetchedOnly(e.target.checked)}
                className="rounded"
              />
              <span className="hidden sm:inline">Endast med energiklass</span>
              <span className="sm:hidden">Med energiklass</span>
            </label>

            <select
              value={pagination.pageSize}
              onChange={(e) => setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), pageIndex: 0 }))}
              className="px-3 py-2 border border-border-primary rounded-md bg-surface-primary text-content-primary"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-content-muted">Laddar fastigheter...</p>
            </div>
          </div>
        ) : (
          <PropertiesTable
            data={properties}
            globalFilter={globalFilter}
            showFetchedOnly={showFetchedOnly}
            selectedKommun={selectedKommun}
            sorting={sorting}
            onSortingChange={setSorting}
            rowSelection={{}}
            onRowSelectionChange={() => {}}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        )}
      </main>
    </div>
  )
}

export default App
