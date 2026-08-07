# PLAN MAESTRO - Plataforma de Dropshipping Automatizado
## Documento Tecnico y Estrategico de Implementacion

**Fecha de creacion:** 2026-04-04
**Estado:** En revision / Pendiente aprobacion
**Autor:** Claude (arquitecto) + Anderson (product owner)

---

## 1. VISION DEL PRODUCTO

### Que es
Una plataforma middleware que actua como **cerebro central** entre fuentes de productos (APIs, scraping, carga manual) y una tienda WordPress/WooCommerce. Permite descubrir productos, enriquecerlos con IA, configurar precios, gestionar imagenes y publicar automaticamente hacia WordPress, con estadisticas de vuelta.

### Propuesta de valor
- **Para el operador**: Automatizar el 80% del trabajo de un negocio de dropshipping (buscar productos, crear fichas, publicar, seguir metricas)
- **Para el negocio**: Reducir de dias a horas el ciclo de "encontrar producto -> publicar en tienda"
- **Escalable**: Arquitectura multi-negocio heredada de HexaQuantum permite operar multiples tiendas/nichos

### Segmento inicial
Ropa para dama y caballero en Colombia.

### Componentes principales

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO ADMINISTRADOR                     │
│                   (Frontend React/Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Productos │ Fuentes │ IA │ Publicar │ Metricas │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴───────┐
                    │   BACKEND    │  (Spring Boot Microservices)
                    │  MIDDLEWARE  │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────┴──────┐  ┌─────┴─────┐  ┌──────┴──────┐
   │  FUENTES    │  │    IA     │  │  WORDPRESS  │
   │  EXTERNAS   │  │ (Claude/  │  │ WooCommerce │
   │ MeLi, Ali,  │  │  OpenAI)  │  │   REST API  │
   │ Trends...   │  │           │  │             │
   └─────────────┘  └───────────┘  └─────────────┘
```

---

## 2. STACK TECNOLOGICO CONFIRMADO

| Capa | Tecnologia | Version | Justificacion |
|------|-----------|---------|---------------|
| Backend core | Java + Spring Boot | 17 / 3.2.0 | Base existente de HexaQuantum, probada |
| Service discovery | Spring Cloud Netflix Eureka | 2023.0.0 | Ya implementado |
| API Gateway | Spring Cloud Gateway | 2023.0.0 | Ya implementado |
| BD principal | PostgreSQL | 14 | Ya configurado |
| Frontend | Next.js + React + MUI | 15 / 18 / 7 | Base existente, stack moderno |
| Ecommerce | WordPress + WooCommerce | Latest | Ecosistema probado, plugins abundantes |
| BD WordPress | MySQL | 8.0 | Estandar de WordPress |
| Contenedores | Docker + Docker Compose | Latest | Ya configurado |
| IA | Claude API / OpenAI API | Latest | Para enriquecimiento de productos |

---

## 3. ANALISIS DE FUENTES DE DATOS Y APIs

### 3.1 Mercado Libre API
- **Viabilidad**: ALTA para Colombia
- **Acceso**: API REST publica, requiere registro en developers.mercadolibre.com.co
- **Gratis**: Si, con rate limits (no publicados oficialmente, ~1 req/seg conservador)
- **Datos disponibles**: Categorias, productos, precios, tendencias de busqueda, vendedores, imagenes
- **Endpoints utiles**:
  - `/sites/MCO/search?q=ropa+mujer` - Busqueda por keyword
  - `/trends/MCO` - Tendencias por pais
  - `/categories/MCO` - Arbol de categorias
  - `/items/{id}` - Detalle de producto con imagenes
  - `/sites/MCO/search?category=MCO1430` - Productos por categoria
- **Limitaciones**: No permite scraping directo (ToS), pero la API es generosa
- **Autenticacion**: OAuth 2.0 para endpoints privados, muchos endpoints son publicos
- **Recomendacion MVP**: **SI** - Primera fuente a implementar. Datos ricos y gratuitos para Colombia.

### 3.2 AliExpress / AliExpress Affiliate API
- **Viabilidad**: MEDIA-ALTA
- **Acceso**: Via aliexpress.com/open, requiere cuenta de afiliado
- **Gratis**: Si (ganas comision por referidos, la API es gratis)
- **Datos disponibles**: Productos, precios, imagenes, especificaciones, shipping info
- **Limitaciones**: 
  - Requiere aprobacion como afiliado
  - Rate limits moderados (~20 req/seg)
  - Precios en USD, hay que convertir
  - Tiempos de envio largos a Colombia (15-45 dias)
- **Recomendacion MVP**: **SI** - Segunda fuente. Ideal para sourcing de producto a bajo costo.

### 3.3 Google Trends
- **Viabilidad**: MEDIA
- **Acceso**: No hay API oficial. Se usan:
  - `pytrends` (Python) - Libreria no oficial
  - Google Trends RSS feeds
  - Scraping controlado de trends.google.com
- **Gratis**: Si, pero inestable (Google puede bloquear)
- **Datos disponibles**: Interes relativo por keyword, keywords relacionadas, interes por region
- **Limitaciones**: 
  - No es una API real, puede romperse
  - Rate limits agresivos si se abusa
  - Datos son "interes relativo" no volumenes reales
- **Recomendacion MVP**: **FASE 2** - Util para validar tendencias pero no critico para MVP.

### 3.4 CJ Dropshipping API (HALLAZGO CLAVE)
- **Viabilidad**: MUY ALTA
- **Acceso**: API REST oficial en developers.cjdropshipping.com, registro gratuito, acceso inmediato
- **Gratis**: 100% - Sin cuota de suscripcion, sin fee por API call. Solo pagas producto + envio al hacer pedido real
- **Datos disponibles**: Catalogo completo, precios mayorista, imagenes, variantes, cotizacion de envio, tracking, stock en tiempo real
- **Ventajas sobre AliExpress**:
  - Envio mas rapido (almacenes en USA, EU, y algunos en Latam)
  - Servicio de branding/private label
  - API mas limpia y orientada especificamente a dropshippers
  - Precios iguales o menores que AliExpress
- **Envio a Colombia**: 7-15 dias desde almacen USA, 15-30 desde China
- **Recomendacion MVP**: **SI** - Fuente critica #2 despues de Mercado Libre. Es un proveedor REAL de dropshipping, no solo datos.

### 3.5 Amazon Product Advertising API
- **DESCARTADA**: Se depreca el 30 de abril de 2026. **NO INVERTIR TIEMPO.**

### 3.6 Shein - Estrategia "Mismas Fabricas"
- **API directa**: NO EXISTE. Marketplace requiere $5M USD facturacion.
- **Estrategia viable**: Usar Shein como REFERENCIA de tendencias, y sourcear via CJ Dropshipping/EPROLO (mismas fabricas chinas).
- **Datafeed afiliados**: Disponible via CJ Affiliate/ShareASale (CSV con productos, precios, imagenes). Sirve para investigacion.
- **NUNCA usar fotos de Shein** directamente (DMCA agresivo). Ver `PUNTOS_CRITICOS_NO_OLVIDAR.md`.
- **Ver**: `investigacion-shein-moda.md` para analisis completo.

### 3.7 EPROLO
- **Viabilidad**: ALTA
- **Acceso**: Plugin nativo WordPress (wordpress.org/plugins/eprolo-dropshipping/)
- **Gratis**: 100% - Sin fees mensuales
- **Datos**: +3,000 estilos nuevos/semana en moda, branding personalizado sin MOQ
- **Recomendacion MVP**: **SI** - Respaldo a CJ Dropshipping.

### 3.8 Importacion desde Archivos Planos
- **Viabilidad**: CRITICA - Solicitada por el usuario
- **Formatos**: CSV, Excel (XLSX), JSON
- **Concepto**: El usuario sube un archivo con productos de CUALQUIER fuente (proveedor local, catalogo de WhatsApp, feria, Excel propio) y el sistema lo importa con mapeo inteligente de campos
- **Ventaja diferenciadora**: Cubre el 100% de los proveedores, incluso los que no tienen API
- **Recomendacion MVP**: **SI** - Va dentro del product-service

### 3.7 APIs de Imagenes Libres de Derechos

| API | Gratis | Rate Limit | Calidad | Busqueda en espanol |
|-----|--------|-----------|---------|-------------------|
| **Unsplash** | Si (50 req/hora) | 50/hora demo, 5000/hora prod | Excelente | Si |
| **Pexels** | Si (200 req/hora) | 200/hora | Muy buena | Si |
| **Pixabay** | Si (100 req/min) | 5000/hora con key | Buena | Si |

- **Recomendacion**: Usar **Pexels** como principal (mejor rate limit gratis) y **Unsplash** como fallback.
- **Estrategia**: Buscar imagenes por keywords del producto, ofrecer al usuario seleccionar entre imagenes del proveedor original e imagenes libres de derechos.

---

## 4. ESTRATEGIA DE IA Y COSTOS

### 4.1 Que puede hacer la IA en el producto

| Caso de uso | Necesita API? | Se puede hacer manual? |
|-------------|--------------|----------------------|
| Mejorar titulos de productos | SI (API) o manual | Si, el usuario edita |
| Generar descripciones comerciales | SI (API) o manual | Si, pero lento |
| Generar bullets/features | SI (API) o manual | Si |
| Sugerir categorias | SI (API) | Parcialmente |
| Optimizar SEO (meta tags) | SI (API) o manual | Si |
| Proponer precios | NO (reglas simples) | Si (formula) |
| Traducir contenido | SI (API) o manual | Si |

### 4.2 Costos reales de APIs de IA

**Claude API (Anthropic) - Precios verificados abril 2026:**
- Haiku 4.5: $1.00/1M input, $5.00/1M output
- Sonnet 4.6: $3.00/1M input, $15.00/1M output
- Optimizaciones: Prompt Caching (90% descuento), Batch API (50% descuento)
- **1,000 descripciones con Haiku: ~$1.70 USD**
- **1,000 descripciones con Sonnet: ~$5.10 USD**

**OpenAI API - Precios verificados abril 2026:**
- GPT-4o-mini: $0.15/1M input, $0.60/1M output
- GPT-4o: $2.50/1M input, $10.00/1M output
- **1,000 descripciones con GPT-4o-mini: ~$0.21 USD** (absurdamente barato)
- **1,000 descripciones con GPT-4o: ~$3.50 USD**

**LLMs Locales (Ollama) - Alternativa sin costo:**
- Modelos recomendados: Qwen 3.5 7B (~4GB RAM), Llama 3.3 8B (~5GB RAM)
- API compatible con formato OpenAI (drop-in replacement)
- Calidad: 70-85% de GPT-4o para texto generativo
- Ventaja: privacidad y no depender de internet
- Realidad: dado que GPT-4o-mini cuesta $0.21/1000 descripciones, el ahorro es minimo

**NOTA IMPORTANTE**: Las suscripciones web de ChatGPT/Claude NO dan acceso API. La API se paga aparte, pero los costos son INSIGNIFICANTES para este volumen.

**Costo mensual estimado de IA (100 productos/dia):**
| Proveedor | Costo/mes | Calidad |
|-----------|-----------|---------|
| GPT-4o-mini | ~$0.63 | Buena |
| Claude Haiku | ~$5.10 | Muy buena |
| Ollama local | $0 | Aceptable |

### 4.3 Estrategia recomendada para el MVP

1. **Fase MVP**: Implementar enriquecimiento **semi-automatico**
   - El usuario importa productos en bruto
   - Puede editar manualmente titulos/descripciones
   - Boton "Mejorar con IA" que llama a la API (Claude Haiku o GPT-4o-mini)
   - El usuario revisa y aprueba antes de publicar
   - Costo estimado: <$5/mes para uso moderado

2. **Fase 2**: Automatizacion completa
   - Enriquecimiento automatico en batch
   - Templates de prompts configurables por categoria
   - A/B testing de descripciones

3. **Alternativa sin costo**: Usar Claude/ChatGPT web manualmente
   - Copiar datos del producto -> pegar en chat -> copiar resultado -> pegar en la app
   - Funciona pero es lento y no escala

### 4.4 Modelo de datos para IA

```
ai_enrichment_config:
  - id
  - idCompany
  - provider (CLAUDE_API, OPENAI_API, MANUAL)
  - apiKey (encriptada)
  - model (haiku-4.5, gpt-4o-mini, etc.)
  - defaultPromptTemplate
  - maxTokens
  - active

ai_enrichment_log:
  - id
  - idProduct
  - inputText
  - outputText
  - provider
  - model
  - tokensUsed
  - costEstimated
  - timestamp
```

---

## 5. INTEGRACION CON WORDPRESS / WOOCOMMERCE

### 5.1 Recomendacion: WooCommerce REST API (NO plugin propio)

**Justificacion:**
- WooCommerce REST API es completa y bien documentada
- Permite crear/actualizar/eliminar: productos, categorias, atributos, variaciones, imagenes, ordenes
- No requiere desarrollar/mantener un plugin PHP
- Seguridad via OAuth 1.0a o API keys
- Funciona con cualquier tema de WordPress

**Lo que se puede hacer via API:**
- Crear productos simples y variables (con tallas, colores)
- Subir imagenes de producto
- Crear/gestionar categorias y etiquetas
- Crear atributos globales (Talla, Color, etc.)
- Leer ordenes y estadisticas de ventas
- Leer reportes (ventas por periodo, top productos, etc.)
- Actualizar stock, precios, descripciones

### 5.2 Endpoints WooCommerce clave

```
POST   /wp-json/wc/v3/products          -> Crear producto
PUT    /wp-json/wc/v3/products/{id}      -> Actualizar producto
GET    /wp-json/wc/v3/products           -> Listar productos
DELETE /wp-json/wc/v3/products/{id}      -> Eliminar producto
POST   /wp-json/wc/v3/products/categories -> Crear categoria
POST   /wp-json/wc/v3/products/attributes -> Crear atributo (Talla, Color)
POST   /wp-json/wc/v3/products/{id}/variations -> Crear variacion
GET    /wp-json/wc/v3/reports/sales      -> Reporte de ventas
GET    /wp-json/wc/v3/reports/top_sellers -> Top productos
GET    /wp-json/wc/v3/orders             -> Ordenes
POST   /wp-json/wc/v3/products/batch     -> Operaciones en batch
```

### 5.3 Flujo de publicacion

```
1. Producto en estado DRAFT en el SaaS
   ↓
2. Usuario revisa: titulo, descripcion, imagenes, precio, categoria
   ↓
3. Click "Publicar a WordPress"
   ↓
4. Backend crea/actualiza en WooCommerce via REST API:
   a. Verifica/crea categorias necesarias
   b. Verifica/crea atributos (Talla, Color)
   c. Sube imagenes
   d. Crea producto con variaciones
   e. Asigna precio, stock, SKU
   ↓
5. WooCommerce devuelve ID del producto
   ↓
6. SaaS guarda mapeo: idProductoLocal <-> idProductoWC
   ↓
7. Producto visible en la tienda WordPress
```

### 5.4 Configuracion WordPress

**Tema:** Seleccionar un tema minimalista compatible con WooCommerce, estetica tipo Apple. Opciones a evaluar juntos al llegar a Fase 2 (depende de presupuesto gratis vs premium). Requisitos: responsive, rapido, limpio, buen soporte de WooCommerce.

**Plugins necesarios:**
1. **WooCommerce** (gratis) - Core de ecommerce
2. **WooCommerce REST API** (incluido en WooCommerce) - Para integracion
3. Plugin de SEO: **Yoast SEO** o **RankMath** (gratis)
4. Plugin de cache: **LiteSpeed Cache** o **WP Super Cache** (gratis)
5. Plugin de imagenes: **Smush** o **ShortPixel** (gratis con limites)

---

## 6. ARQUITECTURA DE MICROSERVICIOS - DETALLE

### 6.1 Servicios existentes (reutilizados de HexaQuantum)

| Servicio | Puerto | Estado | Uso en dropshipping |
|----------|--------|--------|-------------------|
| discovery-service | 8760 | Listo | Service registry |
| gateway-service | 8820 | Listo | API Gateway + CORS |
| auth-service | 8821 | Listo | JWT, usuarios, roles |
| language-service | 8822 | Listo | i18n de mensajes |
| administration-service | 8823 | Listo | Empresas, filiales, config, estilos |
| audit-service | 8827 | Listo | Logs de auditoria |

### 6.2 Servicios NUEVOS a crear

| Servicio | Puerto | Proposito | Prioridad |
|----------|--------|-----------|-----------|
| **product-service** | 8830 | Productos, categorias, atributos, imagenes, precios | MVP - CRITICO |
| **source-service** | 8831 | Conexion con fuentes externas (CJ Dropshipping, MeLi, EPROLO, Shein affiliate feed) | MVP - CRITICO |
| **enrichment-service** | 8832 | Enriquecimiento con IA, busqueda de imagenes libres | MVP - IMPORTANTE |
| **wordpress-service** | 8833 | Publicacion y sincronizacion con WooCommerce | MVP - CRITICO |
| **analytics-service** | 8834 | Metricas, estadisticas, reportes desde WP | POST-MVP |
| **scheduler-service** | 8835 | Tareas programadas (sync, scraping, reportes) | POST-MVP |

### 6.3 Detalle de cada servicio nuevo

#### PRODUCT-SERVICE (Puerto 8830) - El corazon del sistema

**Entidades:**
```
Product:
  - id (UUID)
  - idCompany, idSubsidiary
  - title (titulo original)
  - enrichedTitle (titulo mejorado con IA)
  - description (descripcion original)
  - enrichedDescription (descripcion mejorada)
  - bulletPoints (JSON array)
  - sourceUrl (URL de origen)
  - sourceProvider (MERCADOLIBRE, ALIEXPRESS, CJ_DROPSHIPPING, EPROLO, FILE_IMPORT, MANUAL)
  - sourceProductId (ID en la fuente original)
  - status (DRAFT, REVIEWED, ENRICHED, PUBLISHED, ARCHIVED)
  - basePrice (precio original de la fuente)
  - costPrice (costo real/estimado)
  - sellingPrice (precio de venta calculado)
  - margin (margen de ganancia)
  - currency
  - wpProductId (ID en WooCommerce, null si no publicado)
  - wpStatus (NOT_SYNCED, SYNCED, OUT_OF_SYNC, ERROR)
  - seoTitle, seoDescription, seoKeywords
  - idUser (quien lo importo)
  - active
  - creation, lastUpdate

ProductCategory:
  - id
  - idCompany
  - name
  - parentId (jerarquia)
  - wpCategoryId (mapeo con WooCommerce)
  - active

ProductAttribute:
  - id
  - idCompany
  - name (Talla, Color, Material, etc.)
  - type (SELECT, TEXT, COLOR_SWATCH)
  - wpAttributeId
  - active

ProductAttributeValue:
  - id
  - idAttribute
  - value (S, M, L, XL / Rojo, Azul, Negro)
  - active

ProductVariant:
  - id
  - idProduct
  - sku
  - attributes (JSON: {talla: "M", color: "Negro"})
  - price (puede diferir del producto padre)
  - stock
  - wpVariationId
  - active

ProductImage:
  - id
  - idProduct
  - url (URL original de la fuente)
  - localPath (si se descargo)
  - source (ORIGINAL, PEXELS, UNSPLASH, UPLOADED)
  - isPrimary (imagen principal)
  - altText
  - order (orden de aparicion)
  - active

PricingRule:
  - id
  - idCompany, idSubsidiary
  - name
  - type (PERCENTAGE_MARKUP, FIXED_MARKUP, FORMULA)
  - value (ej: 30 para 30% markup)
  - appliesTo (ALL, CATEGORY, PRICE_RANGE)
  - categoryId (si aplica a categoria especifica)
  - minPrice, maxPrice (si aplica a rango)
  - priority (orden de aplicacion)
  - active
```

Supplier:
  - id
  - idCompany
  - name
  - type (CJ_DROPSHIPPING, EPROLO, ALIEXPRESS, LOCAL, MANUAL)
  - contactInfo (JSON: email, phone, whatsapp, website)
  - country
  - avgShippingDays (promedio basado en historico)
  - avgShippingCost
  - reliabilityScore (1-5)
  - qualityScore (1-5)
  - notes
  - active, creation, lastUpdate

SupplierProduct:
  - id
  - idSupplier
  - idProduct
  - supplierSku
  - supplierPrice, supplierCurrency
  - supplierUrl
  - inStock (boolean)
  - lastPriceCheck

PricingConfig (configuracion global de costos por empresa):
  - id
  - idCompany
  - defaultShippingCost (costo envio estimado)
  - customsRate (% arancel, default 7.5% textiles Colombia)
  - ivaRate (19%)
  - ivaThreshold (50 USD)
  - paymentGatewayFee (3.5%)
  - packagingCost
  - exchangeRateCopUsd (se puede auto-actualizar)
  - defaultMarginPercent

ImportJob:
  - id
  - idCompany, idUser
  - fileName, fileType (CSV, XLSX, JSON)
  - filePath
  - fieldMapping (JSON: {"columna_archivo": "campo_sistema"})
  - status (UPLOADED, MAPPED, VALIDATING, IMPORTING, COMPLETED, FAILED)
  - totalRows, successCount, errorCount, warningCount
  - errors (JSON array detalle por fila)
  - creation

ImportTemplate:
  - id
  - idCompany
  - name (ej: "Formato CJ", "Mi Excel de proveedor")
  - fileType
  - fieldMapping (JSON reutilizable)
  - active

ProductScore:
  - id
  - idProduct
  - overallScore (1-100)
  - demandScore, competitionScore, marginScore, trendScore, supplierScore
  - reasoning (texto IA explicando por que)
  - lastCalculated
```

**Endpoints principales:**
```
POST /ds-api/v2/product/save              -> Crear/actualizar producto
POST /ds-api/v2/product/get/{id}          -> Obtener producto por ID
POST /ds-api/v2/product/all               -> Listar con filtros paginados
POST /ds-api/v2/product/bulk-import       -> Importar multiples productos
POST /ds-api/v2/product/update-status     -> Cambiar estado (DRAFT->REVIEWED->etc.)
POST /ds-api/v2/product/calculate-price   -> Calcular precio segun reglas

POST /ds-api/v2/category/save
POST /ds-api/v2/category/all
POST /ds-api/v2/category/tree             -> Arbol jerarquico

POST /ds-api/v2/attribute/save
POST /ds-api/v2/attribute/all
POST /ds-api/v2/attribute/values/{id}

POST /ds-api/v2/variant/save
POST /ds-api/v2/variant/by-product/{id}

POST /ds-api/v2/image/save
POST /ds-api/v2/image/by-product/{id}
POST /ds-api/v2/image/reorder

POST /ds-api/v2/pricing-rule/save
POST /ds-api/v2/pricing-rule/all
POST /ds-api/v2/pricing-rule/simulate     -> Simular precio con reglas

POST /ds-api/v2/pricing-config/save       -> Config global de costos
POST /ds-api/v2/pricing-config/get
POST /ds-api/v2/pricing/calculate-real-cost -> Calculo REAL (envio+arancel+IVA+comision+margen)

POST /ds-api/v2/supplier/save
POST /ds-api/v2/supplier/all
POST /ds-api/v2/supplier/products/{id}    -> Productos de un proveedor
POST /ds-api/v2/supplier/link-product     -> Vincular proveedor a producto

POST /ds-api/v2/import/upload             -> Subir archivo CSV/Excel/JSON
POST /ds-api/v2/import/detect-columns     -> Detectar columnas automaticamente
POST /ds-api/v2/import/map-fields         -> Guardar mapeo de campos
POST /ds-api/v2/import/preview            -> Preview primeros 10 registros
POST /ds-api/v2/import/validate           -> Validar datos antes de importar
POST /ds-api/v2/import/execute            -> Ejecutar importacion
POST /ds-api/v2/import/jobs/all           -> Historial de importaciones
POST /ds-api/v2/import/template/save      -> Guardar template de mapeo
POST /ds-api/v2/import/template/all       -> Templates guardados
POST /ds-api/v2/import/download-sample    -> Descargar CSV/Excel de ejemplo

POST /ds-api/v2/score/calculate/{id}      -> Calcular score de un producto
POST /ds-api/v2/score/calculate-batch     -> Score de multiples productos
POST /ds-api/v2/score/ranking             -> Ranking de productos por score

POST /ds-api/v2/export/products           -> Exportar productos a CSV/Excel
POST /ds-api/v2/export/pricing-report     -> Reporte de precios y margenes
POST /ds-api/v2/export/catalog-pdf        -> Catalogo en PDF
```

#### SOURCE-SERVICE (Puerto 8831) - Conexion con fuentes

**Entidades:**
```
SourceConfig:
  - id
  - idCompany
  - provider (MERCADOLIBRE, ALIEXPRESS, CJ_DROPSHIPPING, MANUAL)
  - apiKey (encriptada, si aplica)
  - apiSecret (encriptada, si aplica)
  - baseUrl
  - rateLimit (requests por minuto)
  - active
  - lastSyncDate

SourceSearch:
  - id
  - idCompany
  - idSourceConfig
  - query (keyword de busqueda)
  - category (categoria en la fuente)
  - filters (JSON: {priceMin, priceMax, condition, etc.})
  - schedule (MANUAL, DAILY, WEEKLY)
  - lastExecuted
  - resultsCount
  - active

SourceProduct (cache temporal):
  - id
  - idSourceSearch
  - sourceProvider
  - sourceProductId
  - title
  - description
  - price
  - currency
  - imageUrls (JSON array)
  - attributes (JSON)
  - url
  - sellerInfo (JSON)
  - imported (boolean - si ya se convirtio en Product)
  - fetchDate
```

**Endpoints:**
```
POST /ds-api/v2/source/config/save        -> Configurar fuente
POST /ds-api/v2/source/config/all         -> Listar fuentes configuradas
POST /ds-api/v2/source/config/test        -> Testear conexion

POST /ds-api/v2/source/search/save        -> Crear busqueda
POST /ds-api/v2/source/search/execute     -> Ejecutar busqueda ahora
POST /ds-api/v2/source/search/results/{id} -> Ver resultados

POST /ds-api/v2/source/product/all        -> Productos encontrados (cache)
POST /ds-api/v2/source/product/import     -> Importar a product-service
POST /ds-api/v2/source/product/bulk-import -> Importar multiples

POST /ds-api/v2/source/trends             -> Tendencias actuales (MeLi/Google)
```

#### ENRICHMENT-SERVICE (Puerto 8832) - IA y mejora de contenido

**Entidades:**
```
EnrichmentConfig:
  - id
  - idCompany
  - provider (CLAUDE_API, OPENAI_API, MANUAL)
  - apiKey (encriptada)
  - model (claude-haiku-4-5, gpt-4o-mini, etc.)
  - active

PromptTemplate:
  - id
  - idCompany
  - name (ej: "Descripcion ropa mujer", "SEO meta tags")
  - type (TITLE, DESCRIPTION, BULLETS, SEO, CATEGORY_SUGGESTION)
  - promptText (el template con variables: {{title}}, {{category}}, etc.)
  - language (es, en)
  - active

EnrichmentJob:
  - id
  - idProduct
  - type (TITLE, DESCRIPTION, BULLETS, SEO, IMAGES, ALL)
  - status (PENDING, PROCESSING, COMPLETED, FAILED)
  - inputData (JSON)
  - outputData (JSON)
  - provider
  - model
  - tokensUsed
  - costEstimated
  - errorMessage
  - creation

ImageSearchResult:
  - id
  - idProduct
  - query (keyword usado para buscar)
  - provider (PEXELS, UNSPLASH, PIXABAY)
  - imageUrl
  - thumbnailUrl
  - photographer
  - license
  - selected (boolean - si el usuario la eligio)
```

**Endpoints:**
```
POST /ds-api/v2/enrichment/config/save
POST /ds-api/v2/enrichment/config/get

POST /ds-api/v2/enrichment/template/save
POST /ds-api/v2/enrichment/template/all
POST /ds-api/v2/enrichment/template/preview  -> Preview con datos de ejemplo

POST /ds-api/v2/enrichment/enrich            -> Enriquecer 1 producto
POST /ds-api/v2/enrichment/enrich-batch      -> Enriquecer multiples
POST /ds-api/v2/enrichment/enrich-field      -> Enriquecer un campo especifico

POST /ds-api/v2/enrichment/images/search     -> Buscar imagenes libres
POST /ds-api/v2/enrichment/images/select     -> Seleccionar imagen para producto

POST /ds-api/v2/enrichment/jobs/all          -> Historial de enriquecimientos
POST /ds-api/v2/enrichment/stats             -> Estadisticas de uso/costo IA
```

#### WORDPRESS-SERVICE (Puerto 8833) - Sincronizacion con WooCommerce

**Entidades:**
```
WpConnection:
  - id
  - idCompany, idSubsidiary
  - siteUrl (ej: http://wordpress:8085)
  - consumerKey (WooCommerce API key)
  - consumerSecret (encriptada)
  - wpVersion
  - wcVersion
  - status (CONNECTED, DISCONNECTED, ERROR)
  - lastSync
  - active

WpProductMapping:
  - id
  - idProduct (nuestro ID)
  - wpProductId (ID en WooCommerce)
  - wpPermalink
  - lastSyncDate
  - syncStatus (SYNCED, OUT_OF_SYNC, ERROR)
  - syncDirection (TO_WP, FROM_WP)

WpCategoryMapping:
  - id
  - idCategory (nuestro ID)
  - wpCategoryId

WpSyncLog:
  - id
  - idConnection
  - action (CREATE, UPDATE, DELETE, SYNC_STATS)
  - entityType (PRODUCT, CATEGORY, IMAGE, ORDER)
  - entityId
  - status (SUCCESS, FAILED)
  - requestPayload (JSON)
  - responsePayload (JSON)
  - errorMessage
  - timestamp
```

**Endpoints:**
```
POST /ds-api/v2/wp/connection/save         -> Configurar conexion WP
POST /ds-api/v2/wp/connection/test         -> Testear conexion
POST /ds-api/v2/wp/connection/status       -> Estado de la conexion

POST /ds-api/v2/wp/publish                 -> Publicar producto a WP
POST /ds-api/v2/wp/publish-batch           -> Publicar multiples
POST /ds-api/v2/wp/update/{id}             -> Actualizar producto en WP
POST /ds-api/v2/wp/unpublish/{id}          -> Despublicar

POST /ds-api/v2/wp/sync/categories         -> Sincronizar categorias
POST /ds-api/v2/wp/sync/attributes         -> Sincronizar atributos
POST /ds-api/v2/wp/sync/products           -> Sync completo de productos
POST /ds-api/v2/wp/sync/status             -> Estado de sincronizacion

POST /ds-api/v2/wp/stats/sales             -> Ventas desde WooCommerce
POST /ds-api/v2/wp/stats/top-products      -> Productos mas vendidos
POST /ds-api/v2/wp/stats/orders            -> Ordenes recientes
POST /ds-api/v2/wp/stats/revenue           -> Ingresos por periodo
POST /ds-api/v2/wp/stats/overview          -> Dashboard resumen
```

---

## 7. DISENO DEL FRONTEND (Panel de Administracion)

### 7.1 Pantallas del MVP

```
/dashboard                  -> Resumen general (ventas WP, productos, tendencias)
/dashboard/products         -> Lista de productos con filtros y estados
/dashboard/products/new     -> Crear producto manualmente
/dashboard/products/{id}    -> Editar producto (titulo, descripcion, imagenes, precio)
/dashboard/products/{id}/enrich -> Panel de enriquecimiento IA
/dashboard/sources          -> Fuentes configuradas
/dashboard/sources/search   -> Buscar en fuentes externas
/dashboard/sources/results  -> Resultados de busqueda (importar a productos)
/dashboard/pricing          -> Reglas de precios
/dashboard/wordpress        -> Conexion y sync con WordPress
/dashboard/wordpress/stats  -> Estadisticas de la tienda WP
/dashboard/categories       -> Gestion de categorias
/dashboard/admin/users      -> Usuarios (existente)
/dashboard/admin/roles      -> Roles (existente)
/dashboard/admin/company    -> Empresa (existente)
/dashboard/admin/config     -> Configuracion general (existente)
```

### 7.2 Flujo principal del usuario

```
1. DESCUBRIR
   - Buscar en Mercado Libre / AliExpress
   - Ver tendencias
   - Importar productos interesantes
   
2. PREPARAR
   - Revisar productos importados
   - Editar titulos, descripciones
   - Usar IA para mejorar contenido
   - Buscar imagenes libres de derechos
   - Configurar variantes (talla, color)
   
3. PRECIAR
   - Aplicar reglas de precio automaticas
   - Ajustar manualmente si necesario
   - Ver margen estimado
   
4. PUBLICAR
   - Seleccionar productos listos
   - Publicar a WordPress/WooCommerce
   - Verificar en la tienda
   
5. MONITOREAR
   - Ver estadisticas de ventas
   - Identificar top productos
   - Optimizar precios y contenido
```

---

## 8. TAXONOMIA PARA ROPA (Segmento Inicial)

### 8.1 Categorias base

```
Ropa
├── Mujer
│   ├── Vestidos
│   ├── Blusas y Camisas
│   ├── Pantalones
│   ├── Faldas
│   ├── Jeans
│   ├── Chaquetas y Abrigos
│   ├── Ropa deportiva
│   ├── Ropa interior
│   ├── Pijamas
│   └── Accesorios
├── Hombre
│   ├── Camisas
│   ├── Camisetas
│   ├── Pantalones
│   ├── Jeans
│   ├── Chaquetas y Abrigos
│   ├── Ropa deportiva
│   ├── Ropa interior
│   ├── Pijamas
│   └── Accesorios
└── Unisex
    ├── Sudaderas
    ├── Deportivo
    └── Accesorios
```

### 8.2 Atributos globales

| Atributo | Tipo | Valores |
|----------|------|---------|
| Talla | SELECT | XS, S, M, L, XL, XXL, XXXL |
| Color | COLOR_SWATCH | Negro, Blanco, Rojo, Azul, Verde, Rosa, Gris, Beige, etc. |
| Material | SELECT | Algodon, Poliester, Lino, Seda, Mezcla, etc. |
| Genero | SELECT | Mujer, Hombre, Unisex |
| Temporada | SELECT | Primavera/Verano, Otono/Invierno, Todo el ano |
| Estilo | SELECT | Casual, Formal, Deportivo, Elegante |

---

## 9. ROADMAP DETALLADO POR FASES

---

### FASE 0: LIMPIEZA FINAL Y RENOMBRADO
**Objetivo**: Proyecto 100% limpio, sin rastros de HexaQuantum
**Duracion estimada**: 1-2 sesiones
**Dependencia**: Nombre del proyecto definido

**Tareas:**
- [ ] Definir nombre del proyecto/marca
- [ ] Renombrar paquetes Java: `com.hq.crm.*` -> `com.{nuevo}.*` en 6 servicios
- [ ] Renombrar prefijos de tablas: `hq_*` -> `ds_*` (o nuevo prefijo)
- [ ] Renombrar groupId/artifactId en todos los pom.xml
- [ ] Actualizar nombres de aplicacion en application.properties
- [ ] Renombrar imagenes Docker en todos los compose
- [ ] Actualizar nombres de red Docker
- [ ] Limpiar frontend: renombrar placeholders "Dropshipping Platform" al nombre real
- [ ] Eliminar dependencias FTP/SFTP del administration-service (commons-net, jsch)
- [ ] Eliminar .mvn/wrapper/*.jar de todos los servicios (usamos mvn directo)
- [ ] Compilar todos los servicios: `mvn clean package`
- [ ] Verificar que Docker Compose levanta correctamente

**Criterio de terminado**: `mvn clean package` exitoso en todos los servicios, Docker Compose levanta sin errores, 0 referencias a HexaQuantum/hq/crm en todo el proyecto.

---

### FASE 1: INFRAESTRUCTURA DOCKER COMPLETA
**Objetivo**: Todo el entorno levanta con un solo comando
**Duracion estimada**: 1 sesion

**Tareas:**
- [ ] Verificar docker-compose.yml unificado levanta PostgreSQL + MySQL
- [ ] Verificar WordPress accesible en :8085
- [ ] Verificar phpMyAdmin accesible en :8081
- [ ] Instalar WooCommerce en WordPress
- [ ] Configurar tema minimalista en WordPress
- [ ] Verificar Eureka en :8760
- [ ] Verificar Gateway en :8820
- [ ] Verificar auth-service responde en :8821
- [ ] Verificar frontend en :3000
- [ ] Documentar proceso de primer levantamiento

**Criterio de terminado**: `docker-compose up --build -d` levanta todo, WordPress con WooCommerce instalado, login funcional en frontend y WordPress admin.

**Riesgos**: Conflictos de puertos, memoria insuficiente para todos los contenedores simultaneos.

---

### FASE 2: WORDPRESS ECOMMERCE BASE
**Objetivo**: Tienda WordPress funcional con estetica premium
**Duracion estimada**: 2-3 sesiones

**Tareas:**
- [ ] Seleccionar e instalar tema minimalista (estetica tipo Apple)
- [ ] Configurar WooCommerce: moneda COP, zona Colombia, impuestos
- [ ] Crear categorias base de ropa (arbol del punto 8.1)
- [ ] Crear atributos globales (Talla, Color, Material, Genero)
- [ ] Crear 3-5 productos de ejemplo manualmente
- [ ] Configurar paginas: Inicio, Tienda, Carrito, Checkout, Contacto
- [ ] Instalar plugins: SEO (RankMath), Cache (LiteSpeed), Imagenes (Smush)
- [ ] Generar API keys de WooCommerce para integracion backend
- [ ] Configurar CORS para permitir llamadas desde el backend
- [ ] Verificar API REST funcional: GET /wp-json/wc/v3/products

**Criterio de terminado**: Tienda WordPress con productos de ejemplo, estetica limpia, API keys generadas y probadas desde Postman.

---

### FASE 3: PRODUCT-SERVICE (Backend) - El corazon del sistema
**Objetivo**: Microservicio de productos con importacion flexible, proveedores, y pricing real
**Duracion estimada**: 5-7 sesiones (mas amplio por las mejoras)

**Tareas - Iteracion 3A: Core de productos**
- [ ] Crear modulo `product-service` en el proyecto Maven
- [ ] Implementar entidades core: Product, ProductCategory, ProductAttribute, ProductAttributeValue, ProductVariant, ProductImage
- [ ] Implementar DTOs (input/output/filter)
- [ ] Implementar repositorios con queries custom
- [ ] Implementar servicios con logica de negocio
- [ ] Implementar controllers con endpoints CRUD
- [ ] Registrar en SecurityConfig
- [ ] Agregar al pom.xml padre, docker-compose, init.sql (product_db)
- [ ] Data seeders: categorias ropa + atributos base (Talla, Color, Material, Genero)
- [ ] Compilar y probar con Postman

**Tareas - Iteracion 3B: Importacion desde archivos planos**
- [ ] Implementar entidades: ImportJob, ImportTemplate
- [ ] Endpoint de upload de archivos (CSV, XLSX, JSON)
- [ ] Parser de CSV (Apache Commons CSV)
- [ ] Parser de Excel (Apache POI)
- [ ] Parser de JSON (Jackson)
- [ ] Deteccion automatica de columnas
- [ ] Pantalla de mapeo: columnas del archivo -> campos del sistema
- [ ] Validacion pre-importacion (preview + errores)
- [ ] Ejecucion de importacion batch
- [ ] Templates de mapeo reutilizables
- [ ] Descarga de archivo de ejemplo por formato
- [ ] Probar con archivos reales de proveedores

**Tareas - Iteracion 3C: Proveedores y pricing real**
- [ ] Implementar entidades: Supplier, SupplierProduct, PricingConfig, PricingRule
- [ ] CRUD de proveedores
- [ ] Vinculacion proveedor-producto (mismo producto, multiples proveedores)
- [ ] Calculadora de costo REAL: precio + envio + arancel + IVA + comision + empaque
- [ ] PricingConfig por empresa (tasas de impuesto, envio default, etc.)
- [ ] Simulador de precio (input: costo proveedor → output: desglose completo)
- [ ] Endpoints de exportacion (CSV/Excel de productos, reporte de precios)
- [ ] Probar con escenarios reales colombianos

**Criterio de terminado**: 
- CRUD completo de productos con variantes e imagenes
- Importar un archivo Excel con 20 productos y que se creen correctamente
- Calcular el costo REAL de un producto importado desde CJ a Colombia (con IVA, arancel, envio)
- Vincular 2 proveedores al mismo producto y comparar precios

**Dependencia**: Fase 0 completada.

---

### FASE 4: SOURCE-SERVICE (Fuentes Externas)
**Objetivo**: Conectar con Mercado Libre y permitir importacion de productos
**Duracion estimada**: 3-4 sesiones

**Tareas:**
- [ ] Crear modulo `source-service`
- [ ] Implementar entidades: SourceConfig, SourceSearch, SourceProduct
- [ ] Implementar adapter para Mercado Libre API:
  - [ ] Busqueda por keyword
  - [ ] Busqueda por categoria
  - [ ] Detalle de producto
  - [ ] Tendencias (trends/MCO)
  - [ ] Imagenes del producto
- [ ] Implementar adapter para CJ Dropshipping API:
  - [ ] Busqueda de productos
  - [ ] Detalle con variantes y precios mayorista
  - [ ] Cotizacion de envio a Colombia
  - [ ] Imagenes del producto
- [ ] Implementar cache de resultados (SourceProduct)
- [ ] Implementar mapeo: SourceProduct -> Product (importacion)
- [ ] Implementar controllers y endpoints
- [ ] Manejar rate limiting por fuente
- [ ] Implementar adapter para AliExpress (puede ser posterior al MVP)
- [ ] Compilar y probar con Postman

**Criterio de terminado**: Buscar "vestido mujer" en Mercado Libre desde la API, ver resultados, importar un producto al product-service.

**Dependencia**: Fase 3 completada.

---

### FASE 5: ENRICHMENT-SERVICE (Pipeline de IA + Imagenes + Score)
**Objetivo**: Pipeline completo que enriquece un producto de una sola vez: contenido + imagenes + score
**Duracion estimada**: 3-4 sesiones

**Tareas - Iteracion 5A: Pipeline de contenido IA**
- [ ] Crear modulo `enrichment-service`
- [ ] Implementar entidades: EnrichmentConfig, PromptTemplate, EnrichmentJob, ProductScore
- [ ] Implementar adapter para Claude API (Haiku):
  - [ ] UNA sola llamada genera: titulo + descripcion + bullets + SEO tags + categoria sugerida
  - [ ] Prompt diseñado para output JSON estructurado
- [ ] Implementar adapter para OpenAI (GPT-4o-mini) como alternativa
- [ ] Pipeline completo: producto entra en bruto → sale enriquecido al 100%
- [ ] Templates de prompts configurables por categoria (ropa mujer ≠ ropa hombre)
- [ ] Tracking de tokens y costos por llamada
- [ ] Limite de presupuesto mensual configurable con alerta al 80%

**Tareas - Iteracion 5B: Imagenes**
- [ ] Implementar entidad: ImageSearchResult
- [ ] Adapter Pexels API (primaria: 200 req/hora, sin atribucion obligatoria)
- [ ] Adapter Pixabay API (fallback: 100 req/min)
- [ ] Busqueda inteligente: extraer keywords del titulo para buscar imagenes relevantes
- [ ] Procesamiento basico: resize + compresion WebP (reduce peso de imagenes)
- [ ] Guardar origen de CADA imagen (trazabilidad legal)

**Tareas - Iteracion 5C: Product Intelligence Score**
- [ ] Implementar ProductScore con multiples dimensiones
- [ ] Score de demanda (basado en busquedas MeLi si hay datos)
- [ ] Score de margen (basado en costo real vs precio venta sugerido)
- [ ] Score de proveedor (basado en Supplier.reliabilityScore)
- [ ] Score general ponderado (1-100)
- [ ] Texto IA explicando el razonamiento del score
- [ ] Endpoint de ranking por score (el usuario ve "top productos para vender")

**Criterio de terminado**: 
- Tomar un producto importado en bruto y con UN click obtener: titulo mejorado, descripcion comercial, bullets, SEO tags, 5 imagenes libres sugeridas, y un score de potencial
- Ver el costo acumulado de IA del mes
- Ver ranking de productos ordenados por score

**Dependencia**: Fase 3 (product-service) y Fase 4 (source-service para datos de demanda).

---

### FASE 6: WORDPRESS-SERVICE (Publicacion)
**Objetivo**: Publicar productos desde el SaaS hacia WooCommerce
**Duracion estimada**: 2-3 sesiones

**Tareas:**
- [ ] Crear modulo `wordpress-service`
- [ ] Implementar entidades: WpConnection, WpProductMapping, WpCategoryMapping, WpSyncLog
- [ ] Implementar cliente WooCommerce REST API:
  - [ ] Autenticacion con consumer key/secret
  - [ ] CRUD de productos
  - [ ] Manejo de imagenes (subir desde URL)
  - [ ] CRUD de categorias
  - [ ] CRUD de atributos y variaciones
  - [ ] Lectura de ordenes
  - [ ] Lectura de reportes/stats
- [ ] Implementar flujo de publicacion completo
- [ ] Implementar sincronizacion bidireccional (stats de WP -> SaaS)
- [ ] Implementar batch publishing
- [ ] Implementar logging de sync
- [ ] Compilar y probar

**Criterio de terminado**: Crear un producto en el SaaS, publicarlo a WordPress con un click, verlo en la tienda con imagenes, precio y variaciones.

**Dependencia**: Fase 2 (WordPress configurado) y Fase 3 (product-service).

---

### FASE 7: FRONTEND - MODULOS NUEVOS
**Objetivo**: Panel de administracion completo para el flujo de dropshipping
**Duracion estimada**: 4-6 sesiones

**Tareas:**
- [ ] Modulo Productos:
  - [ ] Lista de productos con filtros, busqueda, paginacion
  - [ ] Formulario de creacion/edicion de producto
  - [ ] Vista de detalle con imagenes, variantes, precio
  - [ ] Cambio de estado (DRAFT -> REVIEWED -> ENRICHED -> PUBLISHED)
  - [ ] Acciones masivas (seleccionar multiples, publicar batch)
- [ ] Modulo Fuentes:
  - [ ] Configuracion de fuentes (MeLi, AliExpress)
  - [ ] Pantalla de busqueda con resultados en grid
  - [ ] Preview de producto de fuente
  - [ ] Boton "Importar" que crea en product-service
  - [ ] Vista de tendencias
- [ ] Modulo Enriquecimiento:
  - [ ] Panel de enriquecimiento por producto
  - [ ] Comparar original vs mejorado lado a lado
  - [ ] Selector de imagenes (originales vs libres de derechos)
  - [ ] Configuracion de templates de prompts
  - [ ] Estadisticas de uso de IA
- [ ] Modulo WordPress:
  - [ ] Pantalla de conexion (configurar URL, API keys)
  - [ ] Estado de sincronizacion
  - [ ] Boton publicar / despublicar
  - [ ] Dashboard de estadisticas WP (ventas, top productos, ordenes)
- [ ] Modulo Precios:
  - [ ] CRUD de reglas de precio
  - [ ] Simulador de precio
  - [ ] Vista de margenes por producto
- [ ] Dashboard principal:
  - [ ] Widgets: productos por estado, ventas del dia/semana/mes
  - [ ] Grafico de tendencias
  - [ ] Ultimos productos publicados
  - [ ] Alertas (productos sin publicar, sync errors)

**Criterio de terminado**: Flujo completo funcional desde el frontend: buscar -> importar -> enriquecer -> preciar -> publicar -> ver estadisticas.

**Dependencia**: Fases 3-6 completadas.

---

### FASE 8: INTEGRACION Y PRUEBAS E2E
**Objetivo**: Todo funciona junto sin errores
**Duracion estimada**: 2-3 sesiones

**Tareas:**
- [ ] Flujo completo E2E: buscar en MeLi -> importar -> enriquecer con IA -> publicar a WP
- [ ] Probar con 20+ productos reales de ropa
- [ ] Verificar imagenes se ven bien en WordPress
- [ ] Verificar precios calculados correctamente
- [ ] Verificar variantes (tallas/colores) en WooCommerce
- [ ] Verificar estadisticas de WP llegan al SaaS
- [ ] Probar multi-usuario (admin + operador)
- [ ] Probar edge cases (imagenes rotas, productos sin precio, API caida)
- [ ] Performance: verificar tiempos de respuesta aceptables
- [ ] Fix bugs encontrados

**Criterio de terminado**: 20 productos publicados exitosamente con flujo completo, sin errores criticos.

---

### FASE 9 (POST-MVP): AUTOMATIZACION Y MEJORAS
**Objetivo**: Hacer el sistema mas autonomo

**Tareas futuras:**
- [ ] Scheduler para busquedas automaticas periodicas
- [ ] Enriquecimiento automatico en batch (sin intervencion manual)
- [ ] Sync automatico de stats de WordPress
- [ ] Notificaciones (producto vendido, sync fallido)
- [ ] Adapter AliExpress completo
- [ ] Adapter CJ Dropshipping
- [ ] Google Trends integration
- [ ] A/B testing de descripciones
- [ ] Exportar productos a CSV/Excel
- [ ] Multi-tienda WordPress (publicar a multiples sitios)
- [ ] App movil (notificaciones de ventas)

---

## 10. CRITERIOS DE MVP

### TIER 1 - MVP CORE (sin esto no hay producto)
- [x] Backend base (auth, admin, audit, language) - YA EXISTE
- [ ] Product-service con importacion dual (APIs + archivos planos CSV/Excel/JSON)
- [ ] Gestion de proveedores (Supplier, SupplierProduct)
- [ ] Calculadora de costo REAL (no solo markup - incluye envio, IVA, arancel, comision)
- [ ] Source-service con CJ Dropshipping + Mercado Libre
- [ ] Enrichment-service con pipeline completo (1 llamada IA = titulo+desc+bullets+SEO)
- [ ] Busqueda de imagenes libres (Pexels + Pixabay)
- [ ] WordPress-service para publicacion a WooCommerce
- [ ] Frontend con flujo completo: descubrir → importar → enriquecer → preciar → publicar
- [ ] WordPress con WooCommerce + tema minimalista
- [ ] Docker Compose funcional

### TIER 2 - MVP POTENTE (esto lo diferencia de la competencia)
- [ ] Product Intelligence Score (ranking de productos por potencial)
- [ ] Deteccion de duplicados al importar
- [ ] Procesamiento de imagenes (resize, compresion WebP)
- [ ] Notificaciones in-app (venta, sync fallo, presupuesto IA, precio cambio)
- [ ] Templates de importacion reutilizables
- [ ] Exportacion a CSV/Excel/PDF

### TIER 3 - POST-MVP (esto lo escala)
- [ ] AliExpress adapter
- [ ] EPROLO adapter
- [ ] Google Trends integration
- [ ] Tareas programadas automaticas (scheduler)
- [ ] Multi-canal (publicar a MeLi, Shopify, no solo WooCommerce)
- [ ] Analytics-service avanzado
- [ ] Watermark / background removal de imagenes
- [ ] A/B testing de contenido
- [ ] Social media auto-post
- [ ] Multi-tienda WordPress

### NO PRIORITARIO
- [ ] App movil
- [ ] Gestion de envios/logistica propia
- [ ] Chat con clientes
- [ ] Pasarela de pago (se configura directo en WooCommerce)

---

## 11. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|-----------|
| API de Mercado Libre cambia | Media | Alto | Abstraer con adapter pattern, facil de reemplazar |
| Costos de IA superan lo esperado | Baja | Medio | Usar modelos baratos (Haiku/mini), tracking de costos, limites configurables |
| WordPress performance con muchos productos | Media | Medio | Cache agresivo, CDN para imagenes, lazy loading |
| Rate limiting de APIs | Media | Medio | Cola de requests, retry con backoff, cache agresivo |
| Imagenes con copyright | Alta | Alto | Solo usar APIs de imagenes libres (Pexels/Unsplash), validar licencias |
| Complejidad del renombrado Java | Baja | Medio | Hacerlo con scripts, verificar compilacion |
| Docker consume mucha RAM | Media | Medio | Usar compose por etapas, no levantar todo siempre |

---

## 12. ESTRUCTURA FINAL DE CARPETAS

```
dropshipping/
├── .gitignore
├── CLAUDE.md
├── docker-compose.yml              # Todo unificado
├── docker-compose.infra.yml        # Solo infra
├── docker-compose.wp.yml           # Solo WordPress
├── docker-compose.services.yml     # Solo microservicios
├── docker-compose.frontend.yml     # Solo frontend
│
├── seguimiento/
│   ├── prompt_dropshipping_wordpress_saas.md  # Vision original
│   └── PLAN_MAESTRO_DROPSHIPPING.md           # Este archivo
│
├── wordpress/
│   ├── wp-content/                 # Persistente (plugins, temas, uploads)
│   ├── db-data/                    # MySQL data (gitignored)
│   └── config/
│       └── uploads.ini             # Config PHP
│
├── backend/
│   ├── .env
│   ├── pom.xml                     # POM padre
│   ├── init-db/init.sql
│   │
│   ├── discovery-service/          # :8760 - Eureka
│   ├── gateway-service/            # :8820 - API Gateway
│   ├── auth-service/               # :8821 - Autenticacion
│   ├── language-service/           # :8822 - i18n
│   ├── administration-service/     # :8823 - Admin empresarial
│   ├── audit-service/              # :8827 - Auditoria
│   │
│   ├── product-service/            # :8830 - NUEVO: Productos, categorias, precios
│   ├── source-service/             # :8831 - NUEVO: Fuentes externas (MeLi, Ali)
│   ├── enrichment-service/         # :8832 - NUEVO: IA + imagenes libres
│   └── wordpress-service/          # :8833 - NUEVO: Sync con WooCommerce
│
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       │   ├── dashboard/
│       │   │   ├── admin/          # Existente (usuarios, roles, empresa)
│       │   │   ├── products/       # NUEVO
│       │   │   ├── sources/        # NUEVO
│       │   │   ├── enrichment/     # NUEVO
│       │   │   ├── wordpress/      # NUEVO
│       │   │   ├── pricing/        # NUEVO
│       │   │   └── page.tsx        # Dashboard principal
│       │   └── users/              # Login, reset password
│       ├── core/
│       │   ├── api/
│       │   │   ├── admin/          # Existente
│       │   │   ├── auth/           # Existente
│       │   │   ├── products/       # NUEVO
│       │   │   ├── sources/        # NUEVO
│       │   │   ├── enrichment/     # NUEVO
│       │   │   └── wordpress/      # NUEVO
│       │   ├── components/         # Atoms, molecules, organisms
│       │   ├── hooks/
│       │   ├── interfaces/
│       │   ├── states/
│       │   └── utils/
│       ├── layouts/
│       └── theme/
│
└── collection/                     # Colecciones Postman (cuando se creen)
```

---

## 13. SIGUIENTE ACCION CONCRETA

**Cuando el usuario defina el nombre del proyecto:**

1. Ejecutar FASE 0 (renombrado completo)
2. Compilar y verificar todo
3. Inicializar repositorio Git propio
4. Primer commit limpio
5. Empezar FASE 1 (Docker) y FASE 2 (WordPress) en paralelo
6. Luego FASE 3 (product-service) que es el corazon del sistema

---

---

## 14. COSTOS OPERATIVOS TOTALES ESTIMADOS

| Componente | Fase MVP ($) | Con revenue ($) |
|-----------|-------------|-----------------|
| APIs datos (MeLi, CJ, imagenes) | $0 | $0 |
| IA descripciones (GPT-4o-mini) | $0.50-2 | $2-5 |
| Hosting (cuando se despliegue) | $5-10 | $15-30 |
| Plugins WP pagos | $0 | $0-20 |
| **TOTAL MENSUAL** | **$5-12** | **$17-55** |

**Durante desarrollo local con Docker: $0** (todo corre en tu PC)

---

## 15. DOCUMENTOS COMPLEMENTARIOS

| Documento | Contenido |
|-----------|-----------|
| `seguimiento/investigacion-apis-fuentes-datos.md` | Investigacion detallada de 16 APIs/fuentes con precios, links y evaluaciones |
| `seguimiento/investigacion-shein-moda.md` | Analisis exhaustivo de opciones Shein, proveedores alternativos (CJ, EPROLO), estrategia "mismas fabricas" |
| `seguimiento/PUNTOS_CRITICOS_NO_OLVIDAR.md` | **LECTURA OBLIGATORIA** - Proteccion legal, anti-baneo, impuestos Colombia, errores a evitar, checklist pre-lanzamiento |
| `seguimiento/ANALISIS_REVISION_PLAN_V2.md` | Revision profunda: gaps encontrados, features nuevas, justificacion de cada mejora |
| `seguimiento/ENTIDADES_SIMPLIFICADAS_V2.md` | Entidades simplificadas con max 8 campos por formulario, multi-canal desde dia 1 |
| `seguimiento/investigacion-herramientas-dropshipping.md` | 8 herramientas analizadas + APIs Meta/MeLi + lecciones + pricing sugerido |
| `seguimiento/PROPUESTA_ARQUITECTURA_2_SERVICIOS.md` | **PENDIENTE APROBACION** - Arquitectura de 2 servicios core (Acquisition + Commerce) vendibles por separado |

---

*Este plan es un documento vivo. Se actualizara segun avance el desarrollo y las decisiones que se tomen.*
