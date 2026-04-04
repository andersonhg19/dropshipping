'use client'

import React, { useState } from 'react'

import { ChevronLeft } from '@mui/icons-material'
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import Grid2 from '@mui/material/Grid'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import Icon from '@components/atoms/Icon'
import Title from '@components/atoms/Title'

const sidebarItems = [
  { text: 'Dashboard', icon: 'Dashboard', path: '/dashboard' },
  { text: 'Inventario', icon: 'Inventory', path: '/inventario' },
  { text: 'Reportes', icon: 'Assessment', path: '/reportes' },
]

export default function AnimatedVerticalNavbar() {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()

  const toggleSidebar = () => setIsOpen(!isOpen)

  const sidebarVariants = {
    open: { width: '240px' },
    closed: { width: '60px' },
  }

  const chevronVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 },
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <Grid2 container>
      <motion.div
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ duration: 0.3 }}
        className="h-screen overflow-hidden bg-gray-800 text-white"
      >
        <Grid2 container direction="column" className="h-full">
          <Grid2 className="flex items-center justify-between p-4">
            {isOpen && <Title text="Dashboard" size="h6" />}
            <motion.div animate={isOpen ? 'open' : 'closed'} variants={chevronVariants} transition={{ duration: 0.3 }}>
              <ChevronLeft onClick={toggleSidebar} className="cursor-pointer" />
            </motion.div>
          </Grid2>

          <Grid2 className="flex-grow">
            <List>
              {sidebarItems.map((item) => (
                <ListItem
                  key={item.text}
                  onClick={() => handleNavigation(item.path)}
                  className="cursor-pointer transition-colors duration-200 hover:bg-gray-700"
                >
                  <ListItemIcon>
                    <Icon name={item.icon as any} className="text-white" />
                  </ListItemIcon>
                  {isOpen && <ListItemText primary={item.text} />}
                </ListItem>
              ))}
            </List>
          </Grid2>
        </Grid2>
      </motion.div>

      <Grid2 className="flex-grow p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </Grid2>
    </Grid2>
  )
}
