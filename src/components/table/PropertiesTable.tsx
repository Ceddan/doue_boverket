import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
} from '@tanstack/react-table'
import type { Property } from '@/types/property'
import { createColumns } from './columns'
import { TablePagination } from './TablePagination'
import { cn } from '@/lib/utils'

interface PropertiesTableProps {
  data: Property[]
  globalFilter: string
  showFetchedOnly: boolean
  selectedKommun: string
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  rowSelection: RowSelectionState
  onRowSelectionChange: (selection: RowSelectionState) => void
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
}

export function PropertiesTable({
  data,
  globalFilter,
  showFetchedOnly,
  selectedKommun,
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
  pagination,
  onPaginationChange,
}: PropertiesTableProps) {
  const columns = useMemo(() => createColumns(globalFilter), [globalFilter])

  const filteredData = useMemo(() => {
    let result = data

    if (showFetchedOnly) {
      result = result.filter(p => p.fetched_at)
    }

    if (selectedKommun) {
      result = result.filter(p => p.kommun === selectedKommun)
    }

    return result
  }, [data, showFetchedOnly, selectedKommun])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    enableMultiSort: true,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange(newSorting)
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      onRowSelectionChange(newSelection)
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      onPaginationChange(newPagination)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      const { fastighetsbeteckning, adress, kommun } = row.original
      return (
        fastighetsbeteckning?.toLowerCase().includes(search) ||
        adress?.toLowerCase().includes(search) ||
        kommun?.toLowerCase().includes(search)
      )
    },
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead className="bg-bg-secondary sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-2 sm:px-4 py-2 sm:py-3 font-medium text-content-secondary text-xs sm:text-sm',
                        'border-b border-line',
                        canSort && 'cursor-pointer select-none hover:bg-bg-hover transition-colors'
                      )}
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-content-muted/50">
                            {sorted === 'asc' ? ' ▲' : sorted === 'desc' ? ' ▼' : ''}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="text-xs sm:text-sm">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-line transition-colors',
                  index % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-secondary/30',
                  'hover:bg-bg-hover',
                  row.getIsSelected() && 'bg-accent/10'
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-2 sm:px-4 py-2 sm:py-3"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="flex items-center justify-center py-12 text-content-muted">
            Inga fastigheter hittades
          </div>
        )}
      </div>

      <TablePagination table={table} />
    </div>
  )
}
