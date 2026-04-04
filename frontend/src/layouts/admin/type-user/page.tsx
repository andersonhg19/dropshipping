'use client'

import React, { useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, Fab, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { pageCreateAllowed, pageDeleteAllowed, pageUpdateAllowed } from '@utils/utilities'

import { nPage } from '@config/navigation/npage'

import { TypeUserDTOInterface } from '@interfaces/response/admin/get-all-type-user-response-interface'

import UsertypeEditForm from '@layouts/admin/type-user/form/user-type-edit-form'
import UserTypeSearchForm from '@layouts/admin/type-user/form/user-type-search-form'

const TypeUserLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [typeUser, setTypeUser] = useState<TypeUserDTOInterface | null>(null)

  // Create states for user page privileges
  const [npage] = useState(nPage.admin.roles)
  const canCreatePage = useMemo(() => pageCreateAllowed(npage), [npage])
  const activeForPage = useMemo(() => pageDeleteAllowed(npage), [npage])
  const canEditPage = useMemo(() => pageUpdateAllowed(npage), [npage])

  const handleNewTypeUser = () => {
    setTypeUser({
      id: null,
      idCompany: null,
      idSubsidiary: null,
      name: '',
      active: true,
      size: 100,
      page: 0,
    })
  }

  const handleSaveAndExit = () => {
    setTypeUser(null)
  }

  return (
    // activeForPage && (
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
        title={!typeUser ? t('lbl_search_roles') : typeUser.id ? t('lbl_editTypeUser') : t('lbl_typeNewUser')}
        action={
          canCreatePage &&
          !typeUser && (
            <Tooltip title={t('lbl_typeUser')}>
              <Fab color="primary" size="small" aria-label="add" onClick={handleNewTypeUser}>
                <PlusIcon />
              </Fab>
            </Tooltip>
          )
        }
      />
      <CardContent>
        {!typeUser && <UserTypeSearchForm setTypeUser={setTypeUser} canEditPage={canEditPage} />}
        {typeUser && (
          <UsertypeEditForm
            typeUserData={typeUser}
            setTypeUserData={setTypeUser}
            onSaveAndExit={handleSaveAndExit}
            activeForPage={activeForPage}
          />
        )}
      </CardContent>
    </Card>
  )
  // )
}

export default TypeUserLayoutForm
