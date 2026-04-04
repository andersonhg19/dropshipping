'use client'

import React, { forwardRef } from 'react'

import { Button as MUIButton } from '@mui/material'
import { StyleAtom } from '@states/style-atom'
import { useAtom } from 'jotai'

interface ButtonProps {
  label: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
  className?: string
  startIcon?: React.ReactNode
  sx?: object
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label, type = 'button', variant = 'primary', onClick, disabled, className = '', startIcon, sx = {} }, ref) => {
    const [styles] = useAtom(StyleAtom)

    const backgroundColorMap: Record<string, string> = {
      primary: styles?.backgroundColorPrimaryButton || '#0472CD',
      secondary: styles?.backgroundColorSecondaryButton || '#F07D00',
    }

    const textColorMap: Record<string, string> = {
      primary: styles?.fontColorPrimaryButton || '#FFFFFF',
      secondary: styles?.fontColorSecondaryButton || '#FFFFFF',
    }

    const pressedColorMap: Record<string, string> = {
      primary: styles?.pressedColorPrimaryButton || '#0844A4',
      secondary: styles?.pressedColorSecondaryButton || '#AA671D',
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
      ;(event.currentTarget as HTMLElement).style.backgroundColor = pressedColorMap[variant ?? 'primary'] || '#000000'
    }

    const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
      ;(event.currentTarget as HTMLElement).style.backgroundColor =
        backgroundColorMap[variant ?? 'primary'] || '#0472CD'
    }

    return (
      <MUIButton
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={className}
        variant="contained"
        startIcon={startIcon}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        sx={{
          backgroundColor: backgroundColorMap[variant ?? 'primary'],
          color: textColorMap[variant ?? 'primary'],
          width: '100%',
          height: '60px',
          fontSize: {
            xs: '0.75rem',
            sm: '0.9rem',
            md: '1.25rem',
          },
          px: {
            xs: 1,
            sm: 2,
            md: 3,
          },
          ...sx,
        }}
      >
        {label}
      </MUIButton>
    )
  }
)

Button.displayName = 'Button'

export default Button
