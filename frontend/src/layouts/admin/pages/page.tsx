'use client'

import React from 'react'

import { Card, CardContent, CardHeader } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useTranslation } from 'react-i18next'

import PageSearchForm from '@layouts/admin/pages/form/page-search-form'

const PageLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  return (
    <Card
      elevation={1}
      sx={{
        background: cardBgColor,
        boxShadow: muiTheme.shadows[2],
        borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
        mb: { xs: 2, sm: 3 },
        border: `1px solid ${cardBorderColor}`,
        overflow: 'hidden',
      }}
    >
      <CardHeader
        title={t('lbl_search_pages')}
        sx={{ '& .MuiCardHeader-title': { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
      />
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <PageSearchForm setPageData={() => {}} />
      </CardContent>
    </Card>
  )
}

export default PageLayoutForm
