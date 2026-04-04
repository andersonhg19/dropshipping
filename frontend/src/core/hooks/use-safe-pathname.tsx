'use client'

import { useEffect, useState } from 'react'

export const useSafePathname = () => {
  const [pathname, setPathname] = useState<string>('')

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  return pathname
}
