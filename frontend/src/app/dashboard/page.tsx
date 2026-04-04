'use client'

import React, { Suspense, useEffect, useState } from 'react'

import CustomLoader from '@core/components/atoms/custom-loading/custom-loading'
import { nPage } from '@core/config/navigation/npage'
import RequireCanRead from '@core/config/navigation/require-can-read'

import { getUser } from '@utils/utilities'

import DashboardContent from '@layouts/dashboard/page'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const idUser = getUser() && getUser().id ? getUser().id : ''

  useEffect(() => {
    if (!idUser) {
      window.location.href = '/users/login'
      return
    }
    setIsLoading(false)
  }, [idUser])

  if (isLoading) {
    return <CustomLoader />
  }

  return (
    <RequireCanRead npage={nPage.tablero}>
      <Suspense fallback={<CustomLoader />}>
        <DashboardContent />
      </Suspense>
    </RequireCanRead>
  )
}
