import clsx from 'clsx'
import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react'

type ButtonProps<T extends ElementType> = {
  as?: T
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

const variants: Record<string, string> = {
  primary:
    'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
  secondary:
    'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
  ghost:
    'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary/30'
}

export default function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button'

  return (
    <Component
      className={clsx(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-4',
        'hover:scale-105 active:scale-95',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
