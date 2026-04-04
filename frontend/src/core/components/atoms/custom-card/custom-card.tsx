'use client'

import React from 'react'

import { Box } from '@mui/material'

import styles from '@components/atoms/custom-card/custom-card.module.css'

interface CustomCardProps {
  customStyles?: React.CSSProperties
  beforeContent?: React.ReactNode
  afterContent?: React.ReactNode
  children?: React.ReactNode
  style?: React.CSSProperties
}

const CustomCard: React.FC<CustomCardProps> = ({ customStyles = {}, beforeContent, afterContent, children }) => {
  return (
    <Box className={styles['one-div']} sx={customStyles}>
      <Box className={styles['custom-before']}>{beforeContent}</Box>

      <Box className={styles['custom-content']}>{children}</Box>

      <Box className={styles['custom-after']}>{afterContent}</Box>
    </Box>
  )
}

export default CustomCard
