'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { PaletteMode } from '@mui/material'

type ThemeContextType = {
  mode: PaletteMode
  toggleColorMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light')

  useEffect(() => {
    // Recuperar el tema guardado al cargar la página
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme-mode') as PaletteMode
      if (savedMode) {
        setMode(savedMode)
      }
    }
  }, [])

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light'
      // Guardar la preferencia del usuario
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-mode', newMode)
      }
      return newMode
    })
  }

  return <ThemeContext.Provider value={{ mode, toggleColorMode }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
