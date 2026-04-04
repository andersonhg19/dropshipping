'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import { nPage } from '@config/navigation/npage'
import RequireCanRead from '@config/navigation/require-can-read'

import FilialLayoutForm from '@layouts/admin/filial/page'

export default function Filial() {
  return (
    <RequireCanRead npage={nPage.admin.filial}>
      <Suspense fallback={<CustomLoader />}>
        <FilialLayoutForm />
      </Suspense>
    </RequireCanRead>
  )
}
