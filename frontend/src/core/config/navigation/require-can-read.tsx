'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'

import { getUserPrivileges, pageReadAllowed } from '@utils/utilities'

export default function RequireCanRead({
  npage,
  children,
  fallbackPath = '/dashboard',
}: {
  npage: string
  children: React.ReactNode
  fallbackPath?: string
}) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const privs = getUserPrivileges()
    if (!privs || privs.length === 0) {
      setTimeout(() => {
        setAllowed(pageReadAllowed(npage))
        setReady(true)
      }, 0)
      return
    }
    setAllowed(pageReadAllowed(npage))
    setReady(true)
  }, [npage])

  useEffect(() => {
    if (ready && allowed === false) {
      router.replace(`${fallbackPath}?denied=${encodeURIComponent(npage)}`)
    }
  }, [ready, allowed, npage, router, fallbackPath])

  if (!ready) return <CustomLoader />
  if (!allowed) return null
  return <>{children}</>
}
