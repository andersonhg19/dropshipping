'use client'

import React from 'react'

import { Typography } from '@mui/material'

interface LabelProps {
  htmlFor: string
  text: string
  className?: string
  style?: React.CSSProperties // Soporta la prop style
}

const Label = React.memo(({ htmlFor, text, className = '', style }: LabelProps) => {
  return (
    <label htmlFor={htmlFor} className={`mb-2 block ${className}`} style={style}>
      <Typography variant="subtitle1">{text}</Typography>
    </label>
  )
})

Label.displayName = 'Label'

export default Label
