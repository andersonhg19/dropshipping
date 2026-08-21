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

---

## 2026-08-20 — La tienda se veía vacía y lenta: causa raíz, diseño e imágenes

**Contexto:** al levantar el WordPress, la tienda tardaba **18 segundos** en responder
y la portada se veía vacía: hero gris, tarjetas de categoría grises y media sección
"Nuestra Historia" en blanco. Ninguna de las dos cosas era lo que parecía.

### Las tres causas raíz

| Síntoma | Causa real | Cómo se encontró |
|---|---|---|
| 18 s de TTFB, incluso en un 302 sin cuerpo | El bind mount de Windows: leer 500 ficheros del contenedor tardaba **31 s** (62 ms/fichero). Con `opcache.validate_timestamps=On` y `revalidate_freq=2`, OPcache hacía `stat()` de ~1.500 ficheros por petición contra ese mount | Se midió dentro del contenedor comparando la capa de imagen (3 ms) con el mount |
| Portada "vacía" | El tema buscaba `assets/img/hero.jpg`, `cat-mujer.jpg`, `editorial.jpg`… y si no existían **pintaba un degradado**. Esas fotos nunca se subieron. El fallback silencioso convirtió "falta contenido" en algo que parecía diseño | Leyendo `visnex_img()` en `inc/home-sections.php` |
| Toda la tienda inaccesible | `woocommerce_coming_soon = yes` con `store_pages_only`: **cada página de categoría y la tienda entera** servían la pantalla "Tenemos grandes proyectos por anunciar". La portada funcionaba, así que no se notaba | Abriendo `/product-category/mujer/` |

La tercera es la más grave y llevaba ahí desde el principio: **el catálogo entero
estaba oculto al público y nadie lo sabía**, porque el único sitio que se miraba
—la portada— quedaba fuera del modo "próximamente".

### Rendimiento

`wordpress/config/opcache.ini` (nuevo, montado en el compose): `validate_timestamps=0`,
`max_accelerated_files=30000` (4.000 se quedaba corto: solo `wp-content` tiene 10.901
ficheros), 256 MB de memoria.

El precio es que al editar un `.php` hay que recargar PHP:
`wordpress/config/recargar-php.sh`. No hace falta para CSS, imágenes ni para nada
que se cambie desde el administrador.

Con eso el sitio bajó a 1,7 s **en inglés**. Al instalar el español volvió a subir a
4-9 s, y ahí apareció la segunda mitad del problema: los **11 MB y 323 ficheros de
traducción** que WordPress lee en cada petición, también desde el mount. Se movieron
a un volumen de Docker (`wp-languages` en el compose) — es una carpeta que gestiona
WordPress solo, no algo que se edite a mano.

| Momento | Portada | Arranque (`wp-login.php`) |
|---|---|---|
| Al empezar | **18 s** | 18,6 s |
| Con OPcache afinado (en inglés) | 1,7 s | — |
| Al instalar el español | 4-9 s | 5,5 s |
| Traducciones en volumen (español) | **2,6 s** | 2,3 s |

**18 s → 2,6 s, siete veces más rápido y ya en español.**

Lo que queda de esos 2,6 s sigue siendo el bind mount: `wp-content` tiene 97 MB de
plugins y 10.901 ficheros. Se cierra moviéndolo también a un volumen y dejando en el
repo sólo el tema y el plugin propios. **No se hizo**: cambia la estructura del
proyecto y esa decisión no es técnica.

Se descartó activar el caché de página (WP Super Cache está instalado pero inerte
porque nadie definió `WP_CACHE`): serviría páginas en ~50 ms, pero enmascara los
cambios mientras se sigue editando la tienda. Queda anotado como el siguiente paso
cuando la tienda esté quieta.

### Nueve variables CSS que no existían

`home.css` llamaba a `--vn-font-primary`, `--vn-font-editorial`, `--vn-accent`,
`--vn-container-pad`, `--vn-radius-pill`, `--vn-text-md`, `--vn-text-7xl`,
`--vn-transition` y `--vn-fashion`. **Ninguna estaba definida en `tokens.css`**, así
que las 36 declaraciones que las usaban eran inválidas y el navegador las descartaba
en silencio: los títulos de sección salían en Inter en vez de Playfair, el hover del
menú no cambiaba nada y varias secciones perdían su padding lateral.

Se arregló con alias en `tokens.css` —una línea por variable— en vez de renombrar 36
puntos de llamada.

### Tres bugs de maquetación heredados de Storefront

1. `ul.menu` con `margin-left: -1em` sin resetear: el primer ítem del menú quedaba
   cortado por el borde y se leía **"NICIO"**.
2. `.col-full` de la cabecera sin padding: el logotipo pegado al borde de la pantalla.
   `home.css` ponía `padding: 0 !important` para el ancho completo del cuerpo y
   arrastraba también la cabecera.
3. `.site-header` con `margin-bottom: 4.235801032em` (67,77 px): una franja blanca
   entre la barra y el contenido **en todas las páginas**.

### Diseño

- **Portada partida Ella / Él.** El catálogo tiene 94 prendas de mujer y 60 de hombre,
  y la portada anterior sólo enseñaba mujer: quien entraba buscando ropa de hombre no
  tenía ninguna señal de que la hubiera hasta el menú.
- **Banda deslizante** con las tres promesas que deciden una compra contraentrega.
- **Rejilla de categorías de 6 tarjetas** sobre 12 columnas (6+6 / 3+3+3+3). Con 6
  columnas, "Accesorios" se quedaba sola descolgada en una tercera fila.
- **Lookbook doble**, **banda de temporada** y **"Nuestra historia"** con foto real.
- Una sola voz tipográfica: los títulos de sección pasan a Playfair.
- El recuento de las tarjetas usa `include_children`: `$term->count` sólo cuenta los
  productos asignados directamente, así que "Mujer" anunciaba **2 prendas** en vez de 94.

### Imágenes

13 fotos editoriales curadas (Unsplash, licencia de uso comercial), recortadas al
tamaño de cada hueco y servidas en **WebP con respaldo JPEG**: 3.225 KB → 1.250 KB,
**un 61 % menos**.

Todas están en la biblioteca de medios y son **editables desde Apariencia →
Personalizar → VISNEX — Portada** (`inc/customizer.php`, nuevo). Las del tema quedan
como valor por defecto: si se borra la elección, la portada no se rompe.

### Datos del catálogo

| Qué | Antes | Ahora |
|---|---|---|
| Modo "próximamente" | Toda la tienda oculta | Desactivado |
| Idioma | WooCommerce en inglés ("Add to cart") | es_ES, con paquetes de WooCommerce, Yoast y Storefront |
| Menú | 10 ítems duplicados, varios sin enlace, y un segundo listado con **todas** las páginas (Cart, Checkout, My account, Sample Page) | Inicio · Mujer (8 hijas) · Hombre (7) · Tienda · Novedades |
| Tildes | Ninguna en todo el catálogo | 34 títulos, 19 descripciones, 17 extractos |
| Duplicados | 47 productos repetidos, visibles uno al lado del otro | A borrador. En **47 de 47** grupos la regla era la misma: el duplicado tardío no tenía descripción |
| Productos de prueba | 5 "Producto Premium Test" **publicados** | A borrador |
| Publicados | 153 (106 únicos) | 101, todos únicos |
| Recorte de miniatura | Cuadrado 324×324 | 3:4 vertical, 450 px |

### Pendiente / decisiones que no son mías

- **Fotos de producto reales.** 4 productos quedaron con imágenes *aproximadas* y
  "Portafolios Cuero Negro" sin foto: no hay stock que coincida. Y el catálogo ya
  traía desajustes (una foto de abdominales en "Traje Baño Negro"). Esto no se
  arregla con banco de imágenes: lo tiene que resolver el importador trayendo las
  fotos del proveedor.
- **Mover `wp-content` a un volumen de Docker** para cerrar el 1,7 s restante.
- **Renovar credenciales** de Mercado Pago / Wompi / Dropi (sigue pendiente de antes).

---

## 2026-08-20 (cont.) — Que se sienta caro: movimiento, papel y dos mercados

**Encargo:** que la tienda transmita lo que transmite un restaurante caro —que
todo se perciba fino— vendiendo prendas de diario a precio bajo. Y dos
condiciones nuevas: **España y Colombia**, y una portada **que no caduque**.

### La tesis

Lo que se percibe como caro no es "tener animaciones". Es el **ritmo** con el que
aparecen las cosas y que **nada rebote**. Una puerta pesada se abre rápido y
frena largo; una barata golpea. Todo el sistema usa esa curva
(`cubic-bezier(0.22, 1, 0.36, 1)`) y duraciones de 0,9-1,2 s, no de 0,3 s.

### Técnicas, todas nativas

Cero librerías, y no por purismo: una web lenta no se siente cara.

| Técnica | Para qué |
|---|---|
| `animation-timeline: view()` / `scroll()` | Apariciones y barra de progreso atadas al scroll real, ejecutadas **fuera del hilo principal**. Con respaldo de IntersectionObserver donde no exista |
| `@view-transition { navigation: auto }` | Transiciones **entre documentos**. La cabecera y el pie llevan `view-transition-name`, así que no parpadean: pasar de la portada a una ficha deja de parecer una recarga |
| `@property` | Permite interpolar porcentajes: el barrido del subrayado y el brillo que cruza el CTA |
| `@starting-style` | Estado de entrada sin que JS ponga una clase — evita el parpadeo de "se ve, se esconde, aparece" |
| `linear()` | Curvas de varios tramos sin JavaScript |
| `@container` | La tarjeta de producto se adapta a **su** hueco, no a la ventana |
| `content-visibility` | No maquetar lo que aún no se ve |
| `feTurbulence` en SVG embebido | Grano de papel al 3,5 %. Cero peticiones, cero KB de imagen |

Verificado en Chrome 151: las ocho soportadas. 29 elementos con aparición,
8 titulares partidos en 34 palabras enmascaradas, cursor y barra de progreso.

**Regla que no se rompe:** nada de esto es imprescindible. Si falla, si el
navegador es viejo o si el usuario pide menos movimiento, la tienda se ve entera
y se puede comprar. Lo único que se pierde es la ceremonia.

### Papel, no pantalla

El blanco puro y el negro puro son los valores por defecto de todo y leen como
"plantilla". Ahora: papel `#FAF8F4`, tinta `#12110F` y un único acento de
**latón** `#8A6A3B` en filetes y foco. Latón y no oro: el oro saturado lee como
bisutería y como oferta.

**Reparto 60/30/10** y una regla que lo gobierna: *en una tienda de ropa el único
color debe ser la prenda*. Un botón azul o un badge rojo compiten con la foto del
producto, y el que pierde siempre es el producto. Además es lo que hace que la
página no caduque: los colores de marca son lo primero que envejece.

**Cohesión de campaña:** las fotos de escenografía llevan un grado unificado
(`saturate(.9) contrast(1.05)`) para que un bodegón y una foto de calle parezcan
la misma marca. Al pasar el ratón recuperan su color. **Nunca se aplica a la foto
de un producto**: ahí el color tiene que ser el real.

### Dos mercados y una portada que no caduca

| Antes | Ahora | Por qué |
|---|---|---|
| "Envío gratis desde $150.000" | "Envíos a España y Colombia" | Una cifra en pesos no significa nada en Madrid |
| "Nequi, PSE y tarjetas" | "Tarjeta, transferencia y contra entrega" | Las pasarelas no son las mismas |
| "Nueva temporada" | "Fondo de armario" | Lo atado a una temporada obliga a reescribir la portada cada pocos meses, y cuando se queda viejo la tienda parece abandonada |
| "Edición de temporada" | "Básicos" | Igual |
| "Lo que más está gustando esta temporada" | "Lo que más se lleva" | Igual |

**Los cuatro textos de la barra de confianza son ahora editables**, porque son
justo lo que cambia de un mercado a otro. Mantener la tienda pasa a ser cambiar
productos, no reescribir la casa.

### Imágenes, con criterio de dirección de arte

Se descartaron dos por método, no por gusto:
- **El pantalón sobre verde neón**: un saturado peleando contra una paleta
  acromática. Sustituido por un perchero en crudo, óxido y negro — que además
  *es* el fondo de armario hecho imagen.
- **La camiseta de grupo sobre pared rosa**: leía a calle estadounidense y a
  moda pasajera. Sustituida por punto grueso en crudo sobre gris, que empareja
  con el detalle de chaqueta oscura del otro panel.

La foto de hombre **se mantuvo**: el cuero negro sobre ladrillo ya estaba dentro
de la paleta cálida.

### Un hallazgo que no se arregla con banco de imágenes

**100 productos publicados y solo 54 fotos distintas.** Casi la mitad comparte
imagen con otro producto: `photo-1523170335258` está a la vez en un bolso, un
clutch, una gorra, unos mocasines y una pulsera. Y hay al menos una foto con
**logotipo de marca ajena visible** (un reloj Omega en "Mocasines Cuero").

Las fotos se asignaron en rotación sobre un fondo pequeño de stock: son
decorativas, no descriptivas. Esto no lo arregla ningún banco de imágenes — lo
tiene que resolver el importador trayendo las fotos del proveedor, que es
exactamente para lo que existe VISNEX.

### Otros remates

- WP-CLI pasa a estar **montado** desde `wordpress/config/`: al recrear el
  contenedor se perdía porque vive en la capa de imagen.
- Los botones perdieron el subrayado que heredaban de Storefront: un botón
  subrayado se lee como enlace.
- Foco visible con filete de latón en todo lo interactivo. Con estados de hover
  elaborados, si el foco no se ve la página se vuelve inusable con teclado.

**Rendimiento:** sin regresión. 2,9 s, los mismos que antes del sistema de
movimiento (37 KB entre CSS y JS, y el movimiento lo ejecuta el compositor).

---

## 2026-08-20 (cont. 2) — "Se ve igual y va lento": las dos veces que me equivoqué

El dueño reporta que no ve cambios ni animaciones, y que la tienda sigue muy lenta.
Tenía razón en las dos cosas, y las dos eran errores míos de método.

### Error 1 — Estaba midiendo el rendimiento donde no dolía

`curl` solo pide el HTML. Medido así daba 2,9 s y lo di por resuelto. Medido **en el
navegador**, que es lo que sufre una persona:

| | curl (lo que yo medía) | Navegador (lo que se sufre) |
|---|---|---|
| TTFB | 2,9 s | **4,2 s**, y hasta **33 s** bajo carga |
| Primer pintado | no lo mide | **116 s** |

La diferencia son los **39 recursos**: cada CSS, cada JS y cada imagen cruzaba también
el bind mount de Windows. El documento era el 3 % del problema.

**Arreglo definitivo, el que llevaba pospuesto dos veces:** `wp-content` a un volumen
de Docker, con el tema y el plugin propios montados **encima** desde el repo para poder
seguir editándolos desde Windows y desde git.

```
lectura de 500 ficheros:  31.000 ms  ->  275 ms   (113x)
TTFB:                      4.227 ms  ->  264 ms   (16x)
carga completa:            4.952 ms  ->  706 ms   (7x)
```

Además: fuera `cart-fragments` salvo en el embudo (hacía una llamada AJAX en cada carga
de cada página para refrescar un carrito vacío), fuera `wc-blocks` en la portada, y
`preload` de las dos fotos del hero.

### Error 2 — Diseñé para el gusto, no para el impacto

Se lanzó una investigación con **7 agentes en paralelo** (4 de tendencias 2025-2026 +
2 de auditoría del código + 1 de síntesis; 57 hallazgos, 506k tokens). El veredicto,
literal:

> *"Se ve igual porque el 90 % de lo nuevo **no llega a pintarse** —`motion.css` pierde
> por especificidad y por orden de carga frente a `home.css`— o está **calibrado por
> debajo del umbral de percepción**."*

Lo que encontró, verificado línea a línea:

| Hallazgo | Evidencia | Consecuencia |
|---|---|---|
| La animación **buena** estaba dentro de `@supports not (animation-timeline)` | `motion.css:222` | Chrome moderno recibía la invisible; solo un navegador viejo veía la buena |
| Recorrido de 34 px sobre ~300 px de scroll | `motion.css:200` | Razón 1:8,8 — el ojo lo lee como quieto |
| El rango terminaba con el elemento a ~500 px del borde | `entry 8% cover 32%` | Cuando el ojo llegaba, llevaba rato parado |
| `home.css` declaraba la cabecera con `!important` bajo `#masthead` | `home.css:63-72` | La cabecera de papel **nunca se pintó** |
| La sombra al bajar enganchaba `.vn-scrolled`; el JS pone `.vn-header--scrolled` | `home.css:75` vs `visnex.js:47` | Esa regla **no se ejecutó jamás** |
| `vn-breathe` anulaba el zoom del hover del hero | una animación gana a una declaración normal | Pasar el ratón por el hero **no hacía nada** |
| El H1 topaba en 48 px | `editorial.css:249` | **Más pequeño que el H1 por defecto de Storefront (41,9 px + peso)** |
| ~70 líneas de `.vn-hero*` | `home.css:200-235` | CSS de un marcado que ya no existe |

### Lo que se cambió

**Cascada.** `home.css` una sola vez (antes en tres bloques condicionales, así que el
orden final cambiaba entre portada y tienda) y `motion.css` en un hook de **prioridad
99**: es la última hoja del tema en todas las páginas y por eso no necesita un solo
`!important`. Los 232 `!important` de `home.css` bajan a 25. `@charset "UTF-8"` en las
nueve hojas.

**Escala bimodal.** Fuera la escala modular 1.25, cuyos peldaños son indistinguibles —
y eso *es* la queja de "se ve igual".

```
INTERFAZ  10-16 px   (menú, precio, filtros, botones)
DISPLAY   36-152 px  (solo titulares)
razón     4x  ->  14x
```

**Trío tipográfico.** Playfair Display fuera: es el serif por defecto de webs de bodas
desde 2015 y hoy dice "usé el primer serif bonito que encontré". Entra **Instrument
Serif** (display, nunca por debajo de 40 px), **Inter** baja de 6 pesos a 3, y entra
**Archivo** para datos — que el precio y las tallas tengan voz propia.

**Rejilla de contactos.** El lujo en pantalla no está en el hueco entre productos: está
en el tamaño de la foto.

```
separación   32 px -> 8 px        contenedor  1440 px -> a sangre
proporción   3/4   -> 5:7         superficie de cada imagen  x 2,1
```

**Movimiento por encima del umbral.** Recorrido 34 → **88 px**; rango `entry 25% cover
58%`, que hace que la animación ocurra mientras el elemento **cruza el centro de la
pantalla**; telón con escalonado de 4 % por hermano. Y el telón pasa a recortar el
**contenedor**, no la imagen: antes recortaba la foto pero no el velo, y durante la
animación quedaba una franja gris que parecía un error.

**Superficies.** El papel solo estaba en `body`; las superficies grandes seguían en
blanco puro y en el gris frío `#F5F5F7` de Storefront. Grano de 3,5 % a 7,5 %. Y fuera
la joyería de plantilla: `border-radius: 0` y `box-shadow: none` en toda tarjeta e
imagen — ningún catálogo impreso tiene las fotos con las esquinas redondeadas.

**El precio deja de ser el argumento.** Mismo tamaño que el nombre, peso normal, color
apagado, y fuera la insignia de rebaja de WooCommerce. El precio en negrita y en color
es la gramática del descuento; compuesto como pie de foto es un dato. Es justo lo que
necesita esta tienda: producto asequible que no debe parecer barato.

### Verificación final

| | |
|---|---|
| TTFB / carga | 264 ms / 706 ms |
| H1 | 152 px, Instrument Serif |
| Menú | 11 px, Archivo |
| Animaciones vivas | 43, de ellas **40 dirigidas por scroll** |
| Última hoja de la cascada | `motion.css` |
| Radio de tarjeta | 0 px |
| Literales de temporada | 0 |

---

## 2026-08-20 (cont. 3) — Encender la máquina

Diez agentes especializados estudiaron las cien tiendas más innovadoras del mundo y
auditaron VISNEX contra ellas. El veredicto no fue sobre estética:

> *"No se siente viva porque el visitante NO PUEDE HACER NADA. La ceremonia está
> montada y la máquina está apagada. **Lo vivo no es el movimiento: lo vivo es la
> respuesta.**"*

### Cuatro cosas rotas que nadie había visto

Verificadas una a una en el navegador antes de tocar nada.

| Qué | Evidencia | Consecuencia |
|---|---|---|
| **La ficha no decía el nombre de la prenda** | `home.css` metía `.entry-title` en un `display:none !important` pensado para páginas de texto; el título de un producto es `h1.product_title.entry-title` | La página donde se decide la compra mostraba solo precio, cantidad y botón |
| **El catálogo no tenía mandos** | El mismo bloque ocultaba `.woocommerce-ordering`, `.storefront-sorting` y `.woocommerce-result-count` | Dejaba muertas las **257 líneas de `inc/shop-filters.php` que ya existían**. 100 prendas sin ordenar, buscar ni contar |
| **El pago era inutilizable** | A 1920 px el formulario medía ~150 px pegado al borde, campos a 55-80 px, 1.250 px vacíos al lado | Nadie podía terminar un pedido |
| **Dos colores ajenos a la ropa** | Verde Kelly en el aviso de contraentrega, azul en el cupón | Justo en la pantalla donde más importa la confianza |

La primera y la segunda son la misma lección: **el CSS editorial se escribió mirando
la portada y no se comprobó donde entra el dinero.**

### Las fotos estaban blandas, y arreglarlo BAJA el peso

`woocommerce_thumbnail` mide 324×454 y la tarjeta 462×647: se estiraba un **143 %**, y
un 285 % en un portátil retina. La nitidez es la señal de calidad más primitiva que
procesa el ojo — antes que la composición y mucho antes que la tipografía.

- Tamaño propio `visnex_card` 1000×1400, en la proporción real de la tarjeta.
- `wp_get_attachment_image()` en vez de `$product->get_image()`, que sí emite `srcset`.
- Prioridad alta y sin diferir en las cuatro primeras; el resto diferidas.
- **El `sizes` no admite `var()`**: se declara por exceso y `motion.js` lo reescribe con
  el ancho real de la tarjeta cada vez que cambia la densidad.

Resultado: de 324 px dentro de una caja de 462, a **850 px de media dentro de 933**.

Y un fallo del Personalizador que costaba medio mega: la rama que se usa cuando el
dueño elige una foto devolvía `'webp' => ''` **siempre**, así que en el camino normal la
portada servía los JPEG. En disco conviven `hero-ella.webp` (63 KB) y `hero-ella.jpg`
(295 KB). Además escribía el descriptor `1600w` a ciegas sobre ficheros de 840 px.

### Lo que hace que responda

**Control de densidad 1 · 2 · 4 · 6** (`inc/densidad.php`). La única decisión que el
cliente puede tomar sobre la tienda. Y no es capricho: con 100 prendas una rejilla fija
obliga a elegir un solo negocio — a 1-2 columnas la foto vende deseo, a 6 se comparan
siluetas y precios, que es como se repone un fondo de armario. Un control resuelve los
dos.

Detalles que importan: son `<input type="radio">` reales, así que funcionan con teclado
y lector de pantalla sin una línea de ARIA; el cambio va envuelto en
`startViewTransition`, así que la rejilla no salta; y la elección se restaura **en un
script en línea del `<head>`**, no desde `motion.js`, porque si no la página se pintaría
a 4 columnas y saltaría a la vista del usuario.

**La foto crece de la tarjeta a la ficha.** `view-transition-name: vn-foto-{id}` en las
dos, y el navegador las empareja: la foto se mueve hasta su sitio en lugar de
desaparecer y reaparecer. Es el gesto que se recuerda al cerrar la pestaña y cuesta una
línea de CSS y una de PHP.

**Navegación instantánea** con reglas de especulación: el navegador precarga y prepinta
la página que el visitante está a punto de abrir. Cero kilobytes de JavaScript, porque
lo hace el propio navegador. Excluido todo lo que tiene estado o efectos — carrito,
pago, mi cuenta y cualquier enlace de "añadir al carrito", porque prepintar eso lo
ejecutaría sin que nadie lo pida.

### Verificación

| | |
|---|---|
| TTFB / carga | **150 ms / 585 ms** |
| Recursos / peso | 38 / **25 KB** |
| Foto de tarjeta | 850 px de media en caja de 933 (antes 324 en 462) |
| Controles | buscador, orden, contador, 4 densidades, paginación |
| Densidad recordada | sí, sin salto al recargar |
| Transición de foto | `vn-foto-93` en tarjeta y ficha |
| Animaciones vivas | 31 |
