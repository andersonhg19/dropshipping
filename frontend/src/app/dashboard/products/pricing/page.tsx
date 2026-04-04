'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import PricingLayoutForm from '@layouts/commerce/pricing/page'

export default function PricingPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <PricingLayoutForm />
    </Suspense>
  )
}
