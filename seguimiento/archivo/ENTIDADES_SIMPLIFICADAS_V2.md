# ENTIDADES SIMPLIFICADAS - VISNEX v2

**Principio rector:** Cada entidad debe poder representarse en un formulario de MAXIMO 8-10 campos visibles. Los campos tecnicos/internos existen en BD pero NO aparecen en formularios.

## CAMPOS OBLIGATORIOS EN TODA ENTIDAD (sin excepcion)

Toda entidad del sistema DEBE tener estos campos base:
```java
// Campos OBLIGATORIOS heredados del estandar VISNEX
private Long id;                    // @Id @GeneratedValue(IDENTITY)
private Company company;            // @ManyToOne(LAZY) - FK siempre
private Subsidiary subsidiary;      // @ManyToOne(LAZY) - FK siempre
private User modifiedBy;            // @ManyToOne(LAZY) - quien creo/modifico
private Boolean active = true;      // Soft delete
private LocalDateTime creation;     // @CreationTimestamp (solo Entity, NUNCA en DTO output)
private LocalDateTime lastUpdate;   // @UpdateTimestamp (solo Entity, NUNCA en DTO output)
```
Estos campos NO aparecen en formularios (son automaticos), pero EXISTEN en toda Entity y se envian en los DTOs de input como `idCompany`, `idSubsidiary`, `idModifiedBy`.

---

## ACQUISITION SERVICE (Puerto 8830)

### 1. Supplier (Proveedor)
**Formulario: 6 campos**
```
Campos visibles en formulario:
  - name*              (texto: "CJ Dropshipping")
  - type*              (select: CJ_DROPSHIPPING | EPROLO | ALIEXPRESS | LOCAL | OTRO)
  - country            (select: China, Colombia, USA, etc.)
  - contact            (texto: email, whatsapp o URL - un solo campo flexible)
  - shippingDays       (numero: dias promedio de envio a Colombia)
  - notes              (textarea: notas libres)

Campos base obligatorios (automaticos, NO en formulario):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  
Campos automaticos adicionales:
  - reliabilityScore   (se calcula con el tiempo basado en ordenes)
```

### 2. SourceConfig (Fuente de datos)
**Formulario: 5 campos**
```
Campos visibles:
  - name*              (texto: "Mi cuenta CJ Dropshipping")
  - provider*          (select: CJ_DROPSHIPPING | MERCADOLIBRE | EPROLO | ALIEXPRESS | FILE)
  - apiKey             (password: solo si el provider lo requiere)
  - apiSecret          (password: solo si el provider lo requiere)
  - active             (toggle)

Campos base obligatorios (automaticos):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  - baseUrl            (se autollena segun provider)
  - rateLimit          (se autollena segun provider)
  - lastSync
```

### 3. SourceProduct (Producto encontrado - cache temporal)
**NO tiene formulario - se llena desde APIs o archivos**
```
  - id
  - idCompany
  - sourceProvider     (CJ_DROPSHIPPING, MERCADOLIBRE, FILE_IMPORT, etc.)
  - sourceId           (ID en la fuente original)
  - title
  - description
  - price, currency
  - images             (JSON array de URLs)
  - category           (texto libre de la fuente)
  - attributes         (JSON flexible: {sizes:[], colors:[], material:""})
  - variants           (JSON array: [{sku, size, color, price, stock}])
  - sourceUrl          (link al producto en la fuente)
  - supplierName       (nombre del proveedor en la fuente)
  - tags               (JSON array)
  - score              (1-100, calculado)
  - imported           (boolean: ya se envio al commerce?)
  - fetchDate
```

### 4. ImportJob (Trabajo de importacion)
**Formulario: 3 campos (el resto es automatico)**
```
Campos visibles:
  - file*              (upload: CSV, XLSX o JSON)
  - template           (select: elegir template de mapeo guardado, o "Nuevo mapeo")
  - idSupplier         (select: asociar a un proveedor)

Pantalla de MAPEO (solo si template es nuevo):
  - Tabla visual: columna del archivo → campo del sistema (select por fila)
  - Checkbox: "Guardar como template para futuras importaciones"
  - Nombre del template (si guarda)

Campos base obligatorios (automaticos):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  - fileName, fileType
  - fieldMapping (JSON resultado del mapeo)
  - status (UPLOADED → MAPPED → IMPORTING → COMPLETED | FAILED)
  - totalRows, successCount, errorCount
  - errors (JSON detalle)
```

### 5. ImportTemplate (Template de mapeo reutilizable)
**Se crea DESDE el ImportJob, no tiene formulario propio**
```
  Campos base obligatorios: id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  - name               (texto: "Formato Excel de mi proveedor local")
  - fileType           (CSV, XLSX, JSON)
  - fieldMapping       (JSON)
  - active
```

---

## COMMERCE SERVICE (Puerto 8831)

### 6. Product (Producto - entidad central)
**Formulario: 2 vistas**

**Vista rapida (creacion/listado): 7 campos**
```
Campos visibles:
  - title*             (texto)
  - category*          (select con arbol)
  - basePrice*         (numero: precio del proveedor en USD)
  - sellingPrice       (numero: auto-calculado, editable)
  - status             (badge: DRAFT | READY | PUBLISHED | ARCHIVED)
  - mainImage          (thumbnail)
  - tags               (chips input)
```

**Vista detalle (edicion completa): tabs**
```
Tab "General":
  - title*, enrichedTitle (lado a lado: original vs mejorado)
  - description, enrichedDescription (lado a lado)
  - bulletPoints       (lista editable)
  - category*          (select arbol)
  - tags               (chips)

Tab "Precio":
  - basePrice*         (precio proveedor USD)
  - shippingCost       (auto o manual)
  - sellingPrice       (auto-calculado, editable)
  - marginPercent      (auto-calculado, solo lectura)
  - costBreakdown      (desglose visual: proveedor + envio + IVA + arancel + comision = costo real)

Tab "Imagenes":
  - Lista de imagenes con drag & drop para reordenar
  - Boton "Buscar imagenes libres" (abre modal Pexels/Pixabay)
  - Boton "Subir imagen"
  - Badge de origen en cada imagen (PROVEEDOR | PEXELS | PROPIA)

Tab "Variantes":
  - Tabla simple: SKU | Talla | Color | Precio | Stock
  - Boton "Agregar variante"

Tab "SEO":
  - seoTitle           (con contador de caracteres, max 60)
  - seoDescription     (con contador, max 160)
  - seoKeywords        (chips)
  - slug               (auto-generado desde titulo, editable)

Tab "Publicacion":
  - Estado por canal: WooCommerce ✅ | Facebook ⏳ | Instagram ❌
  - Boton por canal: "Publicar" / "Actualizar" / "Despublicar"
```

**Campos base obligatorios (automaticos, NO en formulario):**
```
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  - sourceProvider, sourceId, sourceUrl (de donde vino)
  - idSupplier (referencia al proveedor)
  - currency
  - costPrice          (calculado: base + envio + IVA + arancel + comision)
```

### 7. Category (Categoria)
**Formulario: 3 campos**
```
  - name*              (texto: "Vestidos")
  - parent             (select: categoria padre, o ninguna si es raiz)
  - icon               (select de iconos, opcional)

Campos base obligatorios (automaticos):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
```

### 8. ProductImage
**NO tiene formulario propio - se gestiona desde el tab "Imagenes" del producto**
```
  - id, idProduct
  - url
  - source             (PROVIDER | PEXELS | UNSPLASH | UPLOADED)
  - isPrimary          (boolean)
  - altText            (auto-generado del titulo, editable)
  - sortOrder          (drag & drop)
  - active
```

### 9. PricingConfig (Configuracion global de costos)
**Formulario: 8 campos - se configura UNA vez**
```
  - shippingCostDefault*  (USD: costo envio promedio a Colombia)
  - customsRate*          (% arancel textil, default 7.5)
  - ivaRate*              (% IVA, default 19)
  - ivaThresholdUsd*      (umbral IVA, default 50 USD)
  - gatewayFeePercent*    (% comision pasarela, default 3.5)
  - packagingCost         (USD: costo empaque, default 0)
  - exchangeRate*         (COP por USD, editable o auto)
  - defaultMargin*        (% margen default, ej: 40)

Campos base obligatorios (automaticos):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
```

### 10. Promotion (Promocion)
**Formulario: 6 campos**
```
  - name*              (texto: "Descuento Black Friday")
  - type*              (select: PERCENTAGE | FIXED_AMOUNT | BUY_X_GET_Y)
  - value*             (numero: 20 para 20%, o monto fijo)
  - appliesTo          (select: ALL | CATEGORY | SPECIFIC_PRODUCTS)
  - startDate          (fecha inicio)
  - endDate            (fecha fin)

Campos base obligatorios (automaticos):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
```

### 11. PublishChannel (Canal de publicacion - MULTI-CANAL)
**Formulario: 5 campos**
```
  - name*              (texto: "Mi tienda WordPress")
  - type*              (select: WOOCOMMERCE | FACEBOOK_MARKETPLACE | INSTAGRAM_SHOPPING | MERCADOLIBRE | CSV_EXPORT)
  - config*            (JSON dinamico segun type):
      WooCommerce:     { siteUrl, consumerKey, consumerSecret }
      Facebook:        { pageId, accessToken, catalogId }
      Instagram:       { businessAccountId, accessToken, catalogId }
      MercadoLibre:    { accessToken, sellerId }
      CSV Export:      { outputPath, format }
  - active             (toggle)
  - autoSync           (toggle: sincronizar automaticamente cambios?)

Campos base obligatorios (automaticos):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  - status             (CONNECTED | DISCONNECTED | ERROR)
  - lastSync
```

### 12. ProductPublish (Mapeo producto-canal)
**NO tiene formulario - se gestiona desde el tab "Publicacion" del producto**
```
  Campos base obligatorios: id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  - idProduct
  - idChannel
  - externalId         (ID en la plataforma: wpProductId, fbListingId, etc.)
  - externalUrl        (link directo al producto publicado)
  - syncStatus         (SYNCED | PENDING | OUT_OF_SYNC | ERROR)
  - lastSync
  - lastError          (texto del ultimo error si hubo)
```

### 13. EnrichmentConfig (Config de IA)
**Formulario: 5 campos**
```
  - provider*          (select: OPENAI | CLAUDE | OLLAMA_LOCAL)
  - apiKey*            (password, encriptado en BD)
  - model*             (select dinamico segun provider: gpt-4o-mini, claude-haiku-4-5, etc.)
  - monthlyBudget      (USD: limite mensual, default 10)
  - active             (toggle)

Campos base obligatorios (automaticos):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  - currentMonthSpend  (calculado de EnrichmentJob)
```

### 14. PromptTemplate (Template de IA)
**Formulario: 4 campos**
```
  - name*              (texto: "Descripcion ropa mujer casual")
  - type*              (select: FULL_PIPELINE | TITLE_ONLY | DESCRIPTION_ONLY | SEO_ONLY)
  - category           (select: asociar a una categoria, o "General")
  - promptText*        (textarea grande con variables: {{title}}, {{category}}, {{price}}, {{attributes}})

Campos base obligatorios (automaticos):
  - id, company, subsidiary, modifiedBy, active, creation, lastUpdate
```

### 15. Notification
**NO tiene formulario - se genera automaticamente**
```
  Campos base obligatorios: id, company, subsidiary, modifiedBy, active, creation, lastUpdate
  - type               (INFO | WARNING | ERROR | SUCCESS)
  - event              (PRODUCT_SOLD | SYNC_FAILED | BUDGET_WARNING | PRICE_CHANGED | NEW_TRENDING)
  - title, message
  - data               (JSON: {productId, channelId, amount, etc.})
  - read               (boolean)
  - creation
```

---

## RESUMEN: CONTEO DE FORMULARIOS

| Entidad | Campos en formulario | Complejidad |
|---------|---------------------|-------------|
| Supplier | 6 | Baja |
| SourceConfig | 5 | Baja |
| ImportJob | 3 + mapeo visual | Media |
| Product (rapido) | 7 | Baja |
| Product (detalle) | 5 tabs organizados | Media (pero organizado) |
| Category | 3 | Minima |
| PricingConfig | 8 (una sola vez) | Media |
| Promotion | 6 | Baja |
| PublishChannel | 5 | Baja |
| EnrichmentConfig | 5 | Baja |
| PromptTemplate | 4 | Baja |

**Entidades SIN formulario (automaticas):** SourceProduct, ImportTemplate (se crea desde ImportJob), ProductImage (desde tab), ProductPublish (desde tab), Notification

**Total: 11 formularios, todos de 3-8 campos. Ninguno abruma.**

---

## MULTI-CANAL: Facebook Marketplace + Instagram Shopping

### Como funciona tecnicamente:

**Meta Commerce Manager** es la plataforma unificada de Facebook/Instagram para vender:

1. **Catalogo de productos**: Se crea un catalogo en Meta Business Suite
2. **API**: Meta Catalog API (parte de Graph API) permite:
   - Crear/actualizar productos en el catalogo
   - Subir imagenes
   - Gestionar variantes
   - Sincronizar inventario y precios
3. **Facebook Marketplace**: Los productos del catalogo aparecen automaticamente
4. **Instagram Shopping**: Los productos se pueden etiquetar en posts/stories

**Requisitos:**
- Pagina de Facebook del negocio
- Cuenta de Instagram Business conectada
- Meta Business Suite configurado
- Catalogo creado en Commerce Manager
- App de Facebook registrada (para API access)
- Review de la app por Meta (puede tardar dias)

**API Key endpoints:**
```
POST /{catalog_id}/products              -> Crear producto
POST /{catalog_id}/product_feeds         -> Subir feed de productos (CSV/XML)
DELETE /{catalog_id}/products            -> Eliminar producto
GET /{catalog_id}/products               -> Listar productos
POST /{product_id}                       -> Actualizar producto
```

**Formatos de feed soportados:** CSV, TSV, XML (RSS/ATOM), Google Sheets

### Flujo en VISNEX:
```
1. Usuario configura PublishChannel type=FACEBOOK_MARKETPLACE
   - Conecta su cuenta Meta via OAuth
   - Selecciona o crea catalogo
2. Al publicar un producto, el commerce-service:
   - Formatea el producto segun especificacion de Meta
   - Lo sube via Catalog API
   - Guarda el externalId en ProductPublish
3. El producto aparece en Facebook Marketplace E Instagram Shopping automaticamente
```

### Lo mismo aplica para MercadoLibre futuro:
```
PublishChannel type=MERCADOLIBRE
- API de MeLi para crear publicaciones
- Categorias de MeLi mapeadas desde nuestras categorias
- Publicacion directa desde el tab "Publicacion" del producto
```

---

## PRINCIPIOS DE SIMPLICIDAD

1. **Un formulario = una pantalla.** Nunca scroll infinito.
2. **Campos obligatorios minimos.** Solo lo que realmente necesitas para crear.
3. **Defaults inteligentes.** Si se puede calcular, no pedir al usuario.
4. **Tabs para detalle.** El producto tiene mucha info pero organizada en tabs, no en un formulario gigante.
5. **Acciones en contexto.** "Publicar" esta en el producto, no en una pantalla separada.
6. **JSON para flexibilidad.** Atributos, variantes e imagenes son JSON, no tablas rigidas con 20 columnas.
7. **Templates reutilizables.** Configuras el mapeo de importacion UNA vez.
8. **Calculos automaticos.** Precio de venta, margen, costo real = el sistema los calcula, el usuario solo ajusta.
