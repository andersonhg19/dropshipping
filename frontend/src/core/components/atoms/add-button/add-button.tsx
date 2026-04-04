'use client'

import React, { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import styles from '@components/atoms/add-button/custom-add-button.module.css'

interface AddButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  style?: React.CSSProperties
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, style }) => {
  const { t } = useTranslation()
  const [size, setSize] = useState(60) // Define un tamaño inicial

  useEffect(() => {
    const handleResize = () => {
      const newSize = Math.max(10, Math.min(window.innerWidth * 1, 60))
      setSize(newSize)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <button
      title={t('lbl_add_new')}
      className={styles.addButton}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        ...style,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${size * 0.8}px`}
        height={`${size * 0.8}px`}
        viewBox="0 0 24 24"
        className={styles.addButtonIcon}
      >
        <path
          d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
          strokeWidth="1.5"
        ></path>
        <path d="M8 12H16" strokeWidth="1.5"></path>
        <path d="M12 16V8" strokeWidth="1.5"></path>
      </svg>
    </button>
  )
}

export default AddButton
