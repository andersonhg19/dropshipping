'use client'

import React from 'react'

import IosShareIcon from '@mui/icons-material/IosShare'
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip } from '@mui/material'
import Stack from '@mui/material/Stack'

import ModeSwitch from '@components/atoms/mode-switch'
import LanguageSelector from '@components/molecules/language-selector'
import OptionsMenu from '@components/molecules/options-menu'

import { useGridExportContext } from '@hooks/context/grid-export-context'

export default function DashboardHeaderActions() {
  const { t } = useTranslation()
  const { enabled, toggleDrawer } = useGridExportContext()

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      spacing={{ xs: 0, sm: 0.5 }}
      sx={{
        flexShrink: 0,
        minWidth: 0,
      }}
    >
      <ModeSwitch />
      <LanguageSelector />
      {enabled && (
        <Tooltip title={t('lbl_export_data')}>
          <IconButton onClick={toggleDrawer} size="small" sx={{ p: { xs: 0.5, sm: 1 } }}>
            <IosShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <OptionsMenu />
    </Stack>
  )
}
