'use client'

import React, { useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, Fab, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { pageCreateAllowed, pageDeleteAllowed, pageUpdateAllowed } from '@utils/utilities'

import { nPage } from '@config/navigation/npage'

import { UserDTOInterface } from '@interfaces/response/admin/get-all-users-response-interface'

import UserEditTabs from '@layouts/admin/user/form/user-edit-tabs'
import UserSearchForm from '@layouts/admin/user/form/user-search-form'

const UserLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [selectedUser, setSelectedUser] = useState<UserDTOInterface | null>(null)

  const pageKey = nPage.admin.usuario
  const canCreatePage = useMemo(() => pageCreateAllowed(pageKey), [pageKey])
  const activeForPage = useMemo(() => pageDeleteAllowed(pageKey), [pageKey])
  const canEditPage = useMemo(() => pageUpdateAllowed(pageKey), [pageKey])

  const handleNewUser = () => {
    setSelectedUser({
      id: '',
      idCompany: '',
      companyName: '',
      idSubsidiary: 0,
      subsidiaryName: '',
      idModifiedBy: 0,
      modifiedBy: '',
      idTypeUser: '',
      typeUserName: '',
      name: '',
      lastName: '',
      email: '',
      dni: '',
      cellphone: '',
      password: '',
      active: true,
    })
  }

  const handleCloseEditor = () => setSelectedUser(null)

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
        title={!selectedUser ? t('lbl_search_user') : selectedUser.id ? t('lbl_edit_user') : t('lbl_new_user')}
        action={
          !selectedUser &&
          canCreatePage && (
            <Tooltip title={t('lbl_user')}>
              <Fab color="primary" size="small" aria-label="add" onClick={handleNewUser}>
                <PlusIcon />
              </Fab>
            </Tooltip>
          )
        }
      />
      <CardContent>
        {!selectedUser ? (
          <UserSearchForm setUserData={setSelectedUser} canEditPage={canEditPage} />
        ) : (
          <UserEditTabs
            userData={selectedUser}
            onClose={handleCloseEditor}
            onUserUpdated={setSelectedUser}
            activeForPage={activeForPage}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default UserLayoutForm
