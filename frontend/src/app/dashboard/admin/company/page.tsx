'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import { nPage } from '@config/navigation/npage'
import RequireCanRead from '@config/navigation/require-can-read'

import CompanyLayoutForm from '@layouts/admin/company/page'

export default function Company() {
  return (
    <RequireCanRead npage={nPage.admin.empresa}>
      <Suspense fallback={<CustomLoader />}>
        <CompanyLayoutForm />
      </Suspense>
    </RequireCanRead>
  )
}
