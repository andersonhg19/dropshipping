'use client'

import React from 'react'

import Grid2 from '@mui/material/Grid'

import Button from '@components/atoms/button/button'

interface NumericKeyProps {
  label: string | number
  onClick: () => void
  className?: string
}

const NumericKey: React.FC<NumericKeyProps> = ({ label, onClick, className }) => {
  return (
    <Grid2 container justifyContent="center" component="div">
      <Button label={label.toString()} onClick={onClick} className={`h-16 w-full text-3xl font-bold ${className}`} />
    </Grid2>
  )
}

export default NumericKey
