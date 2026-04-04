'use client'

import React from 'react'

import { AppBar, Toolbar } from '@mui/material'

import Title from '@components/atoms/Title'

const DashboardHeader: React.FC = () => {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <Title text="Dashboard" size="h4" />
      </Toolbar>
    </AppBar>
  )
}

export default DashboardHeader
