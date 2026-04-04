'use client'

import React, { useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, Fab, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { pageCreateAllowed, pageDeleteAllowed, pageUpdateAllowed } from '@utils/utilities'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { nPage } from '@config/navigation/npage'

import { FilialsDetailsResponse } from '@interfaces/response/admin/get-all-filial-response-interface'

import FilialSearchForm from '@layouts/admin/filial/form/filial-search-form'
import FilialTabsEditForm from '@layouts/admin/filial/form/filial-tabs-edit-form'

const FilialLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [selectedFilial, setSelectedFilial] = useState<FilialsDetailsResponse | null>(null)

  const pageKey = nPage.admin.filial
  const canCreatePage = useMemo(() => pageCreateAllowed(pageKey), [pageKey])
  const activeForPage = useMemo(() => pageDeleteAllowed(pageKey), [pageKey])
  const canEditPage = useMemo(() => pageUpdateAllowed(pageKey), [pageKey])

  const handleNewFilial = () => {
    setSelectedFilial({
      id: 0,
      name: '',
      idCompany: '',
      companyName: '',
      nit: '',
      address: '',
      legalRepresentative: '',
      phone: '',
      email: '',
      active: true,
      idModifiedBy: '',
      image: '',
      modifiedBy: '',
    })
  }

  const handleSaveAndExit = () => {
    setSelectedFilial(null)
  }

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
        sx={{ '& .MuiCardHeader-title': { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
        title={
          !selectedFilial ? t('lbl_search_filial') : selectedFilial.id ? t('lbl_edit_filial') : t('lbl_new_filial')
        }
        action={
          !selectedFilial &&
          canCreatePage && (
            <Tooltip title={t('lbl_new_filial')}>
              <Fab color="primary" size="small" aria-label="add" onClick={handleNewFilial}>
                <PlusIcon />
              </Fab>
            </Tooltip>
          )
        }
      />
      <CardContent>
        {!selectedFilial ? (
          <FilialSearchForm setFilialData={setSelectedFilial} canEditPage={canEditPage} />
        ) : (
          <FilialTabsEditForm
            filialData={selectedFilial}
            setFilialData={setSelectedFilial}
            onSaveAndExit={handleSaveAndExit}
            activeForPage={activeForPage}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default FilialLayoutForm
