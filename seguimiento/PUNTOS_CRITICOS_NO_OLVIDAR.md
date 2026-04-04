# PUNTOS CRITICOS - NO OLVIDAR NUNCA

**Documento de referencia obligatoria antes de cada fase de desarrollo.**
**Ultima actualizacion:** 2026-04-04

---

## 1. PROTECCION LEGAL Y ANTI-BANEO

### 1.1 NUNCA usar imagenes directas de Shein
- Shein es AGRESIVO con takedowns DMCA (han enviado miles contra Temu)
- Si usas sus fotos en tu WooCommerce, pueden reportar a tu hosting y tu tienda SE CAE
- **Que hacer:**
  - Usar fotos del proveedor real (CJ Dropshipping, EPROLO) que SI te autorizan
  - Comprar muestras y fotografiar tu mismo
  - Usar imagenes libres de derechos (Pexels, Unsplash, Pixabay)
  - El enrichment-service debe dejar claro el ORIGEN de cada imagen
- **En el modelo de datos:** el campo `ProductImage.source` debe registrar siempre de donde viene cada foto (PROVIDER, PEXELS, UNSPLASH, OWN_PHOTO, etc.) para trazabilidad

### 1.2 NUNCA copiar descripciones textuales de Shein/MeLi/AliExpress
- Copiar texto literal es plagio y puede generar reclamos
- Las descripciones enriquecidas con IA deben ser ORIGINALES, no "reescritas"
- **Que hacer:**
  - El prompt de IA debe generar contenido NUEVO basado en atributos del producto, no "reescribir" el texto original
  - Guardar siempre el texto original como referencia interna, pero NUNCA publicarlo tal cual
  - El campo `Product.description` (original) es solo interno, `Product.enrichedDescription` es lo que va a WordPress

### 1.3 NO violar Terms of Service de las fuentes
- **Mercado Libre API**: Usar la API oficial, no scraping directo del sitio. La API es generosa y gratuita.
- **CJ Dropshipping**: Uso legitimo, ellos QUIEREN que uses su API (ganan cuando vendes)
- **Shein**: No scrapear a escala. Usar datafeed de afiliados (CJ Affiliate/ShareASale) que es el canal autorizado
- **Google Trends**: Usar pytrends con delays conservadores, cachear resultados, no abusar
- **Regla general**: Si una fuente tiene API oficial, USARLA. Si no tiene, evaluar riesgo antes de scrapear.

### 1.4 Rate limiting obligatorio en TODAS las integraciones
- Cada adapter del source-service DEBE tener rate limiting configurable
- Nunca bombardear una API, aunque no tenga limite publicado
- Implementar backoff exponencial en caso de error 429 (Too Many Requests)
- **Configuracion por fuente:**
  - Mercado Libre: max 1 req/seg (conservador)
  - CJ Dropshipping: seguir sus limites documentados
  - APIs de imagenes: respetar limites publicados (Pexels 200/hora, Pixabay 100/min)
  - IA: no hay limite practico pero controlar costos

---

## 2. IMPUESTOS Y REGULACION COLOMBIA

### 2.1 IVA en compras internacionales (NUEVO 2026)
- **Desde 2026: compras >$50 USD pagan IVA del 19%** (antes era >$200 USD)
- Esto aplica a CADA pedido que llegue a Colombia desde el exterior
- Un pedido tipico de ropa ($30-80 USD) facilmente supera el umbral
- **Impacto directo en el margen del negocio**
- **Estrategias:**
  - Mostrar precio FINAL al cliente (incluyendo estimado de IVA)
  - Focalizarse en pedidos menores a $50 USD cuando sea posible
  - A futuro: evaluar modelo hibrido (comprar bulk, almacenar local, despachar desde Colombia)

### 2.2 Regla de las 6 unidades
- Si importas mas de 6 unidades de la MISMA referencia, la DIAN puede considerar importacion comercial
- Importacion comercial requiere tramite aduanero formal (agente de aduanas, licencias, etc.)
- **Implicacion**: No hacer pedidos grandes de un solo producto sin tramite

### 2.3 Aranceles textiles
- Capitulos 50-63 del arancel de aduanas colombiano
- Pueden variar entre 5-10%+ sobre valor CIF
- Esto se SUMA al IVA del 19%
- **Implicacion**: El costo real de importar ropa es ~25-30% mayor que el precio del proveedor

### 2.4 Obligaciones como comerciante
- Necesitas RUT y registro mercantil (Camara de Comercio) para operar legalmente
- Facturacion electronica obligatoria en Colombia
- Responsabilidad ante el consumidor final (Ley del Consumidor colombiana)
- Si el producto llega defectuoso o no llega, TU respondes (no el proveedor chino)

---

## 3. EXPERIENCIA DEL CLIENTE

### 3.1 Tiempos de envio - SER TRANSPARENTE
- CJ Dropshipping a Colombia: 5-15 dias (desde USA) / 15-30 dias (desde China)
- Shein directo: 15-20 dias habiles
- **NUNCA prometer envio en 2-3 dias** - Es imposible con dropshipping internacional
- Mostrar tiempos estimados REALES en la tienda
- Configurar WooCommerce con zonas de envio y tiempos honestos

### 3.2 Politica de devoluciones clara
- Definir ANTES de lanzar: quien paga la devolucion? hay reembolso completo?
- Tener en cuenta que devolver a China es impractico y costoso
- **Estrategia comun**: Reembolso parcial sin devolucion para montos bajos, reembolso completo para montos altos

### 3.3 Calidad del producto
- Ropa de fabricas chinas tiene calidad VARIABLE
- Comprar muestras ANTES de listar un producto nuevo
- Pedir fotos reales al proveedor (no solo las de catalogo)
- Tener proceso de QC (quality check) aunque sea basico

---

## 4. PROTECCION TECNICA DE LA PLATAFORMA

### 4.1 API keys y credenciales
- NUNCA hardcodear API keys en el codigo fuente
- Usar variables de entorno (.env) y secretos de Docker
- Las API keys de IA (Claude, OpenAI) deben estar encriptadas en BD
- Rotar credenciales periodicamente
- El .env NUNCA debe subirse a git (ya esta en .gitignore)

### 4.2 Limites de gasto en IA
- Configurar limites de gasto mensuales en la cuenta de OpenAI/Anthropic
- El enrichment-service debe tener un campo `maxMonthlyBudget` configurable
- Trackear CADA llamada a la API con tokens usados y costo estimado
- Alertar cuando se alcance el 80% del presupuesto mensual
- **Peor caso sin limite**: un bug en un loop podria generar miles de llamadas en minutos

### 4.3 Backups y persistencia
- WordPress wp-content y base de datos MySQL deben tener backup
- PostgreSQL del SaaS debe tener backup
- Los volumenes Docker son persistentes pero NO son backup
- Implementar backup automatizado antes de lanzar a produccion

### 4.4 No depender de UNA sola fuente
- Si CJ Dropshipping cae, debe haber fallback (EPROLO, AliExpress)
- Si la API de Mercado Libre cambia, el adapter pattern permite reemplazar facil
- Si una API de imagenes deja de ser gratis, tener alternativa configurada
- El source-service debe abstraer cada fuente detras de una interfaz comun

---

## 5. PROPIEDAD INTELECTUAL Y MARCA

### 5.1 Nombre y marca
- Verificar que el nombre del proyecto no este registrado como marca en Colombia (SIC)
- Verificar disponibilidad de dominio .com y .co
- Registrar marca si el proyecto avanza (proteccion legal)

### 5.2 Contenido generado con IA
- En Colombia (y globalmente) hay debate sobre copyright de contenido generado por IA
- Las descripciones generadas son tuyas para uso comercial segun ToS de OpenAI/Anthropic
- Pero NO puedes reclamar copyright exclusivo sobre texto generado por IA
- **Implicacion practica**: Cualquiera podria generar texto similar. Tu ventaja es la COMBINACION (producto + fotos + descripcion + precio + tienda)

### 5.3 Logos e identidad visual
- Crear identidad propia desde el inicio
- No usar logos, colores o estilos que se confundan con Shein, Zara, H&M, etc.
- La tienda WordPress debe tener personalidad propia

---

## 6. ERRORES COMUNES EN DROPSHIPPING A EVITAR

### 6.1 Publicar cientos de productos sin validar
- Mejor 20 productos bien validados que 500 random
- Cada producto debe tener: buenas fotos, descripcion clara, precio con margen real, categoria correcta
- Productos sin fotos decentes NO se venden

### 6.2 No calcular el margen REAL
- Precio del proveedor + envio + IVA importacion + arancel + comision pasarela de pago + empaque
- **El margen que parece 50% en papel puede ser 10% en realidad**
- El pricing-rule engine del product-service DEBE considerar TODOS estos costos
- Incluir campo de "costo total estimado" vs "precio de venta" con margen REAL

### 6.3 Ignorar el SEO
- WordPress sin SEO es invisible
- Cada producto debe tener: meta title, meta description, URL amigable, alt text en imagenes
- El enrichment-service debe generar contenido SEO como parte del enriquecimiento
- Instalar RankMath o Yoast SEO desde el dia 1

### 6.4 No tener pasarela de pago
- En Colombia las principales son: Mercado Pago, PayU, Wompi, ePayco
- WooCommerce tiene plugins para todas
- Tener al menos UNA pasarela configurada antes de lanzar
- Considerar pago contra entrega (muy comun en Colombia para primera compra)

---

## 7. CHECKLIST PRE-LANZAMIENTO (para cuando llegue el momento)

- [ ] Nombre y dominio registrados
- [ ] RUT y registro mercantil activos
- [ ] Pasarela de pago configurada y probada
- [ ] Politica de privacidad publicada
- [ ] Terminos y condiciones publicados
- [ ] Politica de envios con tiempos REALES
- [ ] Politica de devoluciones clara
- [ ] Al menos 1 proveedor con stock verificado
- [ ] Al menos 15-20 productos con fotos propias o autorizadas
- [ ] SEO basico configurado (RankMath/Yoast)
- [ ] SSL certificado activo (HTTPS)
- [ ] Backup automatizado funcionando
- [ ] Limites de gasto en APIs de IA configurados
- [ ] Google Analytics / Search Console conectados
- [ ] Prueba de compra completa (de inicio a fin)

---

## 8. RECORDATORIO DE PRIORIDADES

Cuando estemos en medio del desarrollo y sea tentador agregar features:

1. **Primero que funcione** - Un producto publicado correctamente vale mas que 10 features a medias
2. **Primero la legalidad** - Mejor lento y legal que rapido y baneado
3. **Primero el margen** - Si no hay margen real, no hay negocio
4. **Primero el cliente** - Tiempos honestos, fotos reales, calidad verificada
5. **Despues la escala** - Automatizar cuando ya se valido manualmente

---

## 9. LECCIONES DE LA COMPETENCIA (No repetir sus errores)

### Copiar:
- **Importacion en 1 clic** - Nunca formularios largos para agregar un producto
- **Dashboard simple con onboarding progresivo** - NO mostrar todo de golpe
- **Modelo freemium** - Plan gratis para entrar, pagar al escalar
- **UX tipo Sellfy** (la mas simple del mercado) con poder tipo AutoDS

### Evitar:
- **Precios engañosos** - "400 productos" que son variantes. Ser transparente con limites
- **Prometer "automatico"** cuando requiere gestion manual constante
- **Sync de inventario poco confiable** - Es la queja #1 tecnica en TODAS las herramientas. Invertir aqui
- **Dashboards sobrecargados** - Queja #1 de UX. Formularios de MAX 8 campos
- **Solo 1 proveedor** - Limitar a AliExpress es debilidad critica (DSers)
- **Solo 1 canal** - La mayoria NO soporta FB/IG/MeLi. Esa es NUESTRA oportunidad

### Oportunidad diferenciadora de VISNEX:
**NINGUNA herramienta del mercado soporta publicacion nativa a Facebook + Instagram + MercadoLibre.** Solo AutoDS tiene FB Marketplace (y nada mas). Las APIs de Meta y MeLi estan disponibles. Publicar en 3+ canales desde 1 dashboard = propuesta de valor UNICA.

### Accion temprana requerida:
- **Iniciar proceso de Meta Partner** lo antes posible (puede tardar semanas/meses)
- **Registrar app en MercadoLibre developers** en cuanto tengamos MVP

---

*Este documento debe revisarse antes de cada fase del plan maestro. Los puntos aqui listados no son opcionales - son condiciones de supervivencia del negocio.*
