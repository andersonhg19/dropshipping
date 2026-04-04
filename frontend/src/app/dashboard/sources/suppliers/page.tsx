'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import SupplierLayoutForm from '@layouts/acquisition/supplier/page'

export default function SuppliersPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <SupplierLayoutForm />
    </Suspense>
  )
}
