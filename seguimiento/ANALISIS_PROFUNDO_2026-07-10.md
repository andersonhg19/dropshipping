# ANALISIS PROFUNDO VISNEX — 2026-07-10

> Auditoria integral realizada con 5 analisis paralelos: seguridad, backend/modelo de negocio,
> limpieza/redundancia, diseno/UX, e investigacion de competidores en internet.
> Estado del repo al momento del analisis: rama `develop`, 22 commits sin push,
> cambios sin commitear en `visnex-style.php` (+1512 lineas) y `test-data/assign-images*`.

---

## 1. VEREDICTO GENERAL

VISNEX esta bien construido como **gestor de catalogo + enriquecimiento IA + publicacion a WooCommerce**,
pero le falta el **nucleo operativo del dropshipping**: cuando un cliente compre en la tienda,
hoy no pasa NADA — no hay ordenes, ni reenvio al proveedor, ni tracking, ni sincronizacion de stock.
Ademas hay 5 hallazgos de seguridad CRITICOS (secretos reales commiteados en git) que deben
resolverse antes de cualquier despliegue publico.

Lo que ya esta bien y hay que conservar:
- Backend por capas consistente (entity/repo custom/mapper/service/controller), Criteria API sin SQL injection, BCrypt.
- Frontend: onboarding wizard conectado, skeletons/empty states, tabs en detalle de producto, infra de dark mode y formato COP (aunque infrautilizadas).
- Tienda: hero + Ken Burns, prefers-reduced-motion, trust bar, editorial split.
- .gitignore raiz correcto (no hay builds commiteados); WordPress core correctamente fuera de git.
- PricingCalculator con formula coherente (BigDecimal, IVA con umbral, margen sobre precio de venta).

---

## 2. SEGURIDAD (accion inmediata)

### CRITICOS
| # | Hallazgo | Ubicacion | Remediacion |
|---|----------|-----------|-------------|
| S1 | `backend/.env` y `frontend/.env` COMMITEADOS con secretos reales (POSTGRES_PASSWORD=Visnex2026, SECRET=visnex@secret.key, WC ck_/cs_ reales) | git ls-files lo confirma; .gitignore solo cubre .env.local | `git rm --cached`, anadir `.env` a .gitignore, crear `.env.example`, ROTAR todo, purgar historial (BFG/filter-repo) antes de hacer publico el repo |
| S2 | Secreto JWT debil y por defecto (`visnex@secret.key`) compartido por 6 servicios — permite falsificar tokens ADMIN | docker-compose.yml L122,143,164,185,206,226 | Secreto aleatorio >=256 bits, sin default (fallar arranque si falta) |
| S3 | Credenciales BD por defecto en compose (Visnex2026, vnroot2026, vnpass2026) | docker-compose.yml L24,39,41 | Sin defaults, exigir env vars |
| S4 | `docs/VISNEX-Documentacion-Completa.html` publica TODAS las credenciales en claro (admin Visnex123, BD, WC keys, JWT secret) | L548,557,563-564,573,582-583,593,615,666,1565 | Reemplazar por placeholders, rotar todo |
| S5 | audit-service SIN filtro JWT: `/v2/audit-log/**` permitAll y sin JWTAuthorizationFilter — audit log publico y falsificable | audit-service SecurityConfig.java L19-20 | Anadir filtro, restringir a red interna |

### ALTOS
- SecurityConfig de auth, administration y language SIN `anyRequest().authenticated()` → endpoints no listados quedan ABIERTOS (Spring Security 6). Commerce y acquisition si lo tienen.
- JWT de 10 dias (EXP_TIME=864000000) sin refresh token ni revocacion.
- CORS del gateway: `allowedOriginPatterns: "*"` + `allowCredentials: true` → cualquier sitio hace requests autenticados.
- Microservicios publicados al host (8842-8847) saltandose el gateway; el gateway NO valida JWT (la doc dice que si — es falso).
- Claves WooCommerce hardcodeadas en 6 scripts de test-data/.
- API keys de IA en texto plano en BD (EnrichmentConfig.apiKey) y devueltas por la API de config.
- JWT en localStorage (frontend) → robable via XSS; ademas cripto legacy (createCipher deprecado).
- Contenedores backend corren como root (frontend si tiene usuario nextjs).

### MEDIOS
- FileImportService: tipo por extension, sin limite de tamano antes de parsear (OOM/DoS); limite de 5000 filas se aplica DESPUES de cargar en memoria.
- CSV formula injection en export (valores que empiezan por = + - @).
- Prompt injection en AiEnrichmentService (titulo/descripcion/tags concatenados al prompt sin delimitar).
- WORDPRESS_DEBUG=1; Basic auth WooCommerce sobre HTTP sin TLS; imagenes wordpress/phpmyadmin :latest sin pin.
- Eureka sin auth expuesto en 8840; BD expuestas al host (5433/3307); phpMyAdmin expuesto (8851) con root conocido.
- Actuator con permitAll en commerce/acquisition; Swagger publico.
- Seed de admin: usersData.json con hash NO-BCrypt versionado; LoadData guarda passwords sin encodear (L271).

---

## 3. VACIOS FUNCIONALES DEL NEGOCIO (el gap real)

| # | Vacio | Sev | Detalle |
|---|-------|-----|---------|
| N1 | **NO existe gestion de pedidos/fulfillment/tracking** | CRITICO | Cero entidades Order/Fulfillment/Shipment en todo el backend. El ciclo post-venta completo esta ausente: recibir orden de WooCommerce → reenviar a proveedor → pagar → tracking → notificar cliente. |
| N2 | **NO hay sync de stock/precio proveedor→tienda** | CRITICO | SourceProduct ni Product tienen campo stock. SourceConfig tiene apiKey/lastSync pero ningun codigo los consume. Unico @Scheduled del backend: limpieza de audit logs. Se venden productos agotados sin enterarse. |
| N3 | **NO hay adapters reales de proveedores** | CRITICO | CJ/MercadoLibre/EPROLO solo existen como textos de ejemplo en Swagger. Unica ingesta real: FileImportService (CSV/XLSX/JSON). |
| N4 | Product NO soporta productos propios de verdad | ALTO | supplier/source son nullables (bien), pero faltan: sku, barcode, stockQuantity, peso/dimensiones, y flag productType (DROPSHIPPING vs OWN) para bifurcar fulfillment. |
| N5 | Multi-canal es fachada | ALTO | PublishChannel es generico pero el unico publisher es WooCommercePublishService. No hay Meta/MercadoLibre. |
| N6 | Sin retorno de ventas/analytics desde WooCommerce | ALTO | No hay webhooks WC registrados ni poller de /wc/v3/orders. |

### Robustez de integraciones
- **WooCommercePublishService**: BUG de idempotencia — un publish FAILED se guarda active=true y el chequeo de duplicado bloquea el reintento ("already published"). RestTemplate SIN timeouts (hilo colgado si WC no responde). No hay update/re-sync de productos ya publicados.
- **AiEnrichmentService**: sin timeout (Ollama colgado satura los 5 slots concurrentes); presupuesto check-then-act no atomico; findAll() de toda la tabla por cada producto.
- **SendToCommerce**: PIERDE imagenes, categoria, variantes y supplierName al transferir (solo envia title/description/basePrice/currency/source*/tags). Logica en el @RestController, sin timeout/retry/transaccion.

### Calidad transversal
- `visnex-common` esta MUERTO: 0 imports de com.visnex.common en todo el backend; ~35 clases duplicadas en 6 servicios (ResultDTO, PageDTO, JWTAuthorizationFilter, ConnectInternalApi, BaseMapper, PredicateBuilderUtil, Params, SecParams).
- @Transactional ausente en ServiceImpl core (FileImport guarda N productos sin transaccion; estado parcial ante fallo).
- N+1 cross-service en CompletionUtils (pagina de 20 productos = hasta 60 llamadas HTTP a administration); cache ConcurrentHashMap sin TTL ni tope.
- Sin @RestControllerAdvice global; catches que solo loguean e.getMessage() (se pierde stack trace); catch(ignored){} en WooCommerce L74.
- PricingCalculatorTest debil: solo asserta >0/notNull, no valores exactos — no detecta regresiones de formula.
- ddl-auto=update sin perfiles dev/prod; sin Flyway/Liquibase; sin tuning HikariCP.

---

## 4. DISENO / UX

### Tienda WordPress (P0 = impacto directo en ventas)
- **P0-1: Carrito, checkout y mi-cuenta con CERO estilos** — el usuario navega premium y cae en Storefront default justo en el embudo de pago.
- **P0-2: Sin busqueda ni filtros talla/color** — en moda no se compra sin filtros; ademas se oculto la ordenacion sin reemplazo.
- **P0-3: Enlaces legales muertos** (href="#" en privacidad/terminos; devoluciones inexistente) — riesgo legal + confianza.
- **P0-4: Precio gris de bajo contraste** (#86868B, falla WCAG AA) en PDP.
- P1: PDP no es el 60/40 sticky del spec (solo restyle del template default, sin selector de tallas ni acordeones); reviews OCULTAS (display:none — se elimino prueba social); menu movil y busqueda default de Storefront; sin hover-swap de segunda imagen ni wishlist en las cards; "Vista Rapida" es decorativa (pointer-events:none); newsletter con boton sin handler.
- Faltan 2 secciones del spec: Coleccion destacada (80vh parallax) y Marcas.
- Deuda: cientos de !important contra Storefront, CSS inline no cacheable en wp_head, escala tipografica difiere del spec (base 14px vs 16px), tokens --vn-tracking/--vn-space no implementados (literales magicos), imagenes Unsplash hotlinked como contenido "de produccion".
- **Recomendacion arquitectonica**: migrar de mu-plugin monolitico (1.5k lineas) a child theme de Storefront (style.css versionado + overrides de templates para PDP/carrito/checkout).

### Panel admin (Next.js)
- Flujo de importacion CORTADO A LA MITAD: subes CSV y el mapeo de columnas dice "proximamente" — no se puede importar realmente desde la UI.
- Errores de fetch tragados en silencio (dashboard muestra 0s como si fueran reales); alert() nativo en import.
- Precios estilo USD `$59900.00` pese a existir formatCurrency es-CO/COP sin usar (useFormatNumber).
- Dark mode roto en products/list y [id] (blancos hardcodeados); APPLE_BLUE y STATUS_COLORS duplicados por archivo.
- i18n infrautilizado: products/[id], import y onboarding 100% espanol hardcodeado; el 'en' esta muerto.
- Botones sin handler: "Buscar imagenes libres", "Subir imagen", "Test Connection", reordenar imagenes, tab Historial.
- Onboarding: idCompany:1/idSubsidiary:1 hardcodeados (multi-tenant roto); localStorage por navegador, no por usuario.

---

## 5. LIMPIEZA / REDUNDANCIA (plan propuesto — pendiente de aprobacion)

### Borrar seguro (riesgo nulo/bajo)
1. Disco regenerable: frontend/.next (936 MB) + node_modules (887 MB) + backend targets (610 MB) ≈ 2.4 GB.
2. test-data: assign-images.js y assign-images.sh (superados por assign-images-v2.js, la version buena — renombrarla a assign-images.js). Parametrizar las claves WC por env var.
3. WordPress en disco: temas twentytwentythree/four/five (~13.6 MB), hello.php; uploads de prueba (78.6 MB) si el entorno es desechable.
4. Frontend deps con 0 usos: `install`, `jaeger-client`, `@mui/x-charts` (se usa recharts), `exceljs` (se usa xlsx), @types stubs (exceljs/xlsx/jspdf). Validar con yarn build.
5. `backend/frontend/src/core/api/acquisition/source-product/get-all-source-product-api.tsx` — archivo .tsx commiteado dentro del arbol backend, mal ubicado.

### Consolidar (decision tomada: recomendacion)
6. **visnex-common**: adoptarlo de verdad (migrar imports y borrar ~35 clases duplicadas) — el estado actual es lo peor de ambos mundos.
7. **Docker**: 5 composes → 1 con `profiles:` (infra/wp/services/frontend). CLAUDE.md ya trata el monolito como canonico.
8. **seguimiento/**: mover a `seguimiento/archivo/` los docs obsoletos (PLAN_MAESTRO con puertos viejos 8760/8820/8830, PROPUESTA_2_SERVICIOS ya implementada, ANALISIS_REVISION_PLAN_V2, ANALISIS_10_PERCENT, prompt inicial). Conservar: investigaciones, PUNTOS_CRITICOS, DESIGN_SPEC.
9. CLAUDE.md: corregir la referencia rota a la bitacora (dropshipping-saas-changelog.md no existe) y el estado "iniciando construccion".

### Decisiones a tomar
10. `.github/` esta en .gitignore → el workflow ci.yml existe pero NUNCA se ejecuta. Activar CI (quitar del ignore y commitear) o borrarlo.
11. `.claude/settings.local.json` trackeado — deberia salir de git.
12. docs/VISNEX-Documentacion-Completa.html: ademas de exponer credenciales (S4), probablemente es un derivado; decidir si se regenera limpio o se elimina.
13. Plugins WP sin configurar: akismet, wp-super-cache, Yoast — conservar solo los que se usaran.

---

## 6. INVESTIGACION DE COMPETIDORES (julio 2026) — lecciones

### Mercado
- **AutoDS** (~$20/mes): el referente. Fulfillment desatendido, monitoreo precio/stock cada hora con repricing, TikTok Shop, IA de creatividades (imagenes + video UGC).
- **DSers** (free funcional): bulk ordering 100+ ordenes/clic a AliExpress, supplier optimizer.
- **Zendrop** ($49-79/mes): envio US 2-5 dias, private label, AI video UGC <$20.
- **CJ Dropshipping**: SIN cuota mensual, plugin WooCommerce oficial con sync stock/precio y forwarding automatico de ordenes.
- **Ecosistema COLOMBIANO de dropshipping COD** (el hallazgo clave): **Dropi** (lider: 50k emprendedores, 160k+ productos locales, entrega 24-72h, COD nativo, comision 5%, plugin WooCommerce "Dropify"), Mastershop, Effi, Hoko. En el nicho dropshipping por ads en Colombia, el contra entrega es 40-65% de las ventas. Rocketfy/Triidy/Elenas ya murieron — mercado consolidado.
- Meta elimino el checkout nativo (ago 2025): Instagram/Facebook Shop ahora redirige al checkout del sitio propio → FAVORECE el modelo VISNEX (solo sincronizar catalogo via feed/Catalog API). Facebook Marketplace: sin API publica, descartar. MercadoLibre: abierto a integradores (adaptarse al modelo User Product 2026). TikTok Shop Colombia: beta por lista de espera, preparar pero no depender.

### Top lecciones accionables (por impacto)
1. **Fulfillment automatico con CJ API v2** — implementable HOY: getAccessToken → createOrder (payType=2 saldo CJ) → webhooks (producto/stock/orden/logistica) → trackInfo → tracking a WooCommerce. CJ publica ejemplo de listener en Spring Java.
2. **Integrar Dropi como segundo proveedor de primera clase** — catalogo internacional (CJ) + local COD (Dropi) en un panel: NADIE lo ofrece.
3. **COD como ciudadano de primera clase**: formulario COD 1-clic estilo Releasit + verificacion OTP WhatsApp contra ordenes falsas.
4. **freightCalculate de CJ en el pricing landed** — flete real por variante/destino en vez de estimado; monitoreo periodico + repricing.
5. **Modelo hibrido desde el esquema**: campo fulfillmentOrigin por producto (OWN | CJ | DROPI) + router de ordenes que divide cada orden por origen.
6. **IA: subir de texto a creatividades** (imagen producto + video UGC) — con Ollama/modelos locales a costo marginal 0, ventaja estructural.
7. **Meta Shops como escaparate** (feed catalogo → checkout en WooCommerce); MercadoLibre antes que TikTok Shop.
8. **Pagos Colombia**: Wompi (Nequi 1.79%) + Addi BNPL (plugin WC oficial, 0% hasta $600k en 3 cuotas — perfecto ticket moda); logistica propia via UN agregador (Enviame/99Envios/Mipaquete).
9. **UX**: dashboard que empieza en descubrimiento de producto ("que vendo hoy"), no en CRUD; cola de ordenes con semaforo de estados y acciones en bloque; ayuda contextual embebida.

---

## 7. ROADMAP PROPUESTO (orden recomendado)

**Fase A — Seguridad + higiene (1-2 sesiones, bloqueante)**
Sacar .env de git + rotar secretos + placeholders en docs HTML; cerrar audit-service y anyRequest() faltantes; CORS explicito; no exponer puertos de servicios/BD; plan de limpieza (seccion 5).

**Fase B — Nucleo operativo dropshipping (el verdadero MVP, 6-10 sesiones)**
1. Modulo de ordenes en commerce-service: Order/OrderItem/Fulfillment/Shipment + maquina de estados + webhook receptor de WooCommerce (order.created).
2. Adapter CJ (SupplierAdapter interface): catalogo, stock, freightCalculate, createOrder, trackInfo, webhooks.
3. Sync stock/precio con scheduler + auto-despublicar en stock 0; campo stock en SourceProduct/Product.
4. Fixes de robustez: timeouts RestTemplate, bug idempotencia WC publish, SendToCommerce completo (imagenes/variantes/categoria), @Transactional.

**Fase C — Conversion de la tienda (2-4 sesiones)**
Checkout/carrito/cuenta estilizados (migrar a child theme), busqueda + filtros talla/color, paginas legales reales, reviews visibles, precio COP bien formateado, pasarela Wompi + Addi, COD con OTP.

**Fase D — Diferenciales (post-MVP)**
Dropi como proveedor local COD; productos propios (sku/stock/productType + router de fulfillment); Meta catalog feed; MercadoLibre; creatividades IA; completar UI (mapeo de import, botones muertos, i18n, dark mode).

---

*Detalle completo de cada hallazgo (archivo:linea) disponible en los reportes de auditoria de esta sesion.*
