'use client'

import * as React from 'react'

import { Box, Tab, Tabs } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { KeyRound, UserCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { UserDTOInterface } from '@interfaces/response/admin/get-all-users-response-interface'

import UserEditForm from '@layouts/admin/user/tabs/user-edit-form'
import UserPasswordTab from '@layouts/admin/user/tabs/user-password-tab'

type Props = {
  userData: UserDTOInterface
  onClose: () => void
  onUserUpdated: (u: UserDTOInterface | null) => void
  activeForPage?: boolean
}

// Animaciones para panel
const panelVariants = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -32, transition: { duration: 0.15 } },
}

const UserEditTabs: React.FC<Props> = ({ userData, onClose, onUserUpdated, activeForPage }) => {
  const { t } = useTranslation()
  const { cardBgColor, cardBorderColor, buttonBgColor, textSecondaryColor, dataGridSelectedBg } = usePaletteVars()
  const [tabIndex, setTabIndex] = React.useState(0)

  const tabs = [
    { key: 'data', label: t('lbl_user_data'), icon: <UserCog size={20} /> },
    { key: 'password', label: t('lbl_password'), icon: <KeyRound size={20} /> },
  ]

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
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
        {tabs.map((tdef, idx) => (
          <Tab
            key={tdef.key}
            icon={tdef.icon}
            iconPosition="start"
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>{tdef.label}</Box>}
            sx={{
              fontWeight: tabIndex === idx ? 700 : 500,
              color: tabIndex === idx ? buttonBgColor : textSecondaryColor,
              fontSize: { xs: '0.85rem', sm: '1rem' },
              minHeight: { xs: 44, sm: 48 },
              minWidth: { xs: 110, sm: 140, md: 170 },
              textTransform: 'none',
              transition: 'color 0.2s',
              letterSpacing: 0.3,
              mx: { xs: 1, sm: 2, md: 4 },
              px: { xs: 1, sm: 2 },
              py: 1,
              borderRadius: 2,
              gap: 1.25,
              '&.Mui-selected': {
                background: dataGridSelectedBg,
              },
              '&:not(:last-child)': { mr: 3 },
            }}
          />
        ))}
      </Tabs>

      <AnimatePresence mode="wait" initial={false}>
        {tabIndex === 0 && (
          <motion.div key="user-data" variants={panelVariants} initial="initial" animate="animate" exit="exit">
            <UserEditForm
              userData={userData}
              setUserData={onUserUpdated}
              onSaveAndExit={onClose}
              activeForPage={activeForPage}
            />
          </motion.div>
        )}
        {tabIndex === 1 && (
          <motion.div key="user-password" variants={panelVariants} initial="initial" animate="animate" exit="exit">
            <UserPasswordTab user={userData} onUserUpdated={onUserUpdated} />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default UserEditTabs
