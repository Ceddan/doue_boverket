import { createColumnHelper } from '@tanstack/react-table'
import type { Property } from '@/types/property'
import { EnergyClassBadge } from '@/components/badges/EnergyClassBadge'
import { Checkbox, Spinner } from '@/components/ui'
import { SearchHighlight } from './SearchHighlight'

const columnHelper = createColumnHelper<Property>()

// Consistent cell style for all text columns
const cellClass = 'text-content-primary'
const numericClass = 'text-content-primary tabular-nums text-right block'

export const createColumns = (globalFilter: string) => [
  // Selection column
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="Valj alla"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`Valj ${row.original.fastighetsbeteckning}`}
      />
    ),
    size: 36,
    enableSorting: false,
  }),

  columnHelper.accessor('fastighetsbeteckning', {
    header: 'Fastighet',
    cell: ({ getValue }) => (
      <SearchHighlight
        text={getValue() ?? '-'}
        searchTerm={globalFilter}
        className={cellClass}
      />
    ),
    size: 140,
  }),

  columnHelper.accessor('adress', {
    header: 'Adress',
    cell: ({ getValue }) => (
      <SearchHighlight
        text={getValue() ?? '-'}
        searchTerm={globalFilter}
        className={cellClass}
      />
    ),
    size: 180,
  }),

  columnHelper.accessor('kommun', {
    header: 'Kommun',
    cell: ({ getValue }) => (
      <span className={cellClass}>{getValue() ?? '-'}</span>
    ),
    size: 90,
  }),

  columnHelper.accessor('energiklass', {
    header: 'Klass',
    cell: ({ getValue }) => {
      const value = getValue()
      return value ? <EnergyClassBadge energyClass={value} size="sm" /> : (
        <span className={cellClass}>-</span>
      )
    },
    size: 55,
  }),

  columnHelper.accessor('primarenergital', {
    header: () => <span className="text-right block">Primarenergi</span>,
    cell: ({ getValue }) => (
      <span className={numericClass}>
        {getValue() ?? '-'}
      </span>
    ),
    size: 95,
  }),

  columnHelper.accessor('energiprestanda', {
    header: () => <span className="text-right block">Prestanda</span>,
    cell: ({ getValue }) => (
      <span className={numericClass}>
        {getValue() ?? '-'}
      </span>
    ),
    size: 85,
  }),

  columnHelper.accessor('datum', {
    header: 'Datum',
    cell: ({ getValue }) => (
      <span className={`${cellClass} tabular-nums`}>
        {getValue() ?? '-'}
      </span>
    ),
    size: 90,
  }),

  columnHelper.display({
    id: 'status',
    header: () => <span className="sr-only">Status</span>,
    cell: ({ row }) => {
      const { status, fetched_at } = row.original

      if (status === 'loading') {
        return <Spinner size="sm" />
      }

      if (fetched_at || status === 'done') {
        return (
          <svg
            className="w-4 h-4 text-energy-a"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      }

      if (status === 'error') {
        return (
          <svg
            className="w-4 h-4 text-energy-f"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )
      }

      return null
    },
    size: 36,
  }),
]
