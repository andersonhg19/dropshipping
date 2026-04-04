module.exports = {
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  printWidth: 120,
  semi: false,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^react$', // Prioriza React como la primera importación
    '^next$', // Next.js importaciones
    '<THIRD_PARTY_MODULES>', // Importaciones de módulos externos
    '^@app/(.*)$',
    '^@core/(.*)$',
    '^@components/(.*)$',
    '^@styles/(.*)$',
    '^@utils/(.*)$',
    '^@hooks/(.*)$',
    '^@config/(.*)$',
    '^@api/(.*)$',
    '^@interfaces/(.*)$',
    '^@layouts/(.*)$',
    '^@theme/(.*)$',
    '^@public/(.*)$',
    '^[./]', // Importaciones relativas
  ],
  importOrderSeparation: true, // Agrega líneas en blanco entre grupos de importaciones
  importOrderSortSpecifiers: true, // Ordena los especificadores dentro de las importaciones
}