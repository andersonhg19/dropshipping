'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import CategoryLayoutForm from '@layouts/commerce/category/page'

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <CategoryLayoutForm />
    </Suspense>
  )
}
