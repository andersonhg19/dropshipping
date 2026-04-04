'use client'

import React from 'react'

import { CircularProgress, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'

const CustomLoading: React.FC = () => {
  const { t } = useTranslation()
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <CircularProgress size={60} thickness={4} className="animate-spin text-blue-600" />

      <Tooltip title={t('msg_fetching_data')} arrow placement="top">
        <div className="cursor-pointer text-lg font-semibold text-gray-600">{t('msg_loading_please_wait')}</div>
      </Tooltip>

      {/* Tailwind CSS animation for visual effect */}
      <div className="relative mt-2">
        <div className="size-16 animate-spin rounded-full border-4 border-dashed border-blue-500"></div>
      </div>
    </div>
  )
}

export default CustomLoading
