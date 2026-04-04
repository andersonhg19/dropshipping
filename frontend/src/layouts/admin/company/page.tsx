'use client'

import React, { useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, Fab, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { pageCreateAllowed, pageDeleteAllowed, pageUpdateAllowed } from '@utils/utilities'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { nPage } from '@config/navigation/npage'

import { CompanyDetailsResponse } from '@interfaces/response/admin/get-all-company-response-interface'

import CompanyEditForm from '@layouts/admin/company/form/company-edit-form'
import CompanySearchForm from '@layouts/admin/company/form/company-search-form'

const CompanyLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [selectedCompany, setSelectedCompany] = useState<CompanyDetailsResponse | null>(null)

  const pageKey = nPage.admin.empresa
  const canCreatePage = useMemo(() => pageCreateAllowed(pageKey), [pageKey])
  const activeForPage = useMemo(() => pageDeleteAllowed(pageKey), [pageKey])
  const canEditPage = useMemo(() => pageUpdateAllowed(pageKey), [pageKey])

  const handleNewCompany = () => {
    setSelectedCompany({
      id: '',
      name: '',
      nit: '',
      address: '',
      legalRepresentative: '',
      contactPerson: '',
      phone: '',
      email: '',
      active: true,
      idModifiedBy: 0,
      modifiedBy: '',
    })
  }

  const handleSaveAndExit = () => setSelectedCompany(null)

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
          !selectedCompany ? t('lbl_search_company') : selectedCompany.id ? t('lbl_edit_company') : t('lbl_new_company')
        }
        action={
          !selectedCompany &&
          canCreatePage && (
            <Tooltip title={t('lbl_new_company')}>
              <Fab color="primary" size="small" aria-label="add" onClick={handleNewCompany}>
                <PlusIcon />
              </Fab>
            </Tooltip>
          )
        }
      />
      <CardContent>
        {!selectedCompany ? (
          <CompanySearchForm setCompanyData={setSelectedCompany} canEditPage={canEditPage} />
        ) : (
          <CompanyEditForm
            companyData={selectedCompany}
            setCompanyData={setSelectedCompany}
            onSaveAndExit={handleSaveAndExit}
            activeForPage={activeForPage}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default CompanyLayoutForm
