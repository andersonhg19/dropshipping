'use client'

import React from 'react'

import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import Image from 'next/image'
import LanguageSelector from 'src/core/components/molecules/language-selector'
import OptionsMenu from 'src/core/components/molecules/options-menu'
import WelcomeInfo from 'src/core/components/molecules/welcome-info'

import ModeSwitch from '@components/atoms/mode-switch'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

const Navbar: React.FC = () => {
  const muiTheme = useMuiTheme()
  const { appBarBg, appBarShadow, textColor } = usePaletteVars()

  // Selección dinámica del logo según modo de tema
  const logoSrc = muiTheme.palette.mode === 'dark' ? '/logo/visnex-light.svg' : '/logo/visnex-dark.svg'

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: appBarBg,
        boxShadow: appBarShadow,
        color: textColor,
      }}
    >
      <Grid container alignItems="center">
        <Grid size={{ xs: 10 }} className="flex items-center gap-4">
          <Image
            src={logoSrc}
            alt="Platform Logo"
            width={50}
            height={50}
            style={{
              objectFit: 'contain',
            }}
            priority
          />
          <WelcomeInfo />
        </Grid>

        <Grid size={{ xs: 2 }} className="flex justify-end items-center gap-4">
          <ModeSwitch />
          <LanguageSelector />
          <OptionsMenu />
        </Grid>
      </Grid>
    </AppBar>
  )
}

export default Navbar
