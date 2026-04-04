'use client'

import React, { useState } from 'react'

import LanguageIcon from '@mui/icons-material/Language'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useTheme } from '@mui/material/styles'

import i18n from '@config/language/i18n'

const LanguageSelector: React.FC = () => {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    handleClose()
  }

  return (
    <>
      <IconButton
        aria-controls="language-menu"
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          color: theme.palette.text.primary,
        }}
      >
        <LanguageIcon />
      </IconButton>
      <Menu id="language-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
        <MenuItem onClick={() => changeLanguage('es')}>Español</MenuItem>
      </Menu>
    </>
  )
}

export default LanguageSelector
