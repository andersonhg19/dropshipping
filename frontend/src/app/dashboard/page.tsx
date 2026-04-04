'use client'

import React, { Suspense, useEffect, useState } from 'react'

import CustomLoader from '@core/components/atoms/custom-loading/custom-loading'
import { nPage } from '@core/config/navigation/npage'
import RequireCanRead from '@core/config/navigation/require-can-read'

import { getUser, pageReadAllowed } from '@utils/utilities'

import DashboardContent from '@layouts/dashboard/page'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const idUser = getUser() && getUser().id ? getUser().id : ''

  useEffect(() => {
    // Si no hay usuario, redirigir al login
    if (!idUser) {
      window.location.href = '/users/login'
      return
    }

    // Verificar permisos y redirigir según corresponda
    const canAccessMain = pageReadAllowed(nPage.tablero)
    const canAccessDoctor = pageReadAllowed(nPage.health.dashboardDoctor)

    if (!canAccessMain && canAccessDoctor) {
      // Si no tiene acceso al dashboard principal pero sí al dashboard-doctor, redirigir
      window.location.href = '/dashboard/health/dashboard-doctor'
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
