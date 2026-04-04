# PROPUESTA: Arquitectura de 2 Servicios Core Independientes

**Fecha:** 2026-04-04
**Estado:** Propuesta para aprobacion

---

## LA IDEA

Dividir la logica de negocio en **2 microservicios core independientes** que se comunican mediante un **formato estandarizado** (el "contrato" - archivo plano JSON/CSV):

```
┌────────────────────────────────────┐     CONTRATO      ┌────────────────────────────────────┐
│                                    │  (JSON/CSV/API)    │                                    │
│     ACQUISITION SERVICE            │ =================> │     COMMERCE SERVICE                │
│     "El que busca y arma"          │                    │     "El que vende y publica"        │
│                                    │                    │                                    │
│  - Conecta con APIs (CJ, MeLi)    │                    │  - Recibe productos normalizados   │
│  - Importa archivos planos        │                    │  - Enriquece con IA                │
│  - Gestiona proveedores           │                    │  - Procesa imagenes                │
│  - Analiza tendencias             │                    │  - Calcula precios reales          │
│  - Normaliza datos                │                    │  - Publica a WordPress             │
│  - Calcula scores                 │                    │  - Gestiona promociones            │
│  - Detecta duplicados             │                    │  - Recibe stats de la tienda       │
│  - Exporta formato estandar       │                    │  - Notificaciones                  │
│                                    │                    │  - Exporta reportes                │
│  BD: acquisition_db                │                    │  BD: commerce_db                   │
│  Puerto: 8830                      │                    │  Puerto: 8831                      │
└────────────────────────────────────┘                    └────────────────────────────────────┘
```

---

## POR QUE ESTO ES BRILLANTE

### 1. Cada servicio se vende SOLO

**Acquisition Service solo:**
- Un usuario que ya tiene tienda montada (Shopify, WooCommerce manual, MeLi) compra SOLO el servicio de busqueda y armado
- Recibe un CSV/JSON listo con productos normalizados, precios de proveedor, imagenes, tendencias
- Lo importa a SU tienda como quiera

**Commerce Service solo:**
- Un usuario que ya tiene su proveedor (proveedor local, fabrica propia, importador) compra SOLO el servicio de publicacion
- Sube su CSV/Excel con productos → el sistema enriquece, precia, publica a WordPress
- No necesita las APIs de busqueda

**Ambos juntos:**
- La plataforma completa: buscar → armar → enriquecer → publicar → monitorear

### 2. El contrato (archivo plano) es la clave

El formato estandarizado es lo que hace DESACOPLADOS a los dos servicios:

```json
{
  "formatVersion": "1.0",
  "exportDate": "2026-04-04T10:30:00",
  "source": "acquisition-service",
  "products": [
    {
      "externalId": "CJ-889234",
      "source": "CJ_DROPSHIPPING",
      "sourceUrl": "https://cjdropshipping.com/product/889234",
      "title": "Vestido negro elegante manga larga cuello V",
      "description": "Vestido de mujer en tela suave...",
      "images": [
        {
          "url": "https://img.cjdropshipping.com/889234-1.jpg",
          "isPrimary": true
        },
        {
          "url": "https://img.cjdropshipping.com/889234-2.jpg",
          "isPrimary": false
        }
      ],
      "basePrice": 12.50,
      "currency": "USD",
      "category": {
        "level1": "Ropa",
        "level2": "Mujer",
        "level3": "Vestidos"
      },
      "attributes": {
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Negro", "Rojo", "Azul marino"],
        "material": "65% Poliester, 35% Algodon",
        "gender": "Mujer",
        "style": "Elegante",
        "season": "Todo el ano"
      },
      "variants": [
        {
          "sku": "CJ-889234-S-NEG",
          "size": "S",
          "color": "Negro",
          "price": 12.50,
          "stock": 150
        },
        {
          "sku": "CJ-889234-M-NEG",
          "size": "M",
          "color": "Negro",
          "price": 12.50,
          "stock": 200
        }
      ],
      "supplier": {
        "name": "CJ Dropshipping",
        "id": "CJ",
        "country": "CN",
        "shippingToCol": {
          "estimatedDays": 10,
          "cost": 8.00,
          "method": "CJ Packet"
        },
        "reliabilityScore": 4.2
      },
      "intelligence": {
        "score": 78,
        "demandScore": 85,
        "competitionScore": 60,
        "marginScore": 80,
        "reasoning": "Alta demanda en MeLi Colombia, margen potencial del 45%, competencia moderada"
      },
      "tags": ["vestido", "elegante", "mujer", "fiesta", "manga larga"]
    }
  ]
}
```

**Cualquiera puede generar este formato:**
- El acquisition-service lo genera automaticamente desde APIs
- Un humano puede armarlo en Excel y subirlo al commerce-service
- Un script Python puede generarlo desde cualquier fuente
- Otro sistema/ERP puede exportarlo

---

## DETALLE DE CADA SERVICIO

### ACQUISITION SERVICE (Puerto 8830) - "El que busca y arma"

**Responsabilidades:**
- Conectar con fuentes externas (CJ Dropshipping, MeLi, EPROLO, AliExpress)
- Importar desde archivos planos (CSV, Excel, JSON) de cualquier proveedor
- Gestionar proveedores (Supplier CRUD, scores, historico)
- Normalizar datos de diferentes fuentes al formato estandar
- Detectar tendencias (MeLi trends, Google Trends futuro)
- Calcular Product Intelligence Score
- Detectar duplicados entre fuentes
- Cachear productos encontrados (SourceProduct)
- Exportar en formato estandar (JSON/CSV) para el commerce-service o para uso externo

**Entidades:**
```
SourceConfig           -> Configuracion de cada fuente (API keys, rate limits)
SourceSearch           -> Busquedas guardadas (keywords, filtros, schedule)
SourceProduct          -> Cache de productos encontrados en fuentes
Supplier               -> Proveedores (CJ, EPROLO, locales, manuales)
SupplierProduct        -> Vinculo proveedor-producto con precio/stock
ImportJob              -> Trabajos de importacion desde archivos
ImportTemplate         -> Templates de mapeo de campos reutilizables
ProductScore           -> Score de inteligencia por producto
DuplicateCheck         -> Deteccion de duplicados entre fuentes
ExportJob              -> Historial de exportaciones generadas
```

**Endpoints:**
```
# Fuentes externas
POST /ds-api/v2/source/config/save
POST /ds-api/v2/source/config/all
POST /ds-api/v2/source/config/test
POST /ds-api/v2/source/search/save
POST /ds-api/v2/source/search/execute
POST /ds-api/v2/source/search/results/{id}
POST /ds-api/v2/source/trends

# Proveedores
POST /ds-api/v2/supplier/save
POST /ds-api/v2/supplier/all
POST /ds-api/v2/supplier/get/{id}
POST /ds-api/v2/supplier/products/{id}
POST /ds-api/v2/supplier/link-product
POST /ds-api/v2/supplier/compare-prices/{productId}

# Importacion de archivos
POST /ds-api/v2/import/upload
POST /ds-api/v2/import/detect-columns
POST /ds-api/v2/import/map-fields
POST /ds-api/v2/import/preview
POST /ds-api/v2/import/validate
POST /ds-api/v2/import/execute
POST /ds-api/v2/import/template/save
POST /ds-api/v2/import/template/all
POST /ds-api/v2/import/download-sample

# Productos normalizados (cache interno)
POST /ds-api/v2/acquisition/products/all
POST /ds-api/v2/acquisition/products/get/{id}
POST /ds-api/v2/acquisition/products/search

# Score e inteligencia
POST /ds-api/v2/score/calculate/{id}
POST /ds-api/v2/score/calculate-batch
POST /ds-api/v2/score/ranking

# Duplicados
POST /ds-api/v2/duplicates/check/{id}
POST /ds-api/v2/duplicates/resolve

# Exportacion (genera el formato estandar)
POST /ds-api/v2/export/standard-format      -> JSON estandar para commerce-service
POST /ds-api/v2/export/csv                   -> CSV para uso externo
POST /ds-api/v2/export/excel                 -> Excel para uso externo
POST /ds-api/v2/export/selected              -> Exportar solo productos seleccionados

# Enviar directo al commerce-service (comunicacion interna)
POST /ds-api/v2/acquisition/send-to-commerce -> Envia productos seleccionados via API interna
```

**Base de datos:** `acquisition_db`

---

### COMMERCE SERVICE (Puerto 8831) - "El que vende y publica"

**Responsabilidades:**
- Recibir productos desde el acquisition-service (via API o archivo plano)
- Recibir productos desde archivos planos subidos manualmente (el usuario NO necesita el acquisition-service)
- Gestionar catalogo interno (productos, categorias, atributos, variantes, imagenes)
- Enriquecer con IA (pipeline completo: titulo + desc + bullets + SEO)
- Procesar imagenes (resize, compresion, watermark futuro)
- Calcular precio REAL (costo + envio + IVA + arancel + comision + margen)
- Gestionar reglas de precios y promociones
- Publicar a WordPress/WooCommerce
- Recibir estadisticas de la tienda (ventas, top productos, ordenes)
- Notificaciones (venta, sync fallo, presupuesto IA)
- Exportar reportes (precios, margenes, catalogo PDF)

**Entidades:**
```
# Catalogo
Product                -> Producto interno (con estado: DRAFT→ENRICHED→PUBLISHED)
ProductCategory        -> Categorias con jerarquia
ProductAttribute       -> Atributos globales (Talla, Color, Material)
ProductAttributeValue  -> Valores de atributos
ProductVariant         -> Variaciones (SKU, precio por variante, stock)
ProductImage           -> Imagenes con origen trackeado

# Enriquecimiento
EnrichmentConfig       -> Config de IA (provider, API key, modelo, presupuesto)
PromptTemplate         -> Templates de prompts por categoria
EnrichmentJob          -> Historial de enriquecimientos (tokens, costo)
ImageSearchResult      -> Imagenes libres encontradas (Pexels, Pixabay)

# Pricing
PricingConfig          -> Config global de costos (IVA, arancel, envio, comision)
PricingRule            -> Reglas de precio (markup, formula, por categoria)
Promotion              -> Promociones (% descuento, 2x1, temporada, fecha inicio/fin)

# WordPress
WpConnection           -> Conexion con WooCommerce (URL, API keys)
WpProductMapping       -> Mapeo producto local ↔ WooCommerce
WpCategoryMapping      -> Mapeo categorias
WpSyncLog              -> Log de sincronizaciones

# Notificaciones
Notification           -> Notificaciones del sistema
NotificationConfig     -> Configuracion de alertas por usuario

# Importacion directa (sin acquisition-service)
CommerceImportJob      -> Importacion directa de archivos al commerce
```

**Endpoints:**
```
# Recepcion de productos (desde acquisition o archivo directo)
POST /ds-api/v2/commerce/receive             -> Recibe JSON formato estandar (desde acquisition)
POST /ds-api/v2/commerce/upload              -> Upload directo de CSV/Excel/JSON
POST /ds-api/v2/commerce/upload/map-fields   -> Mapeo de campos para upload directo
POST /ds-api/v2/commerce/upload/execute      -> Ejecutar importacion directa

# Catalogo
POST /ds-api/v2/product/save
POST /ds-api/v2/product/get/{id}
POST /ds-api/v2/product/all
POST /ds-api/v2/product/update-status
POST /ds-api/v2/product/bulk-update

POST /ds-api/v2/category/save
POST /ds-api/v2/category/all
POST /ds-api/v2/category/tree

POST /ds-api/v2/attribute/save
POST /ds-api/v2/attribute/all

POST /ds-api/v2/variant/save
POST /ds-api/v2/variant/by-product/{id}

POST /ds-api/v2/image/save
POST /ds-api/v2/image/by-product/{id}
POST /ds-api/v2/image/process               -> Resize + compresion
POST /ds-api/v2/image/search-free            -> Buscar en Pexels/Pixabay

# Enriquecimiento IA
POST /ds-api/v2/enrichment/config/save
POST /ds-api/v2/enrichment/template/save
POST /ds-api/v2/enrichment/template/all
POST /ds-api/v2/enrichment/enrich            -> Pipeline completo 1 producto
POST /ds-api/v2/enrichment/enrich-batch      -> Pipeline batch
POST /ds-api/v2/enrichment/enrich-field      -> Solo un campo especifico
POST /ds-api/v2/enrichment/stats             -> Uso y costo acumulado de IA

# Pricing
POST /ds-api/v2/pricing/config/save          -> Config global (IVA, arancel, etc.)
POST /ds-api/v2/pricing/config/get
POST /ds-api/v2/pricing/rule/save
POST /ds-api/v2/pricing/rule/all
POST /ds-api/v2/pricing/calculate-real-cost   -> Desglose completo de costo
POST /ds-api/v2/pricing/simulate              -> Simular precio de venta

# Promociones
POST /ds-api/v2/promotion/save
POST /ds-api/v2/promotion/all
POST /ds-api/v2/promotion/active              -> Promociones vigentes
POST /ds-api/v2/promotion/apply/{productId}   -> Aplicar promocion a producto

# WordPress
POST /ds-api/v2/wp/connection/save
POST /ds-api/v2/wp/connection/test
POST /ds-api/v2/wp/publish
POST /ds-api/v2/wp/publish-batch
POST /ds-api/v2/wp/update/{id}
POST /ds-api/v2/wp/unpublish/{id}
POST /ds-api/v2/wp/sync/categories
POST /ds-api/v2/wp/sync/attributes
POST /ds-api/v2/wp/sync/status
POST /ds-api/v2/wp/stats/overview
POST /ds-api/v2/wp/stats/sales
POST /ds-api/v2/wp/stats/top-products
POST /ds-api/v2/wp/stats/orders

# Notificaciones
POST /ds-api/v2/notification/all
POST /ds-api/v2/notification/mark-read
POST /ds-api/v2/notification/config/save

# Exportacion
POST /ds-api/v2/export/products-csv
POST /ds-api/v2/export/products-excel
POST /ds-api/v2/export/pricing-report
POST /ds-api/v2/export/catalog-pdf
```

**Base de datos:** `commerce_db`

---

## COMO SE COMUNICAN

### Opcion A: Via archivo plano (desacoplado total)
```
Acquisition genera JSON → Usuario descarga → Sube al Commerce
```
- Maximo desacoplamiento
- Funciona incluso si los servicios estan en servidores diferentes
- El usuario tiene control total de que productos pasan

### Opcion B: Via API interna (automatizado)
```
Acquisition llama a Commerce via Feign/REST → productos llegan directo
```
- Mas rapido, menos friccion
- El usuario selecciona productos en el frontend del Acquisition y con un click llegan al Commerce
- Requiere que ambos servicios esten en la misma red

### Opcion C: Hibrido (RECOMENDADO)
```
- Boton "Enviar a Commerce" en el frontend → llama API interna (opcion B)
- Boton "Exportar" → descarga JSON/CSV para uso externo (opcion A)
- En Commerce: "Importar" → acepta archivo plano de CUALQUIER fuente
```

**Asi cubres TODOS los escenarios:**
- Uso integrado (ambos servicios juntos)
- Solo Acquisition (exporta para otra tienda)
- Solo Commerce (importa desde cualquier archivo)

---

## FLUJOS DE USUARIO

### Flujo 1: Plataforma completa (Acquisition + Commerce)
```
1. [Acquisition] Buscar "vestido mujer" en CJ Dropshipping
2. [Acquisition] Ver resultados con scores de inteligencia
3. [Acquisition] Seleccionar 10 productos interesantes
4. [Acquisition] Click "Enviar a Commerce" →
5. [Commerce] Productos llegan en estado DRAFT
6. [Commerce] Click "Enriquecer con IA" → pipeline genera todo
7. [Commerce] Revisar y ajustar (titulo, fotos, descripcion)
8. [Commerce] Configurar precio (calculadora de costo real)
9. [Commerce] Click "Publicar a WordPress" →
10. [WordPress] Producto visible en la tienda
11. [Commerce] Ver estadisticas de ventas
```

### Flujo 2: Solo Commerce (proveedor local, sin APIs)
```
1. [Commerce] Upload de Excel del proveedor local
2. [Commerce] Mapear columnas → campos del sistema
3. [Commerce] Importar productos como DRAFT
4. [Commerce] Enriquecer con IA
5. [Commerce] Configurar precios
6. [Commerce] Publicar a WordPress
```

### Flujo 3: Solo Acquisition (ya tiene tienda)
```
1. [Acquisition] Buscar productos en multiples fuentes
2. [Acquisition] Analizar scores y tendencias
3. [Acquisition] Seleccionar los mejores
4. [Acquisition] Exportar CSV/JSON
5. [Su tienda] Importar el archivo en Shopify/WooCommerce/MeLi manual
```

---

## MODELO DE NEGOCIO POTENCIAL

| Producto | Que incluye | A quien le sirve | Precio potencial |
|----------|-------------|-------------------|-----------------|
| **Acquisition solo** | Busqueda de productos, tendencias, scores, proveedores, exportacion | Cualquier dropshipper que ya tiene tienda | $15-30/mes |
| **Commerce solo** | Importacion, IA, pricing, publicacion WP, stats | Cualquier vendedor con proveedor propio | $20-40/mes |
| **Plataforma completa** | Acquisition + Commerce integrados | Dropshippers que quieren todo automatizado | $30-60/mes |
| **Self-hosted** | Docker compose, sin limites | Desarrolladores/empresas | Licencia unica |

---

## IMPACTO EN EL PLAN ACTUAL

### Servicios que DESAPARECEN como individuales:
- ~~source-service~~ → absorbido por **acquisition-service**
- ~~product-service~~ → dividido entre acquisition (proveedores, cache) y **commerce-service** (catalogo)
- ~~enrichment-service~~ → absorbido por **commerce-service**
- ~~wordpress-service~~ → absorbido por **commerce-service**

### Servicios que SE MANTIENEN:
- discovery-service (Eureka)
- gateway-service (API Gateway)
- auth-service (JWT, usuarios)
- language-service (i18n)
- administration-service (empresas, config, estilos)
- audit-service (logs)

### Resultado: 8 microservicios totales
| Servicio | Puerto | Tipo |
|----------|--------|------|
| discovery-service | 8760 | Infra (existente) |
| gateway-service | 8820 | Infra (existente) |
| auth-service | 8821 | Base (existente) |
| language-service | 8822 | Base (existente) |
| administration-service | 8823 | Base (existente) |
| audit-service | 8827 | Base (existente) |
| **acquisition-service** | **8830** | **Core NUEVO** |
| **commerce-service** | **8831** | **Core NUEVO** |

### Bases de datos:
```sql
-- init.sql actualizado
CREATE DATABASE auth_db;
CREATE DATABASE lang_db;
CREATE DATABASE admin_db;
CREATE DATABASE audit_db;
CREATE DATABASE acquisition_db;    -- NUEVO
CREATE DATABASE commerce_db;       -- NUEVO
```

---

## ROADMAP AJUSTADO

### Fase 3 → ACQUISITION-SERVICE (5-7 sesiones)
- Iteracion 3A: Core (proveedores, cache de productos, formato estandar)
- Iteracion 3B: Adapter CJ Dropshipping + MeLi
- Iteracion 3C: Importacion archivos planos (CSV/Excel/JSON) + templates
- Iteracion 3D: Score de inteligencia + deteccion duplicados
- Iteracion 3E: Exportacion formato estandar + envio a commerce

### Fase 4 → COMMERCE-SERVICE (7-9 sesiones)
- Iteracion 4A: Catalogo (productos, categorias, atributos, variantes, imagenes)
- Iteracion 4B: Recepcion de productos (desde acquisition o archivo directo)
- Iteracion 4C: Pipeline enriquecimiento IA + imagenes
- Iteracion 4D: Pricing engine (costo real + reglas + promociones)
- Iteracion 4E: WordPress publishing + sync
- Iteracion 4F: Stats de WordPress + notificaciones

### Fase 5 → FRONTEND (4-6 sesiones)
- Modulo Acquisition: busqueda, proveedores, importacion, scores, exportacion
- Modulo Commerce: catalogo, enriquecimiento, pricing, publicacion, stats
- Dashboard unificado

### Fase 6 → INTEGRACION E2E (2-3 sesiones)

---

## PREGUNTA PARA EL USUARIO

Esta arquitectura cambia significativamente el plan. Antes de implementarla necesito tu aprobacion:

1. **Estas de acuerdo** con la division en Acquisition + Commerce?
2. **El formato estandar** (el JSON de contrato) te parece bien como interfaz?
3. **Priorizacion**: Quieres construir primero Acquisition o Commerce?
   - Si Commerce primero: puedes empezar a subir archivos de proveedor y publicar ya
   - Si Acquisition primero: puedes empezar a buscar productos y exportar datos ya
4. **Naming**: Los nombres "acquisition-service" y "commerce-service" te gustan? O prefieres otros?
