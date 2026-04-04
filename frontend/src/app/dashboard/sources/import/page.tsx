'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import ImportLayoutForm from '@layouts/acquisition/import/page'

export default function ImportPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <ImportLayoutForm />
    </Suspense>
  )
}
