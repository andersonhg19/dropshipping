import React, { forwardRef } from 'react'

import { SxProps, Theme } from '@mui/material'
import { StyleAtom } from '@states/style-atom'
import { useAtom } from 'jotai'

import styles from '@components/atoms/fancy-button/fancy-button.module.css'

interface FancyButtonProps {
  label: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  onClick?: () => void
  disabled?: boolean
  className?: string
  startIcon?: React.ReactNode
  sx?: SxProps<Theme>
  style?: React.CSSProperties
}

const FancyButton = forwardRef<HTMLButtonElement, FancyButtonProps>(
  ({ label, type = 'button', variant = 'primary', onClick, disabled, className = '', startIcon, sx, style }, ref) => {
    const [stylesFromAPI] = useAtom(StyleAtom)

    const colorMap: Record<string, string> = {
      primary: stylesFromAPI.buttonPrimaryColor || 'mediumspringgreen',
      secondary: stylesFromAPI.buttonSecondaryColor || '#1f2937',
      success: stylesFromAPI.buttonSuccessColor || 'green',
      danger: stylesFromAPI.buttonDangerColor || 'red',
      warning: stylesFromAPI.buttonWarningColor || 'yellow',
      info: stylesFromAPI.buttonInfoColor || 'blue',
    }

    // Determinar el color de fondo y texto basado en los estilos personalizados o el mapa de colores
    const backgroundColor = style?.backgroundColor || ''
    const textColor = style?.color || colorMap[variant]

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${styles.fancyButton} ${className}`}
        style={{
          borderColor: style?.borderColor || colorMap[variant] || 'transparent',
          color: textColor,
          fontWeight: 'bold',
          fontSize: '1rem',
          fontOpticalSizing: 'auto',
          backgroundColor: disabled ? 'rgba(0, 0, 0, 0.8)' : backgroundColor,
          opacity: disabled ? 0.8 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100% - 20%)',
          ...style,
          ...(sx as React.CSSProperties),
        }}
      >
        {startIcon && <span className="icon">{startIcon}</span>}
        <span className={styles.transition}></span>
        <span className={styles.gradient}></span>
        <span className={styles.label} style={{ color: textColor !== colorMap[variant] ? textColor : undefined }}>
          {label}
        </span>
      </button>
    )
  }
)

FancyButton.displayName = 'FancyButton'

export default FancyButton
