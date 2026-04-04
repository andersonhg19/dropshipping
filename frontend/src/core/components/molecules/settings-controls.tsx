'use client'

import React from 'react'

import Box from '@mui/material/Box'

import ModeSwitch from '@components/atoms/mode-switch'
import LanguageSelector from '@components/molecules/language-selector'
import OptionsMenu from '@components/molecules/options-menu'

const SettingsControls: React.FC = () => {
  return (
    <Box className="flex items-center gap-4">
      <LanguageSelector />
      <OptionsMenu />
      <ModeSwitch />
    </Box>
  )
}

export default SettingsControls
