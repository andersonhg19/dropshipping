'use client'

import React, { Suspense } from 'react'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import PublishChannelLayoutForm from '@layouts/commerce/publish-channel/page'

export default function ChannelsPage() {
  return (
    <Suspense fallback={<CustomLoader />}>
      <PublishChannelLayoutForm />
    </Suspense>
  )
}
