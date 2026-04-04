'use client'

import React from 'react'

import { Tooltip as MuiTooltip } from '@mui/material'
import { VariantProps, cva } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const tooltipContent = cva([], {
  variants: {
    intent: {
      primary: ['rounded-md', 'bg-zinc-700', 'font-open-sans', 'text-white'],
    },
    size: {
      md: ['px-4', 'py-2.5', 'text-xs'],
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  },
})

export interface TooltipProps extends VariantProps<typeof tooltipContent> {
  explainer: React.ReactElement | string
  children: React.ReactElement
  className?: string
  withArrow?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Tooltip({
  children,
  explainer,
  intent,
  size,
  side = 'top',
  className,
  withArrow = true,
}: TooltipProps) {
  // MUI usa placement: "top" | "bottom" | "left" | "right"
  // Puedes personalizar más el tooltip usando slotProps o sx si quieres.
  return (
    <MuiTooltip
      title={<span className={twMerge(tooltipContent({ intent, size, className }))}>{explainer}</span>}
      placement={side}
      arrow={withArrow}
      slotProps={{
        tooltip: {
          className: twMerge(tooltipContent({ intent, size, className })),
        },
        arrow: {
          className: 'fill-zinc-700', // O ajusta la clase según variantes si lo necesitas
        },
      }}
      enterDelay={200}
    >
      {children}
    </MuiTooltip>
  )
}
