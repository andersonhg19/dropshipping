'use client'

import React from 'react'

import { SxProps, Typography } from '@mui/material'
import { Theme } from '@mui/system'
import { StyleAtom } from '@states/style-atom'
import { useAtom } from 'jotai'

interface TitleProps {
  id?: string
  text: string
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  sx?: SxProps<Theme>
}

const Title: React.FC<TitleProps> = ({ id, text, size = 'h1', sx }) => {
  const [styles] = useAtom(StyleAtom)

  return (
    <Typography
      id={id}
      variant={size}
      sx={{
        color: styles.titleTextColor || '#000',
        fontFamily: styles.fontTitle || 'Arial',
        fontSize: styles.fontSizeTitle || '2rem',
        fontWeight: styles.titleFontWeight || 'bold',
        ...sx,
      }}
    >
      {text}
    </Typography>
  )
}

export default Title
