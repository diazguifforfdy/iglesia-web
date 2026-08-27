import clsx from 'clsx'
import { type ComponentPropsWithoutRef } from 'react'

type CardProps = ComponentPropsWithoutRef<'div'> & {
  variant?: 'default' | 'accent'
}

const variants: Record<string, string> = {
  default: 'bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800',
  accent: 'bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30'
}

export default function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
