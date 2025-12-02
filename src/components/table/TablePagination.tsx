import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui'

interface TablePaginationProps<T> {
  table: Table<T>
}

export function TablePagination<T>({ table }: TablePaginationProps<T>) {
  const { pageIndex } = table.getState().pagination
  const pageCount = table.getPageCount()
  const totalRows = table.getFilteredRowModel().rows.length

  const startRow = pageIndex * table.getState().pagination.pageSize + 1
  const endRow = Math.min((pageIndex + 1) * table.getState().pagination.pageSize, totalRows)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-line bg-bg-secondary/30">
      <div className="text-sm text-content-muted">
        Visar{' '}
        <span className="font-medium text-content-secondary">{startRow}</span>
        {' - '}
        <span className="font-medium text-content-secondary">{endRow}</span>
        {' av '}
        <span className="font-medium text-content-secondary">{totalRows}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </Button>

        <span className="px-3 text-sm text-content-secondary">
          Sida{' '}
          <span className="font-medium">{pageIndex + 1}</span>
          {' av '}
          <span className="font-medium">{pageCount}</span>
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </Button>
      </div>
    </div>
  )
}
