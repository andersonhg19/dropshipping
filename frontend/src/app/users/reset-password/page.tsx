'use client'

import { Suspense } from 'react'

import ResetPasswordPage from '@layouts/auth/reset-password/page'

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ResetPasswordPage />
    </Suspense>
  )
}
