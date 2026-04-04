'use client'

import React from 'react'

import CustomCard from 'src/core/components/molecules/custom-card'

import Icon from '@components/atoms/Icon'
import Title from '@components/atoms/Title'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  return (
    <CustomCard>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Title text={title} size="h6" />
          <Title text={value} size="h4" />
          <p className="text-sm text-gray-500">{change}</p>
        </div>
        <Icon name={icon as any} className="text-3xl sm:text-4xl text-gray-400 flex-shrink-0" />
      </div>
    </CustomCard>
  )
}

export default StatCard
