import { useState, useMemo } from 'react'
import type { SortingState, RowSelectionState, PaginationState } from '@tanstack/react-table'
import { useProperties } from '@/hooks/useProperties'
import { useBatchFetch } from '@/hooks/useBatchFetch'
import { Header } from '@/components/layout/Header'
import { Toolbar } from '@/components/layout/Toolbar'
import { PropertiesTable } from '@/components/table/PropertiesTable'
import { Scanner } from '@/components/scanner/Scanner'
import { Spinner } from '@/components/ui'

function App() {
  const { data: properties = [], isLoading, error } = useProperties()
  const { batchFetch, isProcessing, progress } = useBatchFetch()

  // Table state
  const [globalFilter, setGlobalFilter] = useState('')
  const [showFetchedOnly, setShowFetchedOnly] = useState(false)
  const [selectedKommun, setSelectedKommun] = useState('')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'fastighetsbeteckning', desc: false },
  ])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  })

  // Computed values
  const loadedCount = useMemo(
    () => properties.filter(p => p.fetched_at).length,
    [properties]
  )

  const kommunOptions = useMemo(() => {
    const kommuner = [...new Set(properties.map(p => p.kommun).filter(Boolean))].sort()
    return [
      { value: '', label: 'Alla kommuner' },
      ...kommuner.map(k => ({ value: k, label: k }))
    ]
  }, [properties])

  const selectedCount = Object.keys(rowSelection).length

  const handleBatchFetch = () => {
    batchFetch(properties)
  }

  const handleFetchSelected = () => {
    const selectedProperties = properties.filter((_, index) => rowSelection[index])
    batchFetch(selectedProperties)
  }

  const handleClearSelection = () => {
    setRowSelection({})
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
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
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        loadedCount={loadedCount}
        totalCount={properties.length}
        onBatchFetch={handleBatchFetch}
        isFetching={isProcessing}
        fetchProgress={progress}
      />

      <Toolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        showFetchedOnly={showFetchedOnly}
        onShowFetchedOnlyChange={setShowFetchedOnly}
        selectedKommun={selectedKommun}
        onSelectedKommunChange={setSelectedKommun}
        kommunOptions={kommunOptions}
        selectedCount={selectedCount}
        onFetchSelected={handleFetchSelected}
        onClearSelection={handleClearSelection}
        pageSize={pagination.pageSize}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, pageSize: size, pageIndex: 0 }))}
      />

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
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        )}
      </main>

      <Scanner />
    </div>
  )
}

export default App
