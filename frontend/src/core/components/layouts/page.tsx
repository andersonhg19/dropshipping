'use client'

import React from 'react'

import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const UsersPage = () => {
  const { t } = useTranslation()

  return (
    <Box className="p-6">
      <Typography variant="h4" className="mb-4 font-bold">
        {t('lbl_users')}
      </Typography>
      <Typography variant="body1">{t('lbl_selectUserType')}</Typography>
    </Box>
  )
}

export default UsersPage
