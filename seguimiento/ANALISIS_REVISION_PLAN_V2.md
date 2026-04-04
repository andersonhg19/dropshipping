# REVISION PROFUNDA DEL PLAN - Analisis de Viabilidad y Mejoras

**Fecha:** 2026-04-04
**Objetivo:** Identificar gaps, oportunidades y features que conviertan esto en un producto POTENTE

---

## 1. PROBLEMAS ENCONTRADOS EN EL PLAN ACTUAL

### 1.1 Seccion 5.4 rota
El texto de recomendacion de temas WordPress salio corrupto. Hay que reescribirlo.

### 1.2 Secciones 3.4/3.5/3.6 duplicadas
CJ Dropshipping aparece descrito dos veces con info contradictoria (uno dice "SI MVP", otro "Fase 2"). Shein aparece con info vieja que ya se actualizo en el documento aparte.

### 1.3 NO hay importacion desde archivos planos
El usuario lo pidio explicitamente. No existe en el plan actual. Es CRITICO.

### 1.4 Modelo de precios demasiado simple
PricingRule solo contempla markup porcentual o fijo. El costo REAL de un producto importado tiene muchas capas que no estan modeladas.

### 1.5 No hay gestion de proveedores
No existe entidad Supplier. Cuando trabajas con CJ, EPROLO, AliExpress simultaneamente necesitas saber: quien es mas rapido, quien es mas barato, quien tiene mejor calidad.

### 1.6 No hay deteccion de duplicados
Si importas el mismo producto de MeLi y de CJ Dropshipping, el sistema los trata como dos productos distintos.

### 1.7 No hay procesamiento de imagenes
Subir fotos tal cual del proveedor se ve amateur. Falta: resize, compresion, watermark opcional, background removal.

### 1.8 Falta sistema de notificaciones
No hay forma de enterarse si: un producto se vendio, un sync fallo, un precio cambio, el presupuesto de IA se esta agotando.

### 1.9 Solo publica a WordPress
La arquitectura acopla la salida a WooCommerce. Si manana quieres publicar a MeLi o Instagram, toca rehacer.

---

## 2. FEATURES QUE HARIAN ESTO UN PRODUCTO DE VERDAD

### 2.1 IMPORTACION DESDE ARCHIVOS PLANOS (Pedido por el usuario)

**Concepto:** El usuario puede subir un CSV, Excel o JSON con productos y el sistema los importa inteligentemente.

**Flujo:**
```
1. Usuario sube archivo (CSV/Excel/JSON)
   ↓
2. Sistema detecta columnas automaticamente (IA o heuristicas)
   ↓
3. Pantalla de MAPEO: usuario conecta columnas del archivo con campos del sistema
   Ejemplo: "Titulo producto" → title, "Precio USD" → basePrice, "Talla" → variant.size
   ↓
4. Preview de los primeros 5-10 productos mapeados
   ↓
5. Validacion: detectar campos vacios, precios invalidos, categorias inexistentes
   ↓
6. Importacion con reporte: X exitosos, Y con warnings, Z fallidos
   ↓
7. Productos creados en estado DRAFT para revision
```

**Entidades nuevas:**
```
ImportJob:
  - id
  - idCompany, idUser
  - fileName, fileType (CSV, XLSX, JSON)
  - filePath (archivo guardado)
  - fieldMapping (JSON: {"columna_archivo": "campo_sistema"})
  - status (UPLOADED, MAPPED, VALIDATING, IMPORTING, COMPLETED, FAILED)
  - totalRows, successCount, errorCount, warningCount
  - errors (JSON array con detalle por fila)
  - creation

ImportTemplate:
  - id
  - idCompany
  - name (ej: "Formato CJ Dropshipping", "Mi formato Excel")
  - fileType
  - fieldMapping (JSON guardado para reutilizar)
  - active
```

**Endpoints:**
```
POST /ds-api/v2/import/upload           -> Subir archivo
POST /ds-api/v2/import/detect-columns   -> Detectar columnas del archivo
POST /ds-api/v2/import/map-fields       -> Guardar mapeo de campos
POST /ds-api/v2/import/preview          -> Preview con mapeo aplicado
POST /ds-api/v2/import/validate         -> Validar datos
POST /ds-api/v2/import/execute          -> Ejecutar importacion
POST /ds-api/v2/import/jobs/all         -> Historial de importaciones
POST /ds-api/v2/import/template/save    -> Guardar template de mapeo
POST /ds-api/v2/import/template/all     -> Listar templates
POST /ds-api/v2/import/download-template -> Descargar CSV/Excel de ejemplo
```

**Por que es POTENTE:**
- Soporta CUALQUIER proveedor sin necesitar adapter especifico
- El usuario puede copiar un catalogo de WhatsApp/email a Excel y subirlo
- Los templates de mapeo se reutilizan: configuras una vez, importas siempre
- Funciona offline (no depende de APIs externas)
- Permite importar datos que NO vienen de ningun API (proveedores locales, ferias, catalagos fisicos)

---

### 2.2 GESTION DE PROVEEDORES

**Concepto:** Trackear proveedores, su rendimiento, costos de envio, tiempos, calidad.

```
Supplier:
  - id
  - idCompany
  - name
  - type (CJ_DROPSHIPPING, EPROLO, ALIEXPRESS, LOCAL, MANUAL)
  - contactInfo (JSON: email, phone, whatsapp, website)
  - country
  - avgShippingDays (promedio real basado en ordenes)
  - avgShippingCost
  - reliabilityScore (1-5, calculado o manual)
  - qualityScore (1-5)
  - notes
  - active, creation, lastUpdate

SupplierProduct (vinculo proveedor-producto):
  - id
  - idSupplier
  - idProduct
  - supplierSku
  - supplierPrice
  - supplierUrl
  - supplierCurrency
  - inStock (boolean)
  - lastPriceCheck
```

**Por que importa:**
- Cuando tienes 3 proveedores para el mismo producto, ves cual es mas barato/rapido
- Historico de precios por proveedor
- Score de confiabilidad para tomar decisiones
- Si un proveedor falla, sabes a quien acudir

---

### 2.3 CALCULADORA DE COSTO REAL

**El pricing actual solo hace markup. El costo REAL de un producto importado a Colombia es:**

```
Costo real = Precio proveedor
           + Envio internacional
           + Arancel textil (~5-10%)
           + IVA importacion (19% si >$50 USD)
           + Comision pasarela de pago (~3-4%)
           + Empaque/branding (si aplica)
           + Margen deseado

PricingConfig (por empresa):
  - id
  - idCompany
  - defaultShippingCost (estimado de envio)
  - customsRate (% arancel, default 7.5% para textiles)
  - ivaRate (19%)
  - ivaThreshold (50 USD)
  - paymentGatewayFee (3.5%)
  - packagingCost (costo fijo empaque)
  - exchangeRate (COP/USD, se puede actualizar)
  - exchangeRateAutoUpdate (boolean)
  - defaultMarginPercent

Nuevo en PricingRule:
  - includeTax (boolean - incluir IVA en calculo)
  - includeShipping (boolean)
  - includeCustoms (boolean)
  - includeGatewayFee (boolean)
```

**En el frontend: Simulador de precio**
```
Precio proveedor:     $12 USD
Envio CJ a Colombia:  $8 USD
─────────────────────────────
Subtotal importacion:  $20 USD
Arancel (7.5%):        $1.50 USD
IVA (19% sobre >$50):  $0 (no supera umbral)
─────────────────────────────
Costo total landed:    $21.50 USD
En COP (~4,200):       $90,300 COP
Comision pasarela (3.5%): $3,161 COP
─────────────────────────────
Costo REAL:            $93,461 COP
Precio venta (40% margen): $130,845 COP
Ganancia neta:         $37,384 COP
```

**Por que es POTENTE:**
- El operador SABE cuanto gana de verdad, no un margen de papel
- Previene vender a perdida por no considerar impuestos
- Auto-actualiza tasa de cambio

---

### 2.4 PRODUCT INTELLIGENCE SCORE

**Concepto:** La IA analiza multiples senales y da un puntaje 1-100 a cada producto.

**Senales que alimentan el score:**
- Volumen de busqueda en MeLi (demanda)
- Cantidad de vendedores del mismo producto (competencia)
- Margen potencial (precio venta - costo total)
- Rating del proveedor
- Tendencia en Google Trends (subiendo/bajando)
- Calidad de las imagenes disponibles
- Complejidad logistica (peso, fragilidad)

```
ProductScore:
  - id
  - idProduct
  - overallScore (1-100)
  - demandScore
  - competitionScore
  - marginScore
  - trendScore
  - supplierScore
  - reasoning (texto IA explicando por que)
  - lastCalculated
```

**Por que es POTENTE:**
- Responde la pregunta mas importante: "Que producto debo vender?"
- Automatiza el ojo comercial que normalmente requiere experiencia
- El usuario ordena por score y trabaja de arriba hacia abajo
- Se puede recalcular periodicamente para detectar cambios

---

### 2.5 PIPELINE DE CONTENIDO (en vez de enriquecimiento individual)

**Concepto actual:** Boton "Mejorar con IA" por campo individual.
**Concepto mejorado:** Pipeline que procesa el producto COMPLETO de una vez.

```
Pipeline de un producto:
1. Analizar datos originales
   ↓
2. Generar titulo optimizado
   ↓
3. Generar descripcion comercial (con bullets)
   ↓
4. Generar meta tags SEO (title, description, keywords)
   ↓
5. Sugerir categoria (del arbol existente)
   ↓
6. Buscar imagenes complementarias (Pexels/Unsplash)
   ↓
7. Calcular precio con reglas
   ↓
8. Calcular Product Intelligence Score
   ↓
9. Producto listo para revision → estado ENRICHED
```

**Una sola llamada a la IA puede generar TODO** (titulo + descripcion + bullets + SEO) si el prompt esta bien diseñado. Esto REDUCE costos y mejora coherencia.

---

### 2.6 PROCESAMIENTO DE IMAGENES

```
ImageProcessingConfig:
  - id
  - idCompany
  - autoResize (boolean)
  - maxWidth, maxHeight (px)
  - compressionQuality (1-100)
  - addWatermark (boolean)
  - watermarkText o watermarkImagePath
  - watermarkPosition (BOTTOM_RIGHT, CENTER, etc.)
  - watermarkOpacity (0-100)
  - backgroundRemoval (boolean) - via API o local
  - outputFormat (WEBP, JPG, PNG)

Endpoints:
POST /ds-api/v2/image/process         -> Procesar imagen individual
POST /ds-api/v2/image/process-batch   -> Procesar todas las imagenes de un producto
POST /ds-api/v2/image/remove-bg       -> Remover fondo
POST /ds-api/v2/image/add-watermark   -> Agregar watermark
```

**APIs de remocion de fondo gratuitas/baratas:**
- remove.bg: 50 imagenes gratis/mes, luego $0.20/imagen
- rembg (open source, local): GRATIS, corre con Python
- Alternativa: No remover fondo en MVP, solo resize + compresion + watermark

---

### 2.7 DETECCION DE DUPLICADOS

**Problema:** Importas "Vestido negro elegante" de MeLi y de CJ. Son el mismo producto pero el sistema no lo sabe.

**Solucion:**
- Al importar, comparar titulo con productos existentes (similaridad de texto)
- Comparar imagenes (hash perceptual - pHash)
- Si hay >80% similaridad, alertar al usuario: "Este producto podria ser duplicado de X"
- El usuario decide: fusionar, mantener como separado, o descartar

```
DuplicateCheck:
  - idProduct (nuevo)
  - idPotentialDuplicate (existente)
  - similarityScore (0-100)
  - matchType (TITLE, IMAGE, SKU)
  - userDecision (MERGE, KEEP_BOTH, DISCARD, PENDING)
```

---

### 2.8 SISTEMA DE NOTIFICACIONES

```
NotificationConfig:
  - id
  - idCompany, idUser
  - channel (IN_APP, EMAIL, WEBHOOK)
  - events (JSON array: ["PRODUCT_SOLD", "SYNC_FAILED", "PRICE_CHANGED", "BUDGET_WARNING", "LOW_STOCK"])
  - active

Notification:
  - id
  - idCompany, idUser
  - type (INFO, WARNING, ERROR, SUCCESS)
  - event
  - title
  - message
  - data (JSON con contexto: idProduct, orderId, etc.)
  - read (boolean)
  - creation
```

**Eventos criticos:**
- Producto vendido en WordPress
- Sync con WP fallo
- Precio de proveedor cambio >10%
- Presupuesto de IA al 80%
- Producto sin stock en proveedor
- Nuevo producto trending detectado

---

### 2.9 ARQUITECTURA MULTI-CANAL (Vision a futuro)

**Concepto:** El product-service es la fuente de verdad. Los "canales de publicacion" son pluggables.

```
PublishChannel:
  - id
  - idCompany
  - type (WOOCOMMERCE, MERCADOLIBRE, SHOPIFY, INSTAGRAM, CSV_EXPORT)
  - config (JSON con credenciales/configuracion del canal)
  - status
  - active

PublishMapping:
  - id
  - idProduct
  - idChannel
  - externalId (ID en la plataforma destino)
  - externalUrl
  - syncStatus
  - lastSync
```

**Por que diseñarlo asi AHORA:**
- Hoy solo WordPress. Pero manana MeLi es un canal de venta ENORME en Colombia
- La inversion de hacer el wordpress-service como "canal" en vez de "destino unico" es minima
- Hace el producto vendible como SaaS (cada cliente conecta SUS canales)

---

### 2.10 EXPORTACION A ARCHIVOS

**Complemento de la importacion:**
```
POST /ds-api/v2/export/products        -> Exportar productos a CSV/Excel
POST /ds-api/v2/export/products/pdf    -> Ficha de producto en PDF (para compartir)
POST /ds-api/v2/export/catalog         -> Catalogo completo (para proveedores/socios)
POST /ds-api/v2/export/pricing-report  -> Reporte de precios y margenes
```

---

## 3. ANALISIS DE VIABILIDAD AJUSTADO

### Lo que cambia con estas mejoras:

**Complejidad:**
- El MVP original tenia ~6 meses de trabajo estimado
- Con estas mejoras, el MVP "potente" seria ~8-10 meses
- PERO el resultado es un producto vendible como SaaS, no solo una herramienta personal

**Costos adicionales:**
- Procesamiento de imagenes (rembg local): $0
- Deteccion de duplicados (local): $0
- Notificaciones in-app: $0
- Product Intelligence Score (usa la misma API de IA): ~$0.50-1/mes adicional
- **Total adicional: practicamente $0**

**Lo que se gana:**
- Un producto que NO es "otro importador de AliExpress"
- Diferenciador real: calculadora de costo REAL para Colombia (nadie lo tiene)
- Diferenciador real: Product Intelligence Score
- Diferenciador real: Pipeline de contenido completo (no campo por campo)
- Importacion flexible (API + archivos) cubre el 100% de los proveedores
- Arquitectura multi-canal desde el dia 1

### Riesgo de scope creep:
ALTO. Hay que priorizar. No todo tiene que estar en el primer release.

---

## 4. NUEVA PRIORIZACION RECOMENDADA

### TIER 1 - MVP CORE (sin esto no hay producto)
- Product-service con importacion (API + archivos planos)
- Enrichment con pipeline completo (una llamada IA = todo el contenido)
- Calculadora de costo real (no solo markup)
- WordPress-service para publicacion
- Frontend con flujo completo

### TIER 2 - MVP POTENTE (esto lo diferencia)
- Product Intelligence Score
- Gestion de proveedores
- Deteccion de duplicados
- Procesamiento basico de imagenes (resize + compresion)
- Notificaciones in-app

### TIER 3 - POST-MVP (esto lo escala)
- Multi-canal (MeLi, Shopify)
- Scheduler automatico
- Exportacion a archivos
- Watermark/background removal
- Analytics avanzado
- Social media auto-post
- A/B testing de contenido

---

## 5. ROADMAP REVISADO

### Fase 3 (product-service) ahora incluye:
- Importacion desde archivos planos (CSV/Excel/JSON) con mapeo de campos
- Templates de importacion reutilizables
- Entidad Supplier
- Calculadora de costo real (no solo PricingRule simple)
- Deteccion de duplicados basica

### Fase 4 (source-service) prioridad ajustada:
1. CJ Dropshipping API (proveedor real, gratis)
2. Mercado Libre API (investigacion de mercado)
3. EPROLO como fuente complementaria
4. Datafeed afiliados Shein (via CJ Affiliate)

### Fase 5 (enrichment-service) ahora es pipeline:
- Una llamada IA genera: titulo + descripcion + bullets + SEO
- Product Intelligence Score como output adicional
- Procesamiento de imagenes (resize + compresion como minimo)

### Fase nueva entre 7 y 8: Notificaciones
- Sistema de notificaciones in-app
- Eventos criticos: venta, sync fallo, presupuesto IA, precio cambio

---

*Este analisis debe incorporarse al PLAN_MAESTRO_DROPSHIPPING.md*
