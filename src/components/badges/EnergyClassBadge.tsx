import { cn } from '@/lib/utils'

const classStyles: Record<string, string> = {
  A: 'bg-energy-a/20 text-energy-a border-energy-a/50',
  B: 'bg-energy-b/20 text-energy-b border-energy-b/50',
  C: 'bg-energy-c/20 text-energy-c border-energy-c/50',
  D: 'bg-energy-d/20 text-energy-d border-energy-d/50',
  E: 'bg-energy-e/20 text-energy-e border-energy-e/50',
  F: 'bg-energy-f/20 text-energy-f border-energy-f/50',
  G: 'bg-energy-g/20 text-energy-g border-energy-g/50',
}

const defaultStyle = 'bg-slate-500/20 text-slate-400 border-slate-500/50'

interface EnergyClassBadgeProps {
  energyClass: string
  size?: 'sm' | 'md'
}

export function EnergyClassBadge({ energyClass, size = 'md' }: EnergyClassBadgeProps) {
  const upperClass = energyClass.toUpperCase()
  const styles = classStyles[upperClass] ?? defaultStyle

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-bold',
        styles,
        size === 'sm' ? 'px-2 py-0.5 text-xs min-w-[28px]' : 'px-2.5 py-1 text-sm min-w-[32px]'
      )}
    >
      {upperClass}
    </span>
  )
}
