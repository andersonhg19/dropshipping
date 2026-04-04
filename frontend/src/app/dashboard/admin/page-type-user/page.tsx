'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import { nPage } from '@config/navigation/npage'
import RequireCanRead from '@config/navigation/require-can-read'

import PageTypeUserLayoutForm from '@layouts/admin/page-type-user/page'

export default function TypeUserPage() {
  return (
    <RequireCanRead npage={nPage.admin.permisos}>
      <Suspense fallback={<CustomLoader />}>
        <PageTypeUserLayoutForm />
      </Suspense>
    </RequireCanRead>
  )
}
