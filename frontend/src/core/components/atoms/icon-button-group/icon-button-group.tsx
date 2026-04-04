import React from 'react'

import Grid from '@mui/material/Grid'

import styles from '@components/atoms/icon-button-group/icon-button-group.module.css'

interface IconButtonProps {
  icon: React.ReactNode
  label: string
  onClick: (label: string) => void
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick }) => {
  return (
    <button className={styles.value} onClick={() => onClick(label)}>
      {icon}
      <span>{label}</span>
    </button>
  )
}

interface IconButtonGroupProps {
  items: { label: string; icon: React.ReactNode }[]
  onClick: (label: string) => void
}

const IconButtonGroup: React.FC<IconButtonGroupProps> = ({ items, onClick }) => {
  return (
    <Grid className={styles.input}>
      {items.map((item, index) => (
        <IconButton key={index} icon={item.icon} label={item.label} onClick={onClick} />
      ))}
    </Grid>
  )
}

export default IconButtonGroup
