'use client'

import React from 'react'

import { CardContent, CardHeader, Card as MUICard } from '@mui/material'
import { SxProps, Theme } from '@mui/system'

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
  sx?: SxProps<Theme>
  onClick?: () => void
}

const CustomCardComponent: React.FC<CardProps> = ({ title, children, className, sx, onClick }) => {
  const defaultStyles: SxProps<Theme> = {
    background: 'rgb(223, 225, 235)',
    borderRadius: '50px',
    boxShadow: `
      rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset,
      rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset,
      rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset,
      rgba(0, 0, 0, 0.06) 0px 2px 1px,
      rgba(0, 0, 0, 0.09) 0px 4px 2px,
      rgba(0, 0, 0, 0.09) 0px 8px 4px,
      rgba(0, 0, 0, 0.09) 0px 16px 8px,
      rgba(0, 0, 0, 0.09) 0px 32px 16px
    `,
  }

  return (
    <MUICard className={className} sx={{ ...defaultStyles, ...sx }} onClick={onClick}>
      {title && <CardHeader title={title} />}

      <CardContent>{children}</CardContent>
    </MUICard>
  )
}

export default CustomCardComponent
