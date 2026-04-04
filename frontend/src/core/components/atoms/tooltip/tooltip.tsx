'use client'

import React from 'react'

import { Tooltip as MuiTooltip } from '@mui/material'
import { StyleAtom } from '@states/style-atom'
import { VariantProps, cva } from 'class-variance-authority'
import { useAtom } from 'jotai'
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
  const [styles] = useAtom(StyleAtom)

  // Construye las clases para el contenido del tooltip dinámicamente
  const contentClass = twMerge(
    tooltipContent({ intent, size, className }),
    styles?.tooltipBackgroundColor ? `bg-${styles.tooltipBackgroundColor}` : '',
    styles?.tooltipTextColor ? `text-${styles.tooltipTextColor}` : ''
  )

  // Para el arrow (flecha) del tooltip
  const arrowClass = styles?.tooltipArrowColor ? `fill-${styles.tooltipArrowColor}` : 'fill-zinc-700'

  return (
    <MuiTooltip
      title={<span className={contentClass}>{explainer}</span>}
      placement={side}
      arrow={withArrow}
      slotProps={{
        tooltip: {
          className: contentClass,
        },
        arrow: {
          className: arrowClass,
        },
      }}
      enterDelay={200}
    >
      {children}
    </MuiTooltip>
  )
}
