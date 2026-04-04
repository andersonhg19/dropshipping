import React from 'react'

import Box from '@mui/material/Box'

export const PageContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>{children}</Box>
)
