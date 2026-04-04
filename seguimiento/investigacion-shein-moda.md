# Investigacion: Shein y Opciones de Dropshipping de Moda para Colombia

**Fecha:** 2026-04-04
**Contexto:** Buscar toda via viable para trabajar con productos Shein o similares enfocado en ropa

---

## VEREDICTO RAPIDO

Shein NO tiene API publica ni programa de dropshipping oficial. PERO existen multiples caminos viables:

| Opcion | API | WooCommerce | Costo | Viabilidad |
|--------|-----|-------------|-------|------------|
| **CJ Dropshipping** | SI completa | SI nativo | Gratis | MUY ALTA |
| **EPROLO** | SI (plugin) | SI nativo | Gratis | MUY ALTA |
| Shein Affiliate (CJ/ShareASale) | Datafeed CSV | Con desarrollo | Gratis | MEDIA |
| DroFX (sync Shein) | API JSON/XML | Via export | Variable | ALTA |
| Importify | Multi-marketplace | SI nativo | $15-90/mes | ALTA |
| Apify Scraper | API completa | Con desarrollo | Desde $5/mes | ALTA |
| 1688.com via agente | API disponible | Con desarrollo | Gratis + agente | MEDIA-ALTA |

---

## 1. CANALES OFICIALES SHEIN - TODOS CERRADOS

- **Shein Open Platform**: Solo para vendedores DENTRO de Shein, no para extraer datos
- **Shein Marketplace**: Requiere $5 millones USD de facturacion anual. DESCARTADO.
- **Shein Wholesale**: Solo por invitacion, orientado a retailers establecidos
- **Dropshipping oficial**: NO EXISTE

---

## 2. PROGRAMA DE AFILIADOS - CAMINO VIABLE PARCIAL

Shein tiene programa de afiliados activo en:
- **CJ Affiliate** (Commission Junction) - Comision ~10-13.5%
- **ShareASale** - Comision ~10%
- **Awin**, **Admitad**, **FlexOffers**

**Lo importante**: Las redes de afiliados SI proporcionan **datafeeds de productos** en CSV con:
- Nombre del producto
- URL de landing
- Imagen grande y thumbnail
- Categoria
- Precio retail y precio oferta

**Limitacion**: Es modelo AFILIADO (comision por referir), no dropshipping (no controlas precio ni envio).

**Uso creativo**: Unirse a CJ Affiliate, descargar el datafeed CSV de Shein, y usar esos datos estructurados como fuente de investigacion de tendencias y precios. Luego sourcear productos similares via CJ Dropshipping.

---

## 3. HERRAMIENTAS DE IMPORTACION WOOCOMMERCE

### Shein Product Importer (Plugin WooCommerce)
- Importa productos de Shein a WooCommerce via extension Chrome
- Importa: nombre, imagenes, videos, precio, categorias, variaciones, descripcion, resenas
- Soporta shein.com.co (Colombia)
- **Sin sync automatico** de precios/stock
- Costo: ~$49 (una vez)

### Importify (Plugin WooCommerce)
- Importa de +25 marketplaces incluyendo Shein, AliExpress, Temu, CJ Dropshipping, 1688
- Editor AI de descripciones, reglas de pricing, gestion de variantes
- Costo: $15-90/mes

### DroFX
- Sincroniza precios y stock de Shein automaticamente
- Exporta en CSV, Excel, XML, JSON
- **Tiene API** para datos estructurados
- Incluye scheduler y traduccion automatica

---

## 4. ESTRATEGIA RECOMENDADA: "MISMAS FABRICAS, SIN SHEIN"

**Concepto clave**: Las fabricas de Guangzhou/Shenzhen que producen para Shein TAMBIEN venden a traves de CJ Dropshipping, 1688, y EPROLO. Mismos productos, sin las restricciones de Shein.

### Flujo recomendado:
1. **Identificar tendencias en Shein** (ver que se vende, que categorias, que estilos)
2. **Buscar productos equivalentes en CJ Dropshipping** (API gratuita, mismas fabricas)
3. **EPROLO como respaldo** (gratis, WooCommerce nativo, branding propio)
4. **Enriquecer con IA** (descripciones, SEO)
5. **Publicar en WooCommerce** con fotos propias o del proveedor (no de Shein)

### Por que NO usar fotos de Shein directamente:
- Shein es AGRESIVO con DMCA takedowns
- Han enviado miles de notices de copyright contra Temu
- Si usas fotos de Shein, pueden tumbar tu tienda
- **Solucion**: Usar fotos de CJ/EPROLO (sus fotos) o comprar muestras y fotografiar

---

## 5. DATO CRITICO: IMPUESTOS COLOMBIA 2026

Desde 2026, compras internacionales >$50 USD pagan **IVA del 19%** en Colombia (antes era >$200 USD).

**Impacto**: Un pedido tipico de ropa ($30-80 USD) facilmente supera el umbral.

**Estrategia**: 
- Focalizarse en pedidos menores a $50 USD
- O absorber el IVA en el margen
- O comprar en bulk y despachar localmente (modelo hibrido)

---

## 6. PLATAFORMAS ALTERNATIVAS CON API (Moda)

### CJ Dropshipping (PRINCIPAL)
- API completa: developers.cjdropshipping.com
- WooCommerce nativo
- Catalogo masivo de moda
- Sourcing personalizado (les das foto, ellos buscan la fabrica)
- Branding propio (empaques con tu marca)
- Envio a Colombia: 5-15 dias
- **GRATIS**

### EPROLO (RESPALDO)
- Plugin nativo WordPress (wordpress.org/plugins/eprolo-dropshipping/)
- +3,000 estilos nuevos por semana en moda
- Branding personalizado sin MOQ
- **GRATIS**

### Modalyst
- +10 millones de productos, fuerte en moda
- WooCommerce nativo
- Sync automatico
- Freemium

### FashionTIY
- Wholesale de moda barata, 70% mas barato
- Sin minimo de orden
- Sin API formal pero dropshipping directo

### 1688.com (via CJ como agente)
- Marketplace wholesale donde estan las MISMAS fabricas de Shein
- Busqueda por imagen (tomas foto de Shein, encuentras la fabrica)
- CJ Dropshipping actua como intermediario/agente

---

## FUENTES VERIFICADAS
- SHEIN Developer Platform: open.sheincorp.com
- CJ Dropshipping API: developers.cjdropshipping.com
- EPROLO: wordpress.org/plugins/eprolo-dropshipping/
- Shein Product Importer WooCommerce
- DroFX: drofx.com/suppliers/shein/
- Importify: wordpress.org/plugins/importify/
- CJ Affiliate Product Feeds: developers.cj.com/docs/data-imports/product-feeds
- Apify Shein Scraper: apify.com/axlymxp/shein-scraper/api
- IVA Colombia 2026: infobae.com (Sep 2025)
- Shein Copyright DMCA: smartprotection.com
