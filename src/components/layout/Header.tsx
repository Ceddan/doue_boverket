import { Button, Spinner } from '@/components/ui'
import { useTheme } from '@/context/ThemeContext'

interface HeaderProps {
  loadedCount: number
  totalCount: number
  onBatchFetch: () => void
  isFetching: boolean
  fetchProgress?: { current: number; total: number }
}

export function Header({
  loadedCount,
  totalCount,
  onBatchFetch,
  isFetching,
  fetchProgress,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="glass-panel z-50 flex-none">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-neutral-700 dark:bg-neutral-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-content-primary">
            Boverket Energy Data
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-content-muted">
            <span className="font-medium text-content-secondary">{loadedCount}</span>
            {' / '}
            <span>{totalCount}</span>
            {' Laddade'}
          </div>

          <Button onClick={onBatchFetch} disabled={isFetching}>
            {isFetching ? (
              <>
                <Spinner size="sm" />
                <span>
                  {fetchProgress
                    ? `${fetchProgress.current}/${fetchProgress.total}`
                    : 'Laddar...'}
                </span>
              </>
            ) : (
              <>
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Hamta Data (20 st)</span>
              </>
            )}
          </Button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-bg-hover transition-colors text-content-muted hover:text-content-primary"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
