'use client'

import React from 'react'

import { Typography } from '@mui/material'

interface TitleProps {
  text: string
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Title: React.FC<TitleProps> = ({ text, size = 'h1' }) => {
  return (
    <Typography variant={size} className="font-bold">
      {text}
    </Typography>
  )
}

export default Title
