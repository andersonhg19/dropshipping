'use client'

import React from 'react'

import { CardContent, CardHeader, Card as MUICard } from '@mui/material'

interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

const CustomCard: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <MUICard className={className} sx={{ overflow: 'hidden' }}>
      {title && (
        <CardHeader title={title} sx={{ '& .MuiCardHeader-title': { fontSize: { xs: '0.95rem', sm: '1rem' } } }} />
      )}
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>{children}</CardContent>
    </MUICard>
  )
}

export default CustomCard
