'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import ProductLayoutForm from '@layouts/commerce/product/page'

export default function ProductListPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <ProductLayoutForm />
    </Suspense>
  )
}
