import { Input, Checkbox, Button, Select, type SelectOption } from '@/components/ui'

interface ToolbarProps {
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  showFetchedOnly: boolean
  onShowFetchedOnlyChange: (value: boolean) => void
  selectedKommun: string
  onSelectedKommunChange: (kommun: string) => void
  kommunOptions: SelectOption[]
  selectedCount: number
  onFetchSelected: () => void
  onClearSelection: () => void
  pageSize: number
  onPageSizeChange: (size: number) => void
}

export function Toolbar({
  globalFilter,
  onGlobalFilterChange,
  showFetchedOnly,
  onShowFetchedOnlyChange,
  selectedKommun,
  onSelectedKommunChange,
  kommunOptions,
  selectedCount,
  onFetchSelected,
  onClearSelection,
  pageSize,
  onPageSizeChange,
}: ToolbarProps) {
  return (
    <div className="bg-bg-secondary/50 border-b border-line px-6 py-3 flex-none flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-xs w-full">
          <Input
            type="text"
            placeholder="Sok fastigheter..."
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>

        <Select
          value={selectedKommun}
          onChange={(e) => onSelectedKommunChange(e.target.value)}
          options={kommunOptions}
        />

        <Checkbox
          checked={showFetchedOnly}
          onChange={(e) => onShowFetchedOnlyChange(e.target.checked)}
          label="Endast hamtade"
        />
      </div>

      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-content-muted">
              {selectedCount} valda
            </span>
            <Button variant="secondary" size="sm" onClick={onFetchSelected}>
              Hamta valda
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Avmarkera
            </Button>
          </div>
        )}

        <Select
          value={pageSize.toString()}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          options={[
            { value: '25', label: '25 per sida' },
            { value: '50', label: '50 per sida' },
            { value: '100', label: '100 per sida' },
          ]}
        />
      </div>
    </div>
  )
}
