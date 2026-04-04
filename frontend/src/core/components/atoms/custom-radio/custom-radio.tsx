'use client'

import React, { useState } from 'react'

import Grid2 from '@mui/material/Grid'
import { StyleAtom } from '@states/style-atom'
import { useAtom } from 'jotai'

import styles from '@components/atoms/custom-radio/custom-radio.module.css'

interface CustomRadioProps {
  options: { id: string; value: string }[]
  name: string
  onChange: (selectedValue: string) => void
}

const CustomRadio: React.FC<CustomRadioProps> = ({ options, name, onChange }) => {
  const [selectedValue, setSelectedValue] = useState('')
  const [stylesBackend] = useAtom(StyleAtom)

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(e.target.value)
    onChange(e.target.value)
  }

  return (
    <Grid2 className={styles['radio-input']}>
      {options.map((option) => (
        <React.Fragment key={option.id}>
          <input
            type="radio"
            id={option.id}
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={handleRadioChange}
          />
          <label
            htmlFor={option.id}
            style={{
              backgroundColor: 'transparent',
              borderColor: stylesBackend.backgroundColorSecondaryButton,
            }}
          ></label>
        </React.Fragment>
      ))}
    </Grid2>
  )
}

export default CustomRadio
