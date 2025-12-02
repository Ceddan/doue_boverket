import { useMemo } from 'react'

interface SearchHighlightProps {
  text: string
  searchTerm: string
  className?: string
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function SearchHighlight({ text, searchTerm, className }: SearchHighlightProps) {
  const parts = useMemo(() => {
    if (!searchTerm?.trim()) {
      return [{ text, highlight: false }]
    }

    try {
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
      const splitParts = text.split(regex)

      return splitParts
        .filter(part => part !== '')
        .map(part => ({
          text: part,
          highlight: part.toLowerCase() === searchTerm.toLowerCase(),
        }))
    } catch {
      return [{ text, highlight: false }]
    }
  }, [text, searchTerm])

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark
            key={i}
            className="bg-yellow-300/40 dark:bg-yellow-500/30 text-inherit rounded px-0.5"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  )
}
