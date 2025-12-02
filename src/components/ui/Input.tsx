import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-bg-input px-4 py-2 text-content-primary',
            'border-line focus:border-accent focus:ring-1 focus:ring-accent',
            'placeholder:text-content-placeholder',
            'transition-colors outline-none',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
