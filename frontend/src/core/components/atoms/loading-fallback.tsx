'use client'

import React from 'react'

import { useTranslation } from 'react-i18next'

export const LoadingFallback: React.FC = () => {
  const { t } = useTranslation()
  return <div>{t('msg_loading')}</div>
}
