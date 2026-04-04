'use client'

import React, { useState } from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import UserAtom from '@states/UserAtom'
import AdminAtom from '@states/admin-atom'
import { encryptedCacheAtom } from '@states/encrypted-cache'
import { pathAtom, subsidiaryStorePosAtom } from '@states/pos-option-atom'
import { storeInfoAtom } from '@states/store-atom'
import { subsidiaryAtom } from '@states/subsidiary-atom'
import { useSetAtom } from 'jotai'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { deleteKeyApi, deleteUser, deleteUserPrivileges } from '@utils/utilities'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

const OptionsMenu: React.FC = () => {
  const { t } = useTranslation()
  const { textColor, cardBgColor } = usePaletteVars()
  const pathname = usePathname()

  // No mostrar opción de logout en la página de inicio
  const isHomePage = pathname === '/'
  // Átomos de Jotai para limpiar al cerrar sesión
  const setUser = useSetAtom(UserAtom)
  const setAdmin = useSetAtom(AdminAtom)
  const setSubsidiary = useSetAtom(subsidiaryAtom)
  const setStoreInfo = useSetAtom(storeInfoAtom)
  const setPath = useSetAtom(pathAtom)
  const setSubsidiaryStorePos = useSetAtom(subsidiaryStorePosAtom)
  const setEncryptedCache = useSetAtom(encryptedCacheAtom)

  const router = useRouter()

  // MUI menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Manejo del logout
  const handleLogout = () => {
    // 1. Limpiar todos los átomos de Jotai (estado en memoria)
    setUser(null)
    setAdmin(null)
    setSubsidiary(null)
    setStoreInfo(null)
    setPath(null)
    setSubsidiaryStorePos(null)
    setEncryptedCache({})

    // 2. Limpiar datos específicos del localStorage (con prefijo de fecha)
    deleteUser()
    deleteKeyApi()
    deleteUserPrivileges()

    // 3. Limpiar todo el localStorage y sessionStorage por seguridad
    localStorage.clear()
    sessionStorage.clear()

    // 4. Redirigir al inicio
    handleClose()
    router.push('/')
  }

  // No renderizar nada en la página de inicio
  if (isHomePage) {
    return null
  }

  return (
    <>
      <IconButton
        size="small"
        sx={{
          color: textColor,
        }}
        onClick={handleMenu}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            bgcolor: cardBgColor,
            color: textColor,
          },
        }}
      >
        <MenuItem onClick={handleLogout}>{t('lbl_logout')}</MenuItem>
      </Menu>
    </>
  )
}

export default OptionsMenu
