import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variants
          variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover',
          variant === 'secondary' && 'bg-bg-secondary text-content-primary hover:bg-bg-hover border border-line',
          variant === 'ghost' && 'text-content-secondary hover:bg-bg-hover hover:text-content-primary',
          variant === 'outline' && 'border border-line text-content-primary hover:bg-bg-hover',
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
