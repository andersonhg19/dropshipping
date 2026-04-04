import React from 'react'

import styles from '@components/atoms/toggle-switch/toggle-switch.module.css'

interface ToggleSwitchProps {
  onChange?: (checked: boolean) => void
  checked?: boolean
  className?: string // Prop para extender los estilos
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ onChange, checked = false, className = '' }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(e.target.checked)
  }

  return (
    <label className={`${styles.bar} ${className}`} htmlFor="toggle-check">
      <input type="checkbox" id="toggle-check" className={styles.checkbox} onChange={handleChange} checked={checked} />
      <span className={`${styles.top} ${checked ? styles.active : ''}`}></span>
      <span className={`${styles.middle} ${checked ? styles.active : ''}`}></span>
      <span className={`${styles.bottom} ${checked ? styles.active : ''}`}></span>
    </label>
  )
}

export default ToggleSwitch
