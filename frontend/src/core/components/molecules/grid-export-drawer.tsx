'use client'

import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TableViewIcon from '@mui/icons-material/TableView'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import { Box, Divider, Drawer, IconButton, Stack, Tooltip, Typography } from '@mui/material'

import { useGridExportContext } from '@hooks/context/grid-export-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useGridExporter } from '@hooks/use-grid-exporter'

export default function GridExportDrawer() {
  const { t } = useTranslation()
  const { cardBgColor, cardBorderColor, textColor, textSecondaryColor, buttonBgColor, buttonTextColor } =
    usePaletteVars()
  const { open, closeDrawer, config, enabled } = useGridExportContext()

  const columns = config?.columns ?? []
  const rows = config?.rows ?? []
  const fileName = config?.fileName ?? 'export'
  const excludeFields = config?.excludeFields ?? []
  const valueFormatters = config?.valueFormatters ?? {}

  const exporter = useGridExporter({
    columns,
    rows,
    fileName,
    excludeFields,
    valueFormatters,
  })

  // Si no está habilitado o no hay config, no montamos nada (evita parpadeos)
  if (!enabled || !config) return null

  const disabled = !rows.length

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeDrawer}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 320 },
          bgcolor: cardBgColor,
          borderLeft: `1px solid ${cardBorderColor}`,
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ color: textColor, fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {t('lbl_export_data')}
        </Typography>
        <IconButton onClick={closeDrawer} sx={{ color: textSecondaryColor }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ p: { xs: 1.5, sm: 2 }, color: textSecondaryColor }}>
        <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {t('lbl_records')}: <b style={{ color: textColor }}>{config.rows?.length ?? 0}</b>
        </Typography>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          {t('lbl_columns')}: <b style={{ color: textColor }}>{config.columns?.length ?? 0}</b>
        </Typography>
      </Box>

      <Divider />

      <Stack
        direction="row"
        flexWrap="wrap"
        sx={{
          p: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 3 },
          '& .MuiIconButton-root': { flexShrink: 0 },
        }}
      >
        <Tooltip title={t('lbl_export_csv')}>
          <span>
            <IconButton
              onClick={() => exporter.exportTo('csv')}
              disabled={disabled}
              sx={{
                border: `1px solid ${cardBorderColor}`,
                color: textColor,
                '&:hover': { bgcolor: buttonBgColor, color: buttonTextColor },
              }}
              aria-label="export-csv"
            >
              <TextSnippetIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t('lbl_export_excel')}>
          <span>
            <IconButton
              onClick={() => exporter.exportTo('xlsx')}
              disabled={disabled}
              sx={{
                border: `1px solid ${cardBorderColor}`,
                color: textColor,
                '&:hover': { bgcolor: buttonBgColor, color: buttonTextColor },
              }}
              aria-label="export-xlsx"
            >
              <TableViewIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={t('lbl_export_pdf')}>
          <span>
            <IconButton
              onClick={() => exporter.exportTo('pdf')}
              disabled={disabled}
              sx={{
                border: `1px solid ${cardBorderColor}`,
                color: textColor,
                '&:hover': { bgcolor: buttonBgColor, color: buttonTextColor },
              }}
              aria-label="export-pdf"
            >
              <PictureAsPdfIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Drawer>
  )
}
