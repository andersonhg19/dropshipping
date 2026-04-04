'use client'

import React, { Suspense } from 'react'

import { LoadingFallback } from '@components/atoms/loading-fallback'
import PageLayoutForm from '@layouts/admin/pages/page'

export default function UsersPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageLayoutForm />
    </Suspense>
  )
}
