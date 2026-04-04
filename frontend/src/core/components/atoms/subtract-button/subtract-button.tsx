import React, { useState } from 'react'

import styles from '@components/atoms/subtract-button/custom-subtract-button.module.css'

interface SubtractButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const SubtractButton: React.FC<SubtractButtonProps> = ({ onClick }) => {
  const [isRotated, setIsRotated] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsRotated(!isRotated)
    onClick(event)
  }

  return (
    <button title="Toggle" className={styles.addButton} onClick={handleClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="65px"
        height="60px"
        viewBox="0 0 24 24"
        className={`${styles.addButtonIcon} ${isRotated ? styles.rotated : ''}`}
      >
        <path
          d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
          strokeWidth="1.5"
        ></path>
        <path d="M8 12H16" strokeWidth="1.5"></path> {/* Línea horizontal para el "-" */}
      </svg>
    </button>
  )
}

export default SubtractButton
