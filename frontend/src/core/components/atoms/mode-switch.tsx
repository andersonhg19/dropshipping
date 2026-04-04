'use client'

import React from 'react'

import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { IconButton } from '@mui/material'

import { useTheme } from '@hooks/ui/use-theme'

const ModeSwitch: React.FC = () => {
  const { mode, toggleColorMode } = useTheme()

  return (
    <IconButton
      onClick={toggleColorMode}
      color="inherit"
      aria-label={mode === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
      sx={{ ml: 1 }}
    >
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  )
}

export default ModeSwitch
