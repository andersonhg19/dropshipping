import React from 'react'

import styles from '@components/atoms/custom-loading/custom-loader.module.css'

const CustomLoader: React.FC = () => {
  return (
    <div className={styles.loader}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  )
}

export default CustomLoader
