import { forwardRef, type InputHTMLAttributes, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, label, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || innerRef

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate ?? false
      }
    }, [resolvedRef, indeterminate])

    const checkbox = (
      <input
        ref={resolvedRef}
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-line bg-bg-input text-accent',
          'focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'cursor-pointer',
          className
        )}
        {...props}
      />
    )

    if (label) {
      return (
        <label className="inline-flex items-center gap-2 cursor-pointer text-content-secondary">
          {checkbox}
          <span className="text-sm">{label}</span>
        </label>
      )
    }

    return checkbox
  }
)

Checkbox.displayName = 'Checkbox'
