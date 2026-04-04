'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import { nPage } from '@config/navigation/npage'
import RequireCanRead from '@config/navigation/require-can-read'

import UserLayoutForm from '@layouts/admin/user/page'

export default function TypeUserPage() {
  return (
    <RequireCanRead npage={nPage.admin.usuario}>
      <Suspense fallback={<CustomLoader />}>
        <UserLayoutForm />
      </Suspense>
    </RequireCanRead>
  )
}
