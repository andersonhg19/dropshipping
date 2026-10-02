# Investigacion de APIs y Fuentes de Datos para Plataforma de Dropshipping (Colombia)

**Fecha:** 2026-04-04
**Contexto:** Desarrollador solo en Colombia, presupuesto inicial cero.

---

## RESUMEN EJECUTIVO - Viabilidad Real

| Fuente | Costo Inicial | Viabilidad Solo Dev | Prioridad |
|--------|--------------|---------------------|-----------|
| Mercado Libre API | GRATIS | ALTA | 1 - Critica |
| CJ Dropshipping API | GRATIS | ALTA | 2 - Critica |
| WooCommerce REST API | GRATIS | ALTA | 1 - Critica |
| Pexels/Pixabay API | GRATIS | ALTA | 3 - Util |
| Google Trends (pytrends) | GRATIS | MEDIA (fragil) | 4 - Nice to have |
| Ollama (LLM local) | GRATIS | ALTA | 3 - Util |
| Claude API (Haiku) | ~$1-5/mes | ALTA | 3 - Alternativa a Ollama |
| OpenAI (GPT-4o-mini) | ~$0.50-2/mes | ALTA | 3 - Alternativa a Ollama |
| AliExpress API | GRATIS | MEDIA | 5 - Secundaria |
| Amazon PA API | GRATIS pero muere Abr 2026 | BAJA | NO INVERTIR |
| Unsplash API | GRATIS | ALTA | 3 - Util |
| Spocket API | $40-100/mes | BAJA para presupuesto cero | 6 - Futuro |
| Shein | NO HAY API oficial | MUY BAJA | 7 - No viable |

---

## 1. MERCADO LIBRE API

### Disponibilidad
- API REST publica, bien documentada
- Soporte completo para Colombia (sitio MCO)
- Registro gratuito como desarrollador en https://developers.mercadolibre.com.co

### Pricing
- **100% GRATIS** - No tiene tiers de pago para la API en si
- Se cobra comision solo si vendes EN Mercado Libre (no por consultar datos)

### Rate Limits
- Los rate limits son por aplicacion/usuario autenticado
- Endpoints publicos (busqueda, categorias, items): generosos para uso normal
- No hay documentacion publica exacta del limite por segundo, pero en la practica es suficiente para scraping moderado de datos

### Que datos puedes obtener
- **Busqueda de productos** por categoria, keyword, precio, ubicacion
- **Detalles de producto**: titulo, precio, imagenes, descripcion, atributos, vendedor
- **Categorias y tendencias**: estructura de categorias, productos mas vendidos por categoria
- **Precios de mercado**: rango de precios por producto/categoria
- **Opiniones y reviews** de productos
- **Informacion de vendedores**: reputacion, volumen

### Consideraciones Legales
- Uso de la API sujeto a terminos de servicio de ML
- Puedes consultar datos publicos libremente
- NO puedes copiar listados completos para republicar sin autorizacion
- Para un sistema de analisis de tendencias y precios: totalmente valido

### Evaluacion Practica
**ALTAMENTE VIABLE.** Es la fuente #1 para entender el mercado colombiano. Datos reales de demanda, precios que la gente paga, y tendencias locales. Implementacion directa con REST + OAuth2. Prioridad maxima.

**Fuentes:**
- [Mercado Libre Developers](https://global-selling.mercadolibre.com/devsite)
- [Mercado Libre API Essential Guide - Rollout](https://rollout.com/integration-guides/mercado-libre/api-essentials)
- [MercadoLibre Developers API Guide - API2Cart](https://api2cart.com/api-technology/mercadolibre-developers-api/)

---

## 2. ALIEXPRESS API (Open Platform)

### Disponibilidad
- API oficial via AliExpress Open Platform (openservice.aliexpress.com)
- Requiere aplicacion para acceso (aprobacion en 1-5 dias habiles)
- Dos programas: **Affiliate API** y **Dropshipping API**

### Pricing
- **GRATIS** para usar la API
- No hay costo por llamada ni suscripcion
- Modelo de negocio: ellos ganan cuando compras productos

### Rate Limits
- Rate limits moderados (varian por endpoint)
- Suficiente para operacion normal de un negocio de dropshipping

### Que datos puedes obtener
- **Dropshipping API**: busqueda de productos, detalles, precios, imagenes, variantes, envio estimado
- **Affiliate API**: links de afiliado, comisiones, productos promocionados
- **Gestion de ordenes**: crear ordenes, tracking, estados
- No es un catalogo libre tipo "busca lo que quieras" - necesitas IDs de producto o categorias

### Consideraciones Legales
- Programa de afiliados y dropshipping es oficial y permitido
- Tiempos de envio a Colombia: 15-45 dias (problema real para el cliente)
- Aduanas colombianas: compras >$200 USD pagan arancel + IVA
- Responsabilidad del vendedor ante el consumidor final en Colombia (Ley del Consumidor)

### Evaluacion Practica
**VIABLE como fuente de sourcing, pero con limitaciones importantes.** Los tiempos de envio a Colombia son el mayor problema. Funciona bien como proveedor de respaldo o para productos de nicho donde el cliente acepte esperar. La API funciona, es gratis, y se puede integrar. Pero el negocio real depende de que el cliente acepte 3-6 semanas de espera.

**Fuentes:**
- [AliExpress Open Platform - API Reference](https://openservice.aliexpress.com/doc/api.htm)
- [AliExpress API Guide - Zuplo](https://zuplo.com/learning-center/aliexpress-api-guide)
- [AliExpress Dropshipping Guide 2026 - Shopify](https://www.shopify.com/blog/117607173-the-definitive-guide-to-dropshipping-with-aliexpress)

---

## 3. AMAZON PRODUCT ADVERTISING API (PA-API 5.0)

### ALERTA CRITICA: SE DEPRECA EL 30 DE ABRIL DE 2026

Amazon ha anunciado que la PA-API 5.0 sera deprecada el 30 de abril de 2026 y migrada a la "Creators API".

### Disponibilidad
- Requiere ser afiliado de Amazon (Associates Program)
- Amazon Colombia NO tiene programa de afiliados local robusto
- Podrias usar Amazon.com (USA) pero las comisiones y relevancia para Colombia son bajas

### Pricing
- Gratis, pero...
- Rate limits iniciales: 1 request/segundo, 8,640 requests/dia (primeros 30 dias)
- Despues los limites suben segun tus ventas como afiliado: 1 TPD por cada $0.05 de revenue

### Que datos puedes obtener
- Busqueda de productos, precios, imagenes, reviews, ratings
- Datos de pricing en tiempo real
- Informacion de disponibilidad

### Consideraciones Legales
- Sujeto a terminos de Amazon Associates
- La migracion a Creators API puede cambiar completamente los terminos

### Evaluacion Practica
**NO INVERTIR TIEMPO.** Se depreca en menos de un mes (abril 30, 2026). La Creators API que la reemplaza aun no tiene documentacion clara para desarrolladores. Ademas, Amazon no tiene una presencia de marketplace fuerte en Colombia para dropshipping. Mercado Libre es mucho mas relevante para el mercado colombiano.

**Fuentes:**
- [Amazon PA-API Rate Limits](https://webservices.amazon.com/paapi5/documentation/troubleshooting/api-rates.html)
- [Amazon introduces fees for third-party developer API access in 2026](https://ppc.land/amazon-introduces-fees-for-third-party-developer-api-access-in-2026/)

---

## 4. GOOGLE TRENDS (Deteccion de Tendencias)

### Disponibilidad
- **NO hay API oficial publica estable** de Google Trends (hay una en alpha limitada lanzada en 2025)
- **pytrends** (Python): libreria no oficial que hace scraping de Google Trends - GRATIS pero fragil
- **Alternativas pagas**: SerpApi, Glimpse, ScrapingBee

### Pricing - Opciones Gratuitas
- **pytrends**: 100% gratis, pero se rompe frecuentemente cuando Google cambia su frontend
- **trendspyg**: alternativa open-source mas reciente
- **Trends MCP**: 100 requests/mes gratis (sin tarjeta de credito)

### Pricing - Opciones Pagas
- **SerpApi**: desde $50/mes (5,000 busquedas)
- **Glimpse**: planes desde ~$30/mes
- **ScrapingBee**: desde $49/mes

### Rate Limits (pytrends)
- Google aplica rate limiting agresivo al scraping
- Puedes esperar ~10-20 consultas antes de ser bloqueado temporalmente
- Hay que implementar delays y rotacion de IP

### Que datos puedes obtener
- Interes relativo (0-100) de un termino en el tiempo
- Comparacion entre terminos
- Tendencias por region (Colombia especificamente)
- Consultas relacionadas
- Temas en ascenso

### Evaluacion Practica
**VIABLE CON LIMITACIONES.** pytrends es gratis pero fragil. La estrategia realista para presupuesto cero:
1. Usar pytrends con delays conservadores para consultas puntuales
2. Cache agresivo de resultados (las tendencias no cambian cada minuto)
3. Consultar 1-2 veces por dia en batch, no en tiempo real
4. Si se rompe pytrends, usar Trends MCP (100 req/mes gratis) como fallback
5. NO depender de esto para funcionalidad critica del negocio

**Fuentes:**
- [Top 4 Pytrends Alternatives 2026 - Glimpse](https://meetglimpse.com/software-guides/pytrends-alternatives/)
- [Google Trends API Python Options - Trends MCP](https://www.trendsmcp.ai/blog/google-trends-api-python)
- [GitHub - pytrends](https://github.com/GeneralMills/pytrends)
- [Trends MCP vs Google Trends API 2026](https://www.trendsmcp.ai/trendsmcp-vs-google-trends-api)

---

## 5. SHEIN

### Disponibilidad
- **NO hay API oficial para dropshipping**
- Shein tiene una "OpenAPI" pero es solo para sellers que publican EN Shein (no para sacar datos)
- Unica forma de acceder a datos: scraping via terceros pagos

### Pricing de Scrapers Terceros
- **Oxylabs**: desde $49/mes (Scraper API)
- **SearchAPI**: planes desde ~$50/mes
- **Decodo**: free trial limitado, luego pago

### Que datos podrias obtener (via scraping)
- Productos, precios, imagenes, variantes, descripciones
- Datos de categorias y bestsellers

### Consideraciones Legales
- Shein prohibe explicitamente el scraping en sus ToS
- No hay programa de dropshipping oficial
- Riesgo legal real si haces scraping a escala
- Shein tiene historial de acciones legales contra scrapers

### Evaluacion Practica
**NO VIABLE para presupuesto cero y con riesgo legal.** Sin API oficial, dependes de scraping ilegal segun los ToS de Shein. Los servicios de scraping cuestan $50+/mes. Para un solo dev empezando, hay opciones mucho mejores (CJ Dropshipping, AliExpress) que son gratuitas y legales. Descarta Shein por ahora.

**Fuentes:**
- [SHEIN Developer Platform](https://open.sheincorp.com/)
- [Shein Dropshipping Explained 2026 - SellerApp](https://www.sellerapp.com/blog/shein-dropshipping/)
- [Scrape SHEIN data - Oxylabs](https://oxylabs.io/products/scraper-api/ecommerce/shein)

---

## 6. CJ DROPSHIPPING API

### Disponibilidad
- API oficial bien documentada en https://developers.cjdropshipping.com/
- Registro gratuito, acceso inmediato a la API
- Integracion directa con WooCommerce disponible

### Pricing
- **100% GRATIS** - Sin cuota de suscripcion, sin fee por API call
- Solo pagas: costo del producto + envio cuando haces un pedido real
- Sin minimo de orden, sin fee de almacenamiento

### Que datos puedes obtener
- **Catalogo de productos**: busqueda, detalles, imagenes, variantes, precios
- **Precios de envio**: cotizacion por pais, metodo de envio, peso
- **Gestion de ordenes**: crear, trackear, cancelar
- **Inventario en tiempo real**: stock disponible por variante
- **Almacenes globales**: CJ tiene almacenes en China, USA, EU, y algunos en Latam

### Ventajas sobre AliExpress
- Envio mas rapido (tienen almacenes propios, no solo China)
- Servicio de branding/private label
- API mas limpia y orientada a dropshippers
- Precios generalmente iguales o menores que AliExpress

### Consideraciones para Colombia
- Envio a Colombia: 7-15 dias desde almacen USA, 15-30 desde China
- Costo de envio variable segun peso/metodo ($5-20 USD tipico)
- Mismo tema de aduanas que AliExpress para compras >$200 USD

### Evaluacion Practica
**ALTAMENTE VIABLE. Esta es la mejor opcion de sourcing para empezar.** API gratis, bien documentada, envios mas rapidos que AliExpress, y diseñada especificamente para dropshipping. La integracion con WooCommerce ya existe como plugin, pero tambien puedes usar la API directamente para mas control. Prioridad alta.

**Fuentes:**
- [CJ Dropshipping API Documentation](https://developers.cjdropshipping.com/)
- [Is CJdropshipping Really Free? 2026](https://revenuegeeks.com/cjdropshipping-free/)
- [CJdropshipping Pricing Guide 2026](https://revenuegeeks.com/cjdropshipping-pricing/)

---

## 7. SPOCKET API

### Disponibilidad
- Plataforma con API disponible
- Integracion nativa con WooCommerce, Shopify, Wix

### Pricing
- **No hay plan gratuito**
- Starter: $39.99/mes (solo mensual)
- Pro: $59.99/mes (o $24/mes anual)
- Empire: $99.99/mes (o $57/mes anual)
- Unicorn: $299.99/mes (o $79/mes anual)
- Prueba gratuita: 14 dias

### Que datos puedes obtener
- Catalogo de proveedores verificados (80% USA/EU)
- Productos con envio rapido (2-5 dias a USA)
- Precios mayoristas, imagenes, descripciones
- Sincronizacion automatica de inventario

### Ventaja Unica
- Proveedores en USA/EU = envio rapido
- Productos de mayor calidad promedio que AliExpress/CJ

### Consideraciones para Colombia
- Los proveedores son USA/EU, el envio a Colombia seria internacional
- A $40-100/mes sin ingresos, es un costo fijo dificil de justificar al inicio

### Evaluacion Practica
**NO VIABLE para presupuesto cero.** El minimo es $40/mes que para un negocio sin ingresos en Colombia es significativo. Ademas, los proveedores USA/EU no mejoran tanto el envio A Colombia (sigue siendo internacional). CJ Dropshipping ofrece funcionalidad similar gratis. Guardar Spocket para cuando ya haya revenue y se quiera expandir a mercado USA directo.

**Fuentes:**
- [Spocket Pricing Plans](https://www.spocket.co/pricing)
- [Spocket Review 2026 - EcommerceParadise](https://ecommerceparadise.com/spocket-review-2026-the-best-us-and-eu-dropshipping-platform-for-fast-shipping-stores/)
- [Spocket Pricing Plans 2026 - DoDropshipping](https://dodropshipping.com/spocket-pricing-plans/)

---

## 8-10. APIs DE IMAGENES GRATUITAS

### PEXELS API
- **Precio**: 100% GRATIS
- **Rate Limits**: 200 requests/hora, 20,000 requests/mes
- **Limites aumentables**: Si, pidiendo a Pexels (gratis)
- **Atribucion**: Requerida pero flexible (no obligatoria en todos los casos segun licencia)
- **Licencia**: Pexels License - uso comercial permitido, sin atribucion obligatoria
- **Calidad**: Muy buena, imagenes de alta resolucion
- **Busqueda**: Por keyword, orientacion, tamaño, color
- **Video**: Si, tambien videos gratis
- **Idioma de busqueda**: Funciona en español

### PIXABAY API
- **Precio**: 100% GRATIS
- **Rate Limits**: 100 requests/minuto (bastante generoso = 6,000/hora)
- **Atribucion**: No requerida (pero apreciada)
- **Licencia**: Pixabay License - uso comercial libre
- **Calidad**: Buena, aunque variable (comunidad abierta)
- **Restriccion**: No hotlinking - debes descargar las imagenes a tu servidor
- **Busqueda**: Por keyword, categoria, color, orientacion
- **Video/Ilustraciones**: Si, tambien vectores e ilustraciones

### UNSPLASH API
- **Precio**: 100% GRATIS
- **Rate Limits Demo**: 50 requests/hora (bastante limitado)
- **Rate Limits Produccion**: 5,000 requests/hora (requiere aplicacion aprobada)
- **Atribucion**: OBLIGATORIA - debes dar credito al fotografo
- **Licencia**: Unsplash License - uso comercial permitido con atribucion
- **Calidad**: La mas alta de las tres - fotografias profesionales
- **Restriccion**: Las imagenes de archivos (images.unsplash.com) no cuentan contra rate limit

### Evaluacion Practica - Imagenes
**TODAS VIABLES. Recomendacion:**
1. **Pexels como primaria**: Mejor balance de rate limits, calidad, y sin atribucion obligatoria
2. **Pixabay como secundaria**: Rate limit mas alto, buena para busquedas masivas
3. **Unsplash para imagenes hero/destacadas**: Mejor calidad pero rate limit bajo en demo

**Estrategia**: Buscar en Pexels primero, fallback a Pixabay, Unsplash para imagenes editoriales/hero. Cachear todo localmente para no repetir llamadas.

**Fuentes:**
- [Free Image API Comparison 2026](https://blog.laozhang.ai/en/posts/free-image-api)
- [Pexels API Documentation](https://www.pexels.com/api/documentation/)
- [Pixabay API Documentation](https://pixabay.com/api/docs/)
- [Unsplash API Documentation](https://unsplash.com/documentation)

---

## 11. CLAUDE API (Anthropic)

### Pricing Actual (Abril 2026)

| Modelo | Input/MTok | Output/MTok | Uso ideal |
|--------|-----------|-------------|-----------|
| Haiku 4.5 | $1.00 | $5.00 | Tareas rapidas y baratas |
| Sonnet 4.6 | $3.00 | $15.00 | Balance calidad/costo |
| Opus 4.6 | $5.00 | $25.00 | Maxima calidad |

### Optimizaciones de Costo
- **Prompt Caching**: 90% descuento en tokens repetidos
- **Batch API**: 50% descuento (procesamiento diferido)
- **Combinados**: hasta 95% ahorro

### Costo Estimado para Descripciones de Producto
- Una descripcion de producto: ~200 tokens input + ~300 tokens output
- Con Haiku 4.5: ~$0.0002 + $0.0015 = $0.0017 por descripcion
- **1,000 descripciones con Haiku: ~$1.70 USD**
- **1,000 descripciones con Sonnet: ~$5.10 USD**

### Evaluacion Practica
**MUY VIABLE.** Haiku 4.5 es extremadamente barato para generar descripciones de productos. $1.70 por mil descripciones es insignificante. Calidad superior a LLMs locales. El Batch API reduce aun mas si no necesitas respuesta inmediata. Para un flujo de "enriquecer 50-100 productos por dia", el costo mensual seria $2-5 USD.

**Fuentes:**
- [Claude API Pricing - Official](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude API Pricing 2026 - Metacto](https://www.metacto.com/blogs/anthropic-api-pricing-a-full-breakdown-of-costs-and-integration)
- [Claude Pricing 2026 - Finout](https://www.finout.io/blog/claude-pricing-in-2026-for-individuals-organizations-and-developers)

---

## 12. OPENAI API

### Pricing Actual (Abril 2026)

| Modelo | Input/MTok | Output/MTok | Uso ideal |
|--------|-----------|-------------|-----------|
| GPT-4o-mini | $0.15 | $0.60 | El mas barato, buena calidad |
| GPT-4o | $2.50 | $10.00 | Alta calidad |

### Optimizaciones
- **Cached Input**: 50% descuento ($1.25/MTok para GPT-4o)
- **Batch API**: 50% descuento

### Costo Estimado para Descripciones
- Con GPT-4o-mini: ~$0.00003 input + $0.00018 output = $0.00021 por descripcion
- **1,000 descripciones con GPT-4o-mini: ~$0.21 USD** (!!!)
- **1,000 descripciones con GPT-4o: ~$3.50 USD**

### Evaluacion Practica
**MUY VIABLE. GPT-4o-mini es absurdamente barato.** A $0.21 por mil descripciones, podrías generar 10,000 descripciones al mes por $2.10 USD. La calidad es buena para descripciones de e-commerce. Es la opcion mas barata de las APIs cloud para este caso de uso.

**Fuentes:**
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [OpenAI API Pricing Docs](https://developers.openai.com/api/docs/pricing)
- [GPT-4o mini Pricing 2026](https://pricepertoken.com/pricing-page/model/openai-gpt-4o-mini)

---

## 13. LLMs LOCALES (Ollama)

### Disponibilidad
- **Ollama**: runtime gratuito, open-source, instalacion en un comando
- API compatible con formato OpenAI (drop-in replacement)
- Funciona en Windows, Mac, Linux

### Modelos Recomendados para Descripciones de Producto (2026)
- **Qwen 3.5 7B**: Mejor balance velocidad/calidad, ~4GB RAM
- **Phi-4 14B**: Muy buena calidad, ~8GB RAM
- **Llama 3.3 8B**: Solido all-around, ~5GB RAM
- **Llama 3.3 70B**: Calidad casi de frontera, ~40GB RAM (necesita GPU potente)

### Requisitos de Hardware
- **Minimo viable**: 8GB RAM, CPU moderno (modelos 7B con quantizacion 4-bit)
- **Recomendado**: 16GB RAM + GPU con 8GB VRAM (RTX 3060 o superior)
- **Ideal**: 32GB RAM + GPU 16GB VRAM

### Calidad
- Modelos 7B: 70-85% de la calidad de GPT-4o para texto generativo
- Modelos 14B+: 80-90% de la calidad
- Para descripciones de producto en español: funciona bien con buenos prompts, pero modelos pequeños pueden generar español inconsistente

### Costo
- **$0 por token** - solo electricidad y hardware
- Si ya tienes un PC con 16GB RAM y GPU decente, es literalmente gratis

### Evaluacion Practica
**VIABLE SI TIENES EL HARDWARE.** Si tu PC tiene 16GB RAM y una GPU decente, Ollama con Qwen 3.5 7B o Llama 3.3 8B genera descripciones de producto aceptables gratis. Sin embargo, dado que GPT-4o-mini cuesta $0.21 por 1,000 descripciones, la ventaja economica de correr localmente es minima salvo que generes volumen masivo. **La ventaja real es privacidad y no depender de internet/API externa.**

**Mi recomendacion honesta**: Usa GPT-4o-mini o Claude Haiku para produccion (mejor calidad, costo insignificante), y ten Ollama como fallback offline.

**Fuentes:**
- [Local AI in 2026: Ollama Benchmarks](https://dev.to/pooyagolchian/local-ai-in-2026-running-production-llms-on-your-own-hardware-with-ollama-54d0)
- [Best Local LLM Models 2026 - SitePoint](https://www.sitepoint.com/best-local-llm-models-2026/)
- [Ollama Library](https://ollama.com/library)

---

## 14. WOOCOMMERCE REST API

### Disponibilidad
- Incluida con WooCommerce (plugin gratuito de WordPress)
- API REST v3 (actual), basada en WordPress REST API
- Autenticacion via API Keys (generadas desde WooCommerce > Settings > Advanced > REST API)

### Que puedes hacer (CRUD completo)

**Productos:**
- Crear, leer, actualizar, eliminar productos
- Gestionar variaciones, atributos, categorias, tags, imagenes
- Productos simples, variables, agrupados, externos
- Batch operations (crear/actualizar hasta 100 productos por request)

**Ordenes:**
- Crear, leer, actualizar ordenes
- Gestionar estados (pending, processing, completed, etc.)
- Procesar reembolsos
- Notas de orden
- Filtrar por fecha, estado, cliente

**Clientes:**
- CRUD de clientes
- Historial de compras

**Reportes/Analytics:**
- Ventas por periodo
- Productos mas vendidos
- Revenue, pedidos, items vendidos
- Reportes de cupones

**Otros:**
- Cupones, zonas de envio, metodos de pago
- Impuestos, webhooks
- Settings del store

### Rate Limits
- No tiene rate limits propios (depende de tu servidor)
- En shared hosting: ~50-100 requests/segundo tipico antes de problemas
- En VPS dedicado: miles de requests/segundo

### Evaluacion Practica
**CRITICA Y GRATUITA.** WooCommerce REST API es la columna vertebral de tu plataforma. Todo lo que necesitas para gestionar la tienda programaticamente esta ahi: productos, ordenes, clientes, reportes. Es madura, bien documentada, y sin costo. Tu backend Spring Boot se comunicaria con esta API para sincronizar productos, procesar ordenes, y obtener metricas.

**Fuentes:**
- [WooCommerce REST API Documentation](https://developer.woocommerce.com/docs/apis/rest-api/)
- [WooCommerce REST API Complete Guide 2026 - BrainSpate](https://brainspate.com/blog/woocommerce-rest-api-developer-guide/)
- [WooCommerce REST API Docs v3](https://woocommerce.github.io/woocommerce-rest-api-docs/)

---

## 15. WORDPRESS REST API

### Disponibilidad
- Incluida en toda instalacion de WordPress desde version 4.7+
- Base URL: `https://tu-sitio.com/wp-json/wp/v2/`

### Endpoints Principales
- **Posts**: CRUD de entradas del blog (util para blog de marketing/SEO)
- **Pages**: CRUD de paginas
- **Media**: Subir, gestionar, eliminar imagenes y archivos
- **Users**: Gestion de usuarios
- **Categories/Tags**: Taxonomias
- **Comments**: Moderacion
- **Settings**: Configuraciones del sitio
- **Custom Post Types**: Si creas CPTs, obtienen endpoints automaticamente

### Usos Practicos para Dropshipping
- Publicar blog posts automatizados para SEO
- Gestionar imagenes de productos (subir via Media API)
- Gestionar paginas de landing
- Autenticacion de usuarios (si usas WP como auth)

### Evaluacion Practica
**UTIL pero secundaria.** La WordPress REST API complementa la WooCommerce API. La usarias principalmente para gestionar contenido no-comercial (blog posts, paginas, media). No es critica para el core del dropshipping pero si para automatizacion de contenido SEO.

**Fuentes:**
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WooCommerce REST API Integration Guide 2026 - Cloudways](https://www.cloudways.com/blog/woocommerce-rest-api/)

---

## 16. PLUGINS DE ANALYTICS PARA WOOCOMMERCE

### WooCommerce Analytics (Nativo, Gratis)
- Incluido desde WooCommerce 4.0+
- Dashboard con revenue, ordenes, productos, categorias, cupones
- Exportacion CSV
- WooCommerce 10.5 (Feb 2026) mejoro rendimiento con batch processing e importacion programada
- **API REST experimental** con cache para endpoints analiticos

### Plugins Gratuitos Recomendados
1. **StoreRadar**: Dashboards y charts rapidos, version gratuita disponible
2. **Hungry REST API Monitor**: Monitorea todas las llamadas REST API a tu WooCommerce (util para debugging)

### Plugins Pagos (para cuando haya presupuesto)
1. **Metorik**: El mejor dashboard analitico (~$20/mes para stores pequenos)
2. **Databox**: Dashboard de KPIs, conecta con WooCommerce

### Evaluacion Practica
**El analytics nativo de WooCommerce es suficiente para empezar.** Los datos disponibles via REST API cubren lo basico: ventas, ordenes, productos top, revenue por periodo. Para dashboards mas avanzados, StoreRadar (gratis) agrega visualizaciones. No necesitas plugins pagos al inicio.

**Fuentes:**
- [WooCommerce 10.5 Release - Analytics Improvements](https://developer.woocommerce.com/2026/02/06/woocommerce-10-5-improving-analytics-and-admin-performance/)
- [Best WooCommerce Reporting Plugins 2026 - WPBeginner](https://www.wpbeginner.com/showcase/best-woocommerce-reporting-plugins/)
- [StoreRadar - WordPress.org](https://wordpress.org/plugins/storeradar-analytics-for-woocommerce/)

---

## PLAN DE IMPLEMENTACION RECOMENDADO (Presupuesto Cero)

### Fase 1 - MVP (Costo: $0)
1. **WooCommerce REST API** - Gestionar productos y ordenes
2. **CJ Dropshipping API** - Fuente de productos y fulfillment
3. **Mercado Libre API** - Investigacion de mercado colombiano y precios
4. **Pexels/Pixabay API** - Imagenes complementarias gratuitas

### Fase 2 - Enriquecimiento (Costo: $2-5/mes)
5. **GPT-4o-mini o Claude Haiku** - Generacion de descripciones ($0.21-1.70 por mil)
6. **pytrends** - Deteccion basica de tendencias (gratis pero fragil)
7. **Unsplash API** - Imagenes hero de alta calidad

### Fase 3 - Expansion (Cuando haya revenue)
8. **AliExpress API** - Ampliar catalogo de proveedores
9. **Ollama** - LLM local para volumen masivo si aplica
10. **Metorik o StoreRadar Pro** - Analytics avanzados

### Lo que NO vale la pena ahora:
- Amazon PA-API (se depreca en dias)
- Shein (no hay API, riesgo legal)
- Spocket ($40+/mes sin retorno garantizado)
- Google Trends pagos (pytrends es suficiente para empezar)

---

## COSTO MENSUAL ESTIMADO DEL STACK COMPLETO

| Componente | Fase 1 | Fase 2 | Fase 3 |
|-----------|--------|--------|--------|
| Hosting WordPress/WooCommerce | $5-10* | $5-10 | $15-30 |
| APIs de datos (ML, CJ, imagenes) | $0 | $0 | $0 |
| IA para descripciones | $0 | $2-5 | $5-15 |
| Plugins analytics | $0 | $0 | $20 |
| **TOTAL** | **$5-10** | **$7-15** | **$40-65** |

*El hosting es el unico costo fijo inevitable. Un VPS basico en DigitalOcean/Hetzner cuesta $5-10/mes.
