'use client'

import React, { useMemo, useState } from 'react'

import { Card, CardContent, CardHeader } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useTranslation } from 'react-i18next'

import { pageUpdateAllowed } from '@utils/utilities'

import { nPage } from '@config/navigation/npage'

import { TypeUserDTOInterface } from '@interfaces/response/admin/get-all-type-user-response-interface'

import PageTypeUserEditForm from '@layouts/admin/page-type-user/form/page-type-user-edit-form'
import UserTypeSearchForm from '@layouts/admin/type-user/form/user-type-search-form'

const PageTypeUserLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [selectedTypeUser, setSelectedTypeUser] = useState<TypeUserDTOInterface | null>(null)

  const pageKey = nPage.admin.permisos
  const canEditPage = useMemo(() => pageUpdateAllowed(pageKey), [pageKey])

  const handleSaveAndExit = () => setSelectedTypeUser(null)

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
        title={!selectedTypeUser ? t('lbl_search_for_permission_by_role') : t('lbl_edit_Page_Type_User')}
        sx={{ '& .MuiCardHeader-title': { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
      />
      <CardContent>
        {!selectedTypeUser ? (
          <UserTypeSearchForm setTypeUser={setSelectedTypeUser} canEditPage={canEditPage} />
        ) : (
          <PageTypeUserEditForm
            typeUser={selectedTypeUser}
            onSaveAndExit={handleSaveAndExit}
            onExit={handleSaveAndExit}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default PageTypeUserLayoutForm
