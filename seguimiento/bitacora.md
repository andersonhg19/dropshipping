# Bitácora VISNEX

> Una entrada por sesión. Qué se hizo, qué quedó pendiente, qué se decidió y por qué.
> Formato tomado de Oh Churus, que lo tenía y este proyecto no.
> El plan vigente es `ANALISIS_Y_PLAN_2026-08-06.md`.

---

## 2026-08-07 — Retoma del proyecto: análisis, decisiones y Fases 0 y 1

**Contexto:** el proyecto llevaba congelado desde el 2026-07-10 (27 días sin commits,
contenedores apagados). Se retomó con un análisis completo verificado contra el código.

### Decisiones tomadas

| Decisión | Elección | Motivo |
|---|---|---|
| Estrategia | **Camino C**: operar primero, SaaS después | Cada problema resuelto operando es la feature que luego se vende. Se es el propio primer cliente |
| Diseño de tienda | **Home premium + landings COD aparte** | Dos públicos distintos. Regla: ningún anuncio pagado apunta a la home |
| Repositorio | **Sigue PÚBLICO** | Es la llave del portafolio de servicios del usuario |
| Secretos expuestos | **Rotar, no purgar historial** | Purgar rompe clones de un repo público. Rotando, los valores expuestos quedan muertos |

### Hallazgos del análisis (verificados contra el código)

- El corte funcional está **en la venta**: todo lo anterior (importar → enriquecer → precificar
  → publicar) está construido; todo lo posterior (orden → proveedor → despacho → tracking) no
  existe. Cero entidades `Order`/`Fulfillment`/`Shipment`.
- **Cero selectores CSS** para carrito, checkout y mi-cuenta en las 1.512 líneas del mu-plugin.
- El repo estaba **público con `.env` en el historial desde abril** (JWT, contraseñas de BD).
- `FileImportService` **sí está completo** (corrige la auditoría de julio): el corte está en la UI.
- Bug de idempotencia confirmado: los `FAILED` se guardaban con `active=true` y la comprobación
  de duplicado los leía → un fallo de red dejaba el producto imposible de republicar para siempre.
- **1 solo archivo de test** en todo el backend, contra 44 en Oh Churus (proyecto universitario).

### Fase 0 — Blindaje de seguridad ✅

- `.env` fuera de git + `.env.example` en backend y frontend.
- Secretos rotados: JWT (384 bits), PostgreSQL, MySQL, caché del frontend. `EXP_TIME` de 10 días a 24h.
- `docker-compose`: eliminados TODOS los defaults de secretos (`${VAR:?mensaje}` → falla al arrancar
  si falta, en vez de arrancar con clave conocida). Puertos internos solo en `127.0.0.1`.
  `audit-service` sin puerto publicado. `WORDPRESS_DEBUG=0`. Imágenes pinneadas.
- `audit-service`: creados `JWTAuthorizationFilter` y `SecParams` (no tenía ninguno). Lectura del
  log exige ADMIN.
- `administration-service` y `auth-service`: añadido `anyRequest().authenticated()` — sin esa línea,
  en Spring Security 6 todo endpoint no listado queda ABIERTO.
- `commerce` y `acquisition`: `/actuator/**` → solo `/actuator/health`.
- CORS del gateway: `"*"` + `allowCredentials` → lista explícita por `CORS_ALLOWED_ORIGINS`.
- Claves de WooCommerce parametrizadas en `test-data/`. Borrado el HTML con credenciales en claro.
- CI: `.github/` fuera del `.gitignore` (existía y nunca se ejecutó) + job de `secret-scan`.

### Fase 1 — Higiene y método ✅

- **Timeouts de RestTemplate** en los 3 `AppConfig` (5s conexión / 30s lectura). `aiRestTemplate`
  separado con 120s de lectura, porque Ollama en local es lento y no debe compartir timeout con
  las publicaciones.
- **Bug de idempotencia arreglado**: nuevo `findFirstBy...SyncStatusAndActive`. Solo una publicación
  `SYNCED` bloquea; los `FAILED` se **reutilizan** en el reintento en vez de acumular filas.
- **`updateProduct` (PUT)**: antes solo existía el POST de creación, así que cambiar el precio de un
  producto ya publicado nunca llegaba a la tienda. Nuevo endpoint `/v2/woocommerce/update`.
- **Tests: de 1 archivo a 19 tests en verde.**
  - `PricingCalculatorTest` reescrito con **valores exactos** (antes solo comprobaba `> 0`, que pasa
    igual de verde con una fórmula que cobre la mitad). Incluye un test que caza específicamente el
    error de calcular el margen sobre el costo en vez de sobre el precio de venta.
  - `WooCommercePublishServiceTest` nuevo, con tests de regresión del bug de idempotencia.
- Archivados 5 documentos obsoletos a `seguimiento/archivo/`.

### Pendiente

- Fase 4 (diseño) — **prioridad declarada del usuario**, en curso.
- Fase 2 (UI de mapeo de importación), Fase 3 (órdenes + Dropi).
- `visnex-common` sigue muerto (1 import, ~35 clases duplicadas). Sin decidir.
- `discovery-service` y `language-service`: propuesto quitar/congelar, sin ejecutar.
- `AuditLogClient` no propaga el JWT: por eso `/audit-log/create` sigue abierto en la red interna.

---

## 2026-08-07 (cont.) — Fases 4, 2 y 3: diseño, importación y núcleo de negocio

### Fase 4 — Diseño completo ✅ (prioridad declarada del usuario)

- **Tema hijo `visnex`** de Storefront. El CSS pasa de inyectarse inline en `wp_head`
  (1.512 líneas) a 7 archivos versionados y cargados condicionalmente por página.
- **`!important`: de 232 a 52.** Los 47 que estaban en clases propias `.vn-*` — donde nadie
  compite — se eliminaron programáticamente.
- **`funnel.css`**: 700 líneas para carrito, checkout y mi-cuenta, que antes tenían **cero**
  selectores.
- **Hallazgo importante:** WooCommerce 10.6 servía carrito y checkout **por bloques**, y los
  bloques no disparan los hooks PHP ni respetan `woocommerce_checkout_fields`. Ninguna
  personalización llegaba a ejecutarse. Se cambió a shortcode clásico.
- **Landing COD** (`page-landing-cod.php`): destino del tráfico pagado, con reglas opuestas a
  la home. Crea pedidos reales de WooCommerce con anti-duplicado y captura de UTM.
- **5 páginas legales** creadas automáticamente al activar el tema (Ley 1480/2011 y 1581/2012).
- **Bug que costó tiempo:** `$product` es el nombre que WooCommerce usa como global en el
  ámbito de plantilla y **se pierde al pasar por `get_header()`**. Renombrado a `$vn_product`.

### Fase 4b — Pagos y envíos Colombia ✅

Decidido con datos de la API oficial de WordPress.org, no con blogs:

| Plugin | Instalaciones | Rating | Actualizado |
|---|---|---|---|
| Mercado Pago | 100.000 | 3,9★ (691) | hace días |
| Wompi | 6.000 | 2,3★ (solo 4 reseñas) | may-2026 |
| Coordinadora | 600 | 2,5★ | jul-2026 |
| Mipaquete | 200 | 2,9★ | **mar-2025** |

- Mercado Pago y Wompi instalados y activos (pendientes de credenciales).
- **Plugin propio `visnex-colombia`**: pasarela COD con límites y exclusión por ciudad,
  método de envío por zonas desde Bogotá (sin convenio con transportadora ni API externa),
  y módulo de confirmación por WhatsApp.
- **Verificado en la tienda real**: matriz de 8 destinos correcta, envío gratis con exclusión
  de zonas caras, y un pedido creado de punta a punta desde la landing.

### Fase 2 — Asistente de importación ✅

El backend ya sabía importar; faltaba la pantalla. Ahora hay 3 pasos con auto-mapeo por
nombre de columna, vista previa de 5 filas ya emparejadas, y avisos de campo duplicado.

### Fase 3 — Núcleo de negocio (parcial) 🔶

- **Máquina de estados** `OrderStatus` con transiciones como datos, no como strings.
  La regla que no se puede saltar: `NUEVA → ENVIADA_PROVEEDOR` está **prohibida**.
- Entidades `SalesOrder` / `SalesOrderItem` (se llama SalesOrder porque ORDER es reservada en SQL).
- **`SupplierAdapter` + `DropiAdapter`**. Aviso: la API de Dropi no tiene documentación pública;
  los endpoints deben verificarse contra la documentación real antes de operar con dinero.
  Lo que sí está cerrado es la forma: contrato, mapeo, manejo de errores y tests.
- **Webhook de WooCommerce** con verificación HMAC en tiempo constante e idempotencia.
- **Métrica de CPA real** = CPA reportado ÷ tasa de entrega. Es la que decide si la operación
  gana o pierde plata, y ningún panel de dropshipping la muestra.

**Tests: de 1 archivo a 86 tests en verde.**

### Pendiente

- Scheduler de sincronización de stock y auto-despublicar en stock 0.
- Bandeja de órdenes en el panel Next.js (el backend ya expone la API).
- Router de fulfillment que envíe automáticamente a Dropi al confirmar.
- Flyway (sigue `ddl-auto=update`).
- Credenciales reales de Mercado Pago / Wompi / Dropi.
