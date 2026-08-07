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
