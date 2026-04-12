'use client'
import React from 'react'
import { Box, Typography } from '@mui/material'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const pathNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'products': 'Productos',
  'list': 'Lista',
  'categories': 'Categorias',
  'pricing': 'Precios',
  'sources': 'Fuentes',
  'suppliers': 'Proveedores',
  'import': 'Importar',
  'search': 'Buscar',
  'enrichment': 'IA',
  'config': 'Configuracion',
  'templates': 'Templates',
  'publish': 'Publicar',
  'channels': 'Canales',
  'wordpress': 'WordPress',
  'logs': 'Registros',
  'admin': 'Admin',
  'company': 'Empresa',
  'filial': 'Filial',
  'user': 'Usuarios',
  'type-user': 'Roles',
  'page-type-user': 'Permisos',
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null // Don't show for root/dashboard

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, px: 1 }}>
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <Home size={14} color="#0071e3" />
      </Link>
      {segments.slice(1).map((seg, i) => {
        const path = '/' + segments.slice(0, i + 2).join('/')
        const label = pathNames[seg] || seg
        const isLast = i === segments.length - 2

        return (
          <React.Fragment key={path}>
            <ChevronRight size={12} color="#9ca3af" />
            {isLast ? (
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.primary' }}>{label}</Typography>
            ) : (
              <Link href={path} style={{ textDecoration: 'none' }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', '&:hover': { color: '#0071e3' } }}>{label}</Typography>
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </Box>
  )
}
