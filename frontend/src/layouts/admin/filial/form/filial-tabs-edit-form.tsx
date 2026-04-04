'use client'

import React, { useState } from 'react'

import { Box, Tab, Tabs } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { Paintbrush, SlidersHorizontal, UserCog } from 'lucide-react'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { FilialsDetailsResponse } from '@interfaces/response/admin/get-all-filial-response-interface'

import FilialConfigSearchForm from '@layouts/admin/filial/tabs/filial-config-search-tab'
import FilialGeneralEditForm from '@layouts/admin/filial/tabs/filial-general-edit-tab'
import FilialStyleSearchForm from '@layouts/admin/filial/tabs/filial-style-search-tab'

interface FilialTabsEditFormProps {
  filialData: FilialsDetailsResponse | null
  setFilialData: (value: FilialsDetailsResponse | null) => void
  onSaveAndExit: () => void
  activeForPage: boolean
}

// Animación para el tab panel
const panelVariants = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -32, transition: { duration: 0.15 } },
}

const FilialTabsEditForm: React.FC<FilialTabsEditFormProps> = ({
  filialData,
  setFilialData,
  onSaveAndExit,
  activeForPage,
}) => {
  const [tabIndex, setTabIndex] = useState(0)
  const { cardBgColor, cardBorderColor, buttonBgColor, textSecondaryColor, dataGridSelectedBg } = usePaletteVars()

  const tabLabels = [
    { label: 'General', key: 'general', icon: <UserCog size={20} /> },
    { label: 'Estilos', key: 'styles', icon: <Paintbrush size={20} /> },
    { label: 'Configuración', key: 'config', icon: <SlidersHorizontal size={20} /> },
  ]

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabIndex(newValue)

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mb: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          boxShadow: 2,
          bgcolor: cardBgColor,
          border: `1px solid ${cardBorderColor}`,
          minHeight: { xs: 44, sm: 48 },
          '.MuiTabs-indicator': {
            height: 4,
            borderRadius: 4,
            background: buttonBgColor,
            transition: 'all 0.3s',
          },
        }}
      >
        {tabLabels.map((tab, idx) => (
          <Tab
            key={tab.key}
            icon={tab.icon}
            iconPosition="start"
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>{tab.label}</Box>}
            sx={{
              fontWeight: tabIndex === idx ? 700 : 500,
              color: tabIndex === idx ? buttonBgColor : textSecondaryColor,
              fontSize: { xs: '0.85rem', sm: '1rem' },
              minHeight: { xs: 44, sm: 48 },
              minWidth: { xs: 120, sm: 160, md: 180 },
              textTransform: 'none',
              transition: 'color 0.2s',
              letterSpacing: 0.4,
              mx: { xs: 1, sm: 2, md: 5 },
              px: { xs: 1, sm: 2 },
              py: 1,
              borderRadius: 2,
              gap: 1.5,
              '&.Mui-selected': {
                background: dataGridSelectedBg,
              },
              '&:not(:last-child)': {
                mr: 4,
              },
            }}
          />
        ))}
      </Tabs>

      <AnimatePresence mode="wait" initial={false}>
        {tabIndex === 0 && (
          <motion.div key="general" variants={panelVariants} initial="initial" animate="animate" exit="exit">
            <FilialGeneralEditForm
              filialData={filialData}
              setFilialData={setFilialData}
              onSaveAndExit={onSaveAndExit}
              activeForPage={activeForPage}
            />
          </motion.div>
        )}
        {tabIndex === 1 && (
          <motion.div key="styles" variants={panelVariants} initial="initial" animate="animate" exit="exit">
            <FilialStyleSearchForm idSubsidiary={Number(filialData?.id ?? 0)} />
          </motion.div>
        )}
        {tabIndex === 2 && (
          <motion.div key="config" variants={panelVariants} initial="initial" animate="animate" exit="exit">
            <FilialConfigSearchForm idSubsidiary={Number(filialData?.id ?? 0)} />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default FilialTabsEditForm
