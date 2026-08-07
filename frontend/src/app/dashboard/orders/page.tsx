'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import OrdersLayout from '@layouts/commerce/orders/page'

export default function OrdersPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <OrdersLayout />
    </Suspense>
  )
}
