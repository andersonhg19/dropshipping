'use client'

import React from 'react'

import { SxProps, Typography } from '@mui/material'
import { Theme } from '@mui/system'
import { StyleAtom } from '@states/style-atom'
import { useAtom } from 'jotai'

interface LabelProps {
  htmlFor: string
  text: string
  sx?: SxProps<Theme>
}

const Label = React.memo(({ htmlFor, text, sx }: LabelProps) => {
  const [styles] = useAtom(StyleAtom)

  return (
    <label htmlFor={htmlFor} className="mb-2 block">
      <Typography
        variant="subtitle1"
        sx={{
          color: styles.fontColorLabel || '#000',
          fontFamily: styles.fontLabel || 'Arial',
          fontSize: styles.fontSizeLabel || '1rem',
          ...sx,
        }}
      >
        {text}
      </Typography>
    </label>
  )
})

Label.displayName = 'Label'

export default Label
