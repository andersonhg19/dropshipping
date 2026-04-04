'use client'

import React from 'react'

import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomCard from 'src/core/components/molecules/custom-card'

interface Transaction {
  id: number
  customer: string
  products: number
  total: number
  date: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const { t } = useTranslation()
  return (
    <CustomCard title={t('lbl_recent_transactions')}>
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <Table size="small" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('lbl_customer')}</TableCell>
              <TableCell>{t('lbl_products')}</TableCell>
              <TableCell>{t('tle_total')}</TableCell>
              <TableCell>{t('lbl_date')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.customer}</TableCell>
                <TableCell>{transaction.products}</TableCell>
                <TableCell>${transaction.total.toFixed(2)}</TableCell>
                <TableCell>{transaction.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </CustomCard>
  )
}

export default RecentTransactions
