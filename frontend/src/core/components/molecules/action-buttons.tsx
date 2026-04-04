'use client'

import React from 'react'

import { Box } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'

import Button from '@components/atoms/button/button'

interface ActionButtonsProps {
  onVoidOrder: () => void
  onVoidLast: () => void
  onResume: () => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onVoidOrder, onVoidLast, onResume }) => {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        mb: 1,
        p: 1,
        boxShadow: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid size={{ xs: 4 }}>
          <Button
            label={t('lbl_void_order')}
            variant="secondary"
            onClick={onVoidOrder}
            className="full-width-button"
            sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Button
            label={t('lbl_void_last')}
            variant="secondary"
            onClick={onVoidLast}
            className="full-width-button"
            sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Button label={t('lbl_resume')} variant="primary" onClick={onResume} className="full-width-button" />
        </Grid>
      </Grid>
    </Box>
  )
}

export default ActionButtons
