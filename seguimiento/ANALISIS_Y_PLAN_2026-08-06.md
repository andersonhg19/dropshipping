# VISNEX — Análisis de estado y plan de salida a producción
**Fecha:** 2026-08-06 · **Rama:** develop · **Último commit:** d06bd0b (2026-07-10)

> Este documento reemplaza como referencia operativa a `ANALISIS_PROFUNDO_2026-07-10.md`,
> que sigue siendo válido en sus hallazgos pero fue escrito sin el contexto estratégico
> de la sesión de planificación de julio (carpeta `planiticación futura`).
> Todo dato marcado **[V]** fue verificado contra el código hoy.

---

## 0. Resumen ejecutivo (si solo lees una sección, lee esta)

VISNEX **no es una maqueta**: hay ~27.500 líneas de Java funcionales, un panel admin de 270
archivos y una tienda con home de nivel profesional. El problema no es que esté vacío.

El problema es **dónde se corta la cadena**:

```
buscar → importar → enriquecer con IA → precificar → publicar en tienda │ ██ CORTE ██ │ vender → cobrar → pedir al proveedor → despachar → rastrear → postventa
        ────────────── construido y funcional ──────────────           │             │ ─────────────────── no existe ni una línea ───────────────────
```

Todo lo construido es la mitad **anterior** a la venta. Cuando un cliente compre en la tienda,
hoy no pasa absolutamente nada: no hay entidad `Order`, ni `Fulfillment`, ni `Shipment`, ni
webhook de WooCommerce, ni adaptador de proveedor, ni sincronización de stock **[V]**.

Y hay un segundo problema, más caro que el primero: **el proyecto está construido para un
modelo de negocio distinto al que tú mismo concluiste que era el correcto.** VISNEX asume
catálogo internacional importado por CSV con pago en línea. Tu investigación de julio concluyó
que tu ventaja está en dropshipping **COD colombiano** vía Dropi. Son dos negocios con dos
arquitecturas y dos diseños opuestos.

**Veredicto:** no hay que tirar nada. Hay que **reorientar el 20% y construir el 30% que falta**,
en un orden que produzca ventas antes que features.

---

## 1. Estado verificado hoy

### 1.1 Métricas duras **[V]**

| Métrica | Valor | Lectura |
|---|---|---|
| Líneas Java (backend) | **27.479** en 8 servicios + common | Volumen real, no scaffolding |
| administration-service | 176 archivos / 11.149 líneas | El más maduro (heredado del patrón corporativo) |
| commerce-service | 132 archivos / 7.444 líneas | Núcleo del producto |
| acquisition-service | 79 archivos / 4.833 líneas | Funcional |
| visnex-common | 9 archivos / 447 líneas | **Muerto: 1 solo import en todo el backend** |
| Archivos frontend (.ts/.tsx) | 270 | Panel admin completo |
| mu-plugin de la tienda | 1.512 líneas / 46 KB | Un solo archivo monolítico |
| **Tests en todo el backend** | **1 archivo** | Ver §6 |
| Jobs programados | **1** — y es limpiar logs de auditoría | Sin sync de stock/precio |
| Contenedores VISNEX arriba | **0** | El entorno está apagado desde julio |
| Actividad | **Congelado desde 2026-07-10** | 27 días sin commits |

### 1.2 Lo que funciona de verdad — CONSERVAR

- **Arquitectura por capas consistente** en los 8 servicios (entity → repository custom con
  Criteria API → mapper MapStruct → service → controller). Sin SQL injection. BCrypt en auth.
- **`FileImportService` está COMPLETO** **[V]** — y esto **corrige** la auditoría de julio:
  tiene `upload`, `preview` **y `executeImport` con mapeo de campos**, parsers de CSV/XLSX/JSON,
  validación de mapping obligatorio de `title`. El backend sabe importar. El que no sabe es el frontend (§3.2).
- **`AiEnrichmentService`** **[V]** — real y multi-proveedor: `OLLAMA_LOCAL` (localhost:11434),
  `OPENAI` y `CLAUDE` (api.anthropic.com/v1/messages). Con control de presupuesto mensual.
  Esto sí es una ventaja competitiva concreta: enriquecer catálogo a costo marginal ~0 con Ollama.
- **`PricingCalculator`** — BigDecimal, IVA con umbral, margen sobre precio de venta. Fórmula sana.
- **`WooCommercePublishService`** — publica de verdad contra `/wp-json/wc/v3/products`, con
  meta de Yoast, tags e imágenes con alt automático. Tiene bugs (§3.1) pero el camino existe.
- **Home de la tienda** — hero 100vh con Ken Burns, `prefers-reduced-motion`, categorías,
  editorial split, trust bar, newsletter, footer oscuro. Nivel visual profesional.
- **Panel admin** — CRUD completo de productos/categorías/proveedores/canales, onboarding wizard,
  skeletons, empty states, dark mode, gráficas.

---

## 2. Análisis a fondo del diseño WordPress

### 2.1 El hallazgo que manda sobre todos los demás **[V]**

```
Selectores CSS para carrito, checkout o mi-cuenta en visnex-style.php:  0
```

Búsqueda de `woocommerce-checkout`, `woocommerce-cart`, `.cart_totals`, `woocommerce-MyAccount`:
**cero coincidencias en 1.512 líneas.** El listado completo de secciones del archivo lo confirma:
announcement bar, header, hero, categorías, product grid, editorial, trust bar, newsletter,
botones, single product, footer, animaciones, responsive, shop/archive. **Y se acabó.**

Traducción de negocio: el cliente navega una tienda que parece Gucci, se enamora, hace clic en
"Añadir al carrito" — y aterriza en el Storefront gris de fábrica **justo en el momento de pagar**.
Es el peor lugar posible para romper la ilusión. En moda con COD, donde la confianza es la
variable #1, esto es una fuga de conversión directa.

### 2.2 Diagnóstico técnico del CSS

| Hallazgo **[V]** | Dato | Implicación |
|---|---|---|
| `!important` | **232 usos** | Está peleando contra Storefront, no extendiéndolo |
| Imágenes Unsplash hotlinked | 5 | Contenido "de producción" que depende de un tercero |
| `href="#"` muertos | 8 | Enlaces legales sin destino: riesgo legal + señal de desconfianza |
| Búsqueda / filtros / orden | 1 selector | En moda no se compra sin filtrar talla y color |
| CSS inline en `wp_head` | sí | No cacheable, no versionable, no minificable |

**El error es arquitectónico, no estético.** Un `mu-plugin` que inyecta 1.500 líneas de CSS
inline es el vehículo equivocado. Los 232 `!important` son el síntoma: cada regla tiene que
ganarle por la fuerza a la del tema. La forma correcta es un **child theme de Storefront**:
`style.css` versionado y cacheable + `woocommerce/checkout/*.php` y `cart/*.php` sobrescritos
por template override. Ahí el checkout se estiliza de raíz en vez de por encima.

### 2.3 El problema estratégico del diseño (el más caro)

El propio encabezado del archivo lo declara:

```php
/* VISNEX PREMIUM v3.0
   Inspired by: Gucci, Apple, Nike, Stella Guan */
```

Ese es el diseño de una **marca de moda con tráfico de marca**: hero editorial de pantalla
completa, storytelling, mucho aire, la venta al final del recorrido.

Pero el negocio que tu investigación identificó es **dropshipping COD colombiano con tráfico
pagado**. Ese negocio se juega en una landing de producto único donde el visitante llega desde
un anuncio, con intención tibia, en móvil, y hay que capturarlo en 8 segundos: precio arriba,
prueba social arriba, formulario COD de un clic, contador de escasez, garantía visible.

**Un hero de 100vh con Ken Burns antes del producto es, en ese contexto, un obstáculo.**
No porque esté mal hecho — está muy bien hecho — sino porque optimiza para una métrica
(percepción de marca) que no es la que te paga (conversión de tráfico frío).

Esta contradicción no se resuelve mejorando el CSS. Se resuelve decidiendo cuál de los dos
negocios estás construyendo.

### 2.4 Resolución — **DECIDIDO (2026-08-07)**

> ### ✅ **Conservar la home premium + construir landings COD aparte.**
> Los dos mundos conviven, cada uno con su trabajo:
>
> | | **Home premium** (ya construida) | **Landing COD** (por construir) |
> |---|---|---|
> | Público | Tráfico de marca, referidos, orgánico | Tráfico frío desde anuncios, móvil |
> | Objetivo | Confianza y percepción | Conversión en 8 segundos |
> | Estructura | Hero 100vh, editorial, storytelling | Precio arriba, prueba social, COD 1-clic, escasez, garantía |
> | Métrica | Recuerdo de marca | CPA real (= CPA Meta ÷ tasa de entrega) |
>
> **La regla operativa:** ningún anuncio pagado apunta nunca a la home. Cada producto en pauta
> tiene su propia landing generada desde plantilla. La home es la cara de la marca — el activo
> de confianza que en Colombia, con 64.628 denuncias por estafa digital en 2025, **sí vale dinero**
> y que ningún dropshipper de los 63.000 se molesta en construir.
>
> Esto también evita tirar trabajo bien hecho: la home no se toca, se le suma un tipo de página
> nueva. Ver Fase 4.

---

## 3. Mecanismos: qué está roto por dentro

### 3.1 Bugs confirmados en el camino crítico **[V]**

**Bug de idempotencia en publicación — bloquea reintentos para siempre.**
En `WooCommercePublishService.java`:
- Línea 37-40: si ya existe un `ProductPublish` con `active=true` para ese producto+canal,
  rechaza con *"Product is already published to this channel"*.
- Línea 112 y 127: cuando la publicación **falla**, guarda el registro con `syncStatus="FAILED"`
  **y `active=true`**.

Resultado: **el primer fallo de red deja ese producto imposible de publicar para siempre.**
Hay que borrar la fila a mano en la base de datos. En una operación real con 100 productos y
una caída momentánea de WooCommerce, se te bloquean decenas de productos en silencio.

**RestTemplate sin timeouts en los 3 servicios que llaman a APIs externas** **[V]**
(`AppConfig.java` de commerce, acquisition y administration devuelven `new RestTemplate()` pelado).
Si WooCommerce u Ollama no responden, el hilo queda colgado indefinidamente. Con el pool por
defecto de Tomcat, basta un puñado de llamadas colgadas para tumbar el servicio entero.

**Sin actualización ni re-sincronización.** `publishProduct` solo hace `POST`. No hay `PUT`.
Si cambias el precio o la descripción de un producto ya publicado, el cambio **nunca llega a la tienda**.

### 3.2 El flujo de importación está cortado en la UI **[V]**

`frontend/src/layouts/acquisition/import/page.tsx`, línea 168:

> *"El mapeo de campos y la ejecución estarán disponibles en la próxima actualización."*

Puedes subir el CSV, ver las columnas detectadas… y ahí termina. **La única vía de ingesta de
productos del sistema no se puede usar desde el panel.**

Lo bueno: como el backend `/execute` ya está completo, esto es **construir una pantalla, no un
motor**. Es probablemente la mejor relación valor/esfuerzo de todo el proyecto: ~1 sesión para
volver usable el sistema entero de punta a punta.

### 3.3 Vacíos funcionales — lo que separa "plataforma" de "operación"

| # | Vacío **[V]** | Consecuencia real |
|---|---|---|
| N1 | **Cero entidades `Order` / `Fulfillment` / `Shipment`** | Vendes y no hay dónde registrarlo, ni a quién pedirle el producto, ni qué decirle al cliente |
| N2 | **Cero sync de stock/precio** (ni `stock` existe como campo) | Vendes agotados. En COD eso es una devolución pagada por ti |
| N3 | **Cero adaptadores de proveedor** (CJ/Dropi solo son texto en Swagger) | El "automatizado" del pitch no existe |
| N4 | Sin webhook receptor de WooCommerce | La tienda y el SaaS no se hablan de vuelta |
| N5 | `SendToCommerce` pierde imágenes, categoría y variantes al transferir | El producto llega mutilado a commerce |
| N6 | `visnex-common` muerto: ~35 clases duplicadas en 6 servicios | Un fix de seguridad hay que aplicarlo 6 veces |

### 3.4 Seguridad — bloqueante para cualquier despliegue público

Los 5 críticos de la auditoría de julio **siguen todos vigentes [V]**:
`backend/.env` y `frontend/.env` continúan trackeados en git con contraseñas reales, el secreto
JWT sigue siendo `visnex@secret.key` compartido por 6 servicios, `audit-service` sigue sin filtro
JWT, y `docs/VISNEX-Documentacion-Completa.html` sigue publicando todas las credenciales en claro.

**Y hay algo peor que la auditoría de julio no detectó [V]:**

```
gh repo view andersonhg19/dropshipping  →  "visibility": "PUBLIC"
git branch -r --contains <commit que añadió backend/.env>  →  origin/develop, origin/main
```

**El repositorio es PÚBLICO en GitHub, y los `.env` con secretos se subieron el 2026-04-04.**
Llevan ~4 meses expuestos a internet, en ambas ramas.

Alcance real, medido (no alarmista):

| Secreto expuesto | Gravedad real | Por qué |
|---|---|---|
| `SPRING_DATASOURCE_PASSWORD`, `POSTGRES_PASSWORD` | **Media** | Apuntan a `localhost`/Docker. No explotables desde fuera **mientras no despliegues**. Se vuelven críticos el día que publiques |
| `SECRET` (JWT, `visnex@secret.key`) | **Alta** | Compartido por 6 servicios. Cualquiera que lea el repo puede forjar un token ADMIN el día que el sistema esté en línea |
| `NEXT_PUBLIC_CACHE_SECRET` | Media | Cripto del frontend |
| `SMTP_PASSWORD` | **Ninguna** | Verificado: es el placeholder `your-app-password`, no una credencial real |

**Conclusión:** no hay una emergencia en curso — nada está desplegado, las bases de datos son
locales. Pero **el sistema no puede salir a internet ni un solo día con estos secretos**, y como
ya están en el historial público, rotarlos no basta: hay que **purgar el historial** o, más
simple y seguro, **empezar con un repositorio limpio**. Esto convierte la Fase 0 en bloqueante
real de todo lo demás.

---

## 4. La contradicción de fondo: por qué llevas 27 días parado

Leí la sesión completa de `planiticación futura` (18.000 caracteres de tus mensajes,
16-jul al 07-ago). Esto es lo que dice, en tus palabras:

- *"tengo pánico al primer paso, a publicar"*
- *"me quebré... estuve endeudado más de 5 años pagando todo lo que fue esa locura"*
- *"el negocio quebró porque crecí muy rápido y me quedé corto"* + *"no tenía los socios correctos"*
- *"no tengo ninguno de mis productos realmente listos. todos están parcializados"*
- *"en mi interior soy emprendedor y de ahí viene que quiera hacer cosas"*

Y la conclusión a la que llegaron esas sesiones:

> Ventaja injusta: **63.000 dropshippers colombianos compiten en pauta y producto ganador.
> Ninguno sabe construir software. Tú sí.**
> El hueco de margen: **el 20-25% de pedidos COD que se evaporan.** Confirmar cada pedido sube la
> entrega a 70-85%. Dropi tiene API. WhatsApp Utility es gratis dentro de la ventana de 24h.
> **Recuperar 10 puntos de entrega ≈ bajar el CPA un 13%. Y es puro código.**
> Primer paso recomendado: **UN producto, UN anuncio, tope $300.000 COP.**

Ahora júntalo con lo que encontré en el código:

**Construiste 27.500 líneas de software antes de hacer una sola venta.**

Y aquí está lo incómodo, dicho con respeto porque es importante: dado que tu bloqueo declarado
es *publicar*, y que tu superpoder declarado es *construir* — un proyecto de 27.500 líneas que
nunca llega a estar "listo" es exactamente la forma que tomaría ese miedo si fuera muy
inteligente. Cada feature que falta es una razón legítima para no lanzar todavía. Y siempre va
a faltar una. Esa es la definición de *"todos están parcializados"*.

**Esto no es un reproche al proyecto.** El proyecto es bueno y la habilidad es real. Es un
señalamiento sobre el **orden**. Y hay un dato que lo prueba objetivamente: el sistema puede
publicar productos en una tienda, pero **no puede recibir un pedido**. Se construyó
íntegramente el lado del catálogo — el lado creativo, controlable, sin exposición — y cero
del lado de la venta, que es el que da miedo.

Corolario práctico: **el criterio de "funcional" no puede ser "completo". Tiene que ser "vende".**

---

## 5. Qué conservar, qué reformular, qué quitar

| Componente | Estado | Decisión | Por qué |
|---|---|---|---|
| Backend por capas (8 servicios) | Sólido | **CONSERVAR** | Es tu ventaja injusta materializada |
| `FileImportService` | Completo | **CONSERVAR + exponer en UI** | 1 sesión desbloquea todo el sistema |
| `AiEnrichmentService` (Ollama/OpenAI/Claude) | Real | **CONSERVAR y explotar** | Costo marginal ~0 con Ollama = ventaja estructural |
| `PricingCalculator` | Sano | **CONSERVAR + extender** | Falta flete real y comisión COD |
| `WooCommercePublishService` | Con 3 bugs | **REPARAR** | Bug de idempotencia, timeouts, falta `PUT` |
| Home de la tienda | Excelente | **CONSERVAR** | Nivel profesional, no tocar |
| Checkout / carrito / cuenta | **Inexistente** | **CONSTRUIR (P0)** | Es donde se pierde el dinero |
| Arquitectura CSS (mu-plugin) | 232 `!important` | **REFORMULAR → child theme** | Sin esto no se puede estilar el checkout |
| Módulo de órdenes | No existe | **CONSTRUIR (P0)** | Es *el* núcleo del negocio |
| Adaptador Dropi | No existe | **CONSTRUIR (P0)** | Es el proveedor de tu mercado real |
| Adaptador CJ / internacional | No existe | **APLAZAR** | Mercado equivocado para la fase 1 |
| `discovery-service` (Eureka) | 15 líneas | **QUITAR** | 8 servicios en un compose no necesitan service discovery. Un puerto menos, un fallo menos |
| `language-service` (i18n) | 1.083 líneas | **CONGELAR** | Vendes en Colombia, en español. El `'en'` está muerto. Cero valor hoy |
| `audit-service` | Sin JWT | **CERRAR o quitar** | Hoy es un pasivo de seguridad, no un activo |
| `visnex-common` | Muerto (1 import) | **ADOPTAR o BORRAR** | El estado actual es lo peor de ambos mundos |
| `PublishChannel` multicanal | Fachada | **REFORMULAR** | Un solo publisher real. Mantener la interfaz, no fingir el resto |
| Imágenes Unsplash hotlinked | 5 | **QUITAR** | Dependencia de terceros en producción |
| `docs/VISNEX-Documentacion-Completa.html` | Credenciales en claro | **BORRAR** | 97 KB de pasivo de seguridad |
| `seguimiento/` (12 docs) | Varios obsoletos | **ARCHIVAR** | `PLAN_MAESTRO` tiene puertos viejos; `PROPUESTA_2_SERVICIOS` ya está implementada |
| Tienda "premium editorial" | Bien construida | **CONSERVAR** (§2.4) | Cara de marca. Se le suman landings COD aparte; ningún anuncio apunta a la home |
| Landing COD de producto único | No existe | **CONSTRUIR (P0)** | Es el destino real del tráfico pagado |

---

## 6. Metodología: qué hacemos hoy vs. qué deberíamos hacer

### 6.1 El espejo más incómodo del análisis

Comparé VISNEX contra tus otros repos **[V]**:

| | **Oh Churus** (proyecto universitario) | **VISNEX** (proyecto de negocio) |
|---|---|---|
| Tests backend | **44 archivos** | **1 archivo** |
| SonarQube | `sonar-project.properties` + JaCoCo | no |
| Colección Postman | sí, versionada | no |
| Bitácora | `bitacora.md` + `plan-maestro.md` | **el changelog que declara `CLAUDE.md` no existe** |
| CI | — | existe `ci.yml`, pero `.github/` está en `.gitignore` → **nunca se ha ejecutado** |

**Estás aplicando más rigor a un proyecto de universidad que al proyecto del que esperas vivir.**
Ese es probablemente el hallazgo de metodología más importante de todo el documento.

### 6.2 Prácticas actuales que hacen daño

| Práctica actual **[V]** | Costo real |
|---|---|
| Commits gigantes tipo WIP (`"WordPress premium store v3 (WIP) + análisis de auditoría"`) | Mezcla tienda + documento en un commit. Imposible revertir una cosa sin la otra |
| **23 commits sin subir** (todo julio) + **repo público con secretos** | La peor combinación posible: lo que quieres proteger está solo en tu disco, y lo que deberías ocultar está publicado |
| CI en `.gitignore` | Tienes el archivo y cero de su beneficio |
| `ddl-auto=update`, sin Flyway/Liquibase | El esquema de tu base de datos no está en control de versiones. En producción esto es una bomba |
| 1 test → `PricingCalculatorTest` solo verifica `>0` y `notNull` | No detecta que cambies mal la fórmula de precios. Es el cálculo que decide si ganas o pierdes plata |
| Verificación 100% manual | Cada cambio requiere levantar 12 contenedores y hacer clic |
| Sesiones sin bitácora | Cada retoma cuesta una hora de re-descubrimiento (esta misma sesión lo prueba) |

### 6.3 Metodología propuesta — calibrada a **un dev solo con IA**, no a un equipo de 10

No propongo Scrum, ni estimaciones, ni tableros. Propongo seis reglas y nada más:

1. **Vertical slices, no capas.** Cada tarea entrega un flujo completo de punta a punta y
   demostrable. Nunca "hacer las entidades de Order"; siempre *"un pedido de prueba en WooCommerce
   aparece en el panel"*. Esto ataca directamente la parcialización.
2. **Definition of Done de una sola línea:** *un cambio no está hecho hasta que se puede
   demostrar corriendo, y existe un test que falla si se rompe.* Sin excepciones.
3. **Push diario a un remoto privado.** Hoy, antes que cualquier otra cosa. Es la única tarea
   de este documento que es urgente por riesgo, no por valor.
4. **CI que corra de verdad** (sacar `.github/` del `.gitignore`): `mvn verify` + `yarn build`
   en cada push. No como burocracia — como red de seguridad para poder moverte rápido sin miedo.
5. **Flyway desde el primer día del módulo de órdenes.** El esquema versionado. `ddl-auto=validate`
   en producción.
6. **Bitácora por sesión** (`seguimiento/bitacora.md`, formato de Oh Churus): qué se hizo, qué
   quedó pendiente, qué decisión se tomó y por qué. 10 líneas por sesión.

**Tests: dónde sí y dónde no.** No apuntes a cobertura. Apunta a **tres zonas**, y en el resto
acepta deuda conscientemente:
- `PricingCalculator` — decide tu margen. Casos exactos, no `>0`.
- Máquina de estados de órdenes — decide si un cliente recibe o no su producto.
- Adaptador Dropi — con mocks de sus respuestas, incluyendo los errores.

Nada más. Tres suites bien hechas valen más que 60% de cobertura repartida.

**Cómo usar la IA mejor de lo que la usas hoy.** Hoy la usas para *generar volumen* — y por eso
tienes 27.500 líneas y 1 test. Los tres usos de mayor retorno para tu situación:
*(a)* generar la suite de tests de las tres zonas críticas (es donde la IA es más fiable y donde
tú tienes menos paciencia); *(b)* revisión adversarial antes de cada commit, no después;
*(c)* dentro del producto — enriquecimiento y **creatividades de anuncios con Ollama a costo 0**,
que es literalmente lo que los otros 63.000 no pueden hacer.

---

## 7. LA DECISIÓN ESTRATÉGICA — **RESUELTA (2026-08-07)**

> ### ✅ DECIDIDO: **Camino C — Operar primero, SaaS después.**
> VISNEX se usa primero como herramienta propia para operar dropshipping COD colombiano.
> El Camino B (SaaS multi-tenant para los 63.000 dropshippers) queda como Fase 6+, alimentado
> por los problemas reales que se resuelvan operando.
>
> **Consecuencia directa sobre el plan:** todo lo que no acerque a la primera venta se aplaza.
> Multi-tenancy real, facturación, onboarding de terceros y soporte **no se tocan** hasta que
> la Fase 5 valide el modelo con dinero real.

Las tres opciones que se evaluaron, para referencia futura:

**Camino A — Operar (lanzar en semanas)**
VISNEX se vuelve *tu* herramienta interna para *tu* operación de dropshipping COD.
Se conecta a Dropi, se construye el módulo de órdenes, se estiliza el checkout, se lanza con
un producto y tope de pauta de $300.000. La tienda premium editorial pasa a landing de conversión.
→ Ingresos posibles en 4-8 semanas. Rompe el bloqueo de publicar. Confirma o refuta el modelo con dinero real.

**Camino B — Producto (SaaS para dropshippers, 6+ meses)**
Se completa VISNEX como plataforma multi-tenant y se vende por suscripción a los 63.000
dropshippers colombianos. Necesita multi-tenancy real, facturación, soporte, onboarding, seguridad de grado producción.
→ Techo mucho más alto. Pero **te exige vender**, que es exactamente lo que te bloquea. Y son 6+ meses sin un peso.

**Camino C — A primero, B después (mi recomendación)**
Operar tú mismo durante 3-6 meses. Cada problema que resuelvas operando (las cancelaciones COD,
la confirmación por WhatsApp, el sync de stock) es exactamente la feature que después le vendes al mercado.
→ Te vuelves tu propio primer cliente. Cuando salgas a vender el SaaS ya no vendes una promesa:
vendes *"esto es lo que uso yo, y estos son mis números"*. Para alguien que dice *"no sé vender"*,
esa es la venta más fácil que existe. Y de paso rompes el bloqueo de publicar con lo más barato posible.

---

## 8. PLAN DE TRABAJO

Cada fase tiene **criterio de salida verificable**. No se pasa a la siguiente sin cumplirlo.

### FASE 0 — Blindaje (1 sesión) · BLOQUEANTE, HOY

Estado de partida **[V]**: el repo `andersonhg19/dropshipping` es **público**, tiene los
secretos en el historial desde abril, y hay **23 commits locales sin subir** (todo el trabajo
de julio: la tienda v3 y la auditoría, solo en tu disco).

| # | Tarea | Archivos |
|---|---|---|
| 0.1 | **Poner el repositorio en privado** (`gh repo edit --visibility private`). 30 segundos, corta la exposición | GitHub |
| 0.2 | `git rm --cached backend/.env frontend/.env`, `.env` al `.gitignore`, crear `.env.example` con placeholders | raíz |
| 0.3 | **Rotar los secretos**: JWT (≥256 bits aleatorio, **sin valor por defecto** — que el arranque falle si falta), contraseñas de BD, claves WooCommerce | `docker-compose.yml`, `.env` |
| 0.4 | **Purgar el historial** (git-filter-repo) o arrancar repo limpio. Decisión: purgar conserva los 23 commits de contexto; repo limpio es más simple y seguro | git |
| 0.5 | **Subir los 23 commits pendientes** al remoto ya saneado (hoy solo existen en tu disco) | git |
| 0.6 | Borrar `docs/VISNEX-Documentacion-Completa.html` (97 KB con credenciales en claro) | docs/ |
| 0.7 | Cerrar `audit-service`: filtro JWT + `anyRequest().authenticated()` en auth/administration/language | 4 `SecurityConfig` |
| 0.8 | No publicar puertos 8842-8847, 5433, 3307, 8851 al host — solo el gateway | composes |

**Criterio de salida:** `git log -p` no muestra un solo secreto, el repo está en privado, y los
23 commits de julio están respaldados fuera de tu disco.

---

### FASE 1 — Higiene y método (1 sesión)

| # | Tarea |
|---|---|
| 1.1 | Sacar `.github/` del `.gitignore`, commitear `ci.yml`, verificar que el workflow corre en verde |
| 1.2 | **Timeouts en RestTemplate** en los 3 `AppConfig` (connect 5s / read 30s) — 15 minutos, evita caídas totales |
| 1.3 | **Arreglar el bug de idempotencia**: guardar los `FAILED` con `active=false`, o filtrar por `syncStatus='SYNCED'` en la comprobación de duplicado. **+ test de regresión** |
| 1.4 | Crear `seguimiento/bitacora.md` y corregir la ruta de changelog rota en `CLAUDE.md` |
| 1.5 | Archivar los 5 docs obsoletos a `seguimiento/archivo/` |
| 1.6 | Decidir `visnex-common`: adoptarlo (migrar imports, borrar ~35 duplicados) o borrarlo |
| 1.7 | Quitar `discovery-service`; congelar `language-service` |
| 1.8 | **Fortalecer `PricingCalculatorTest`**: valores exactos con casos reales de COP + IVA |

**Criterio de salida:** CI en verde en cada push; un fallo de publicación se puede reintentar sin tocar la base de datos.

---

### FASE 2 — Cerrar el circuito existente (1-2 sesiones) · MÁXIMO VALOR/ESFUERZO

| # | Tarea |
|---|---|
| 2.1 | **UI de mapeo de campos + ejecución de importación** (el backend ya está listo): drag de columna origen → campo destino, preview de 5 filas, ejecutar, progreso |
| 2.2 | Guardar el mapeo como `ImportTemplate` reutilizable (la entidad ya existe) |
| 2.3 | `SendToCommerce`: transferir también imágenes, categoría, variantes y `supplierName` |
| 2.4 | `PUT` de actualización en `WooCommercePublishService` (re-sync de productos publicados) |

**Criterio de salida:** subir un CSV de 100 productos desde el panel, enriquecerlos con IA,
precificarlos y verlos publicados en la tienda — **sin tocar Postman ni la base de datos una sola vez.**
Esta es la primera vez que el sistema completo será demostrable de punta a punta.

---

### FASE 3 — El núcleo del negocio: órdenes y Dropi (3-5 sesiones)

| # | Tarea |
|---|---|
| 3.1 | **Flyway** en commerce-service + baseline del esquema actual |
| 3.2 | Entidades `Order`, `OrderItem`, `Fulfillment`, `Shipment` + máquina de estados explícita (`NUEVA → CONFIRMADA → ENVIADA_PROVEEDOR → EN_TRANSITO → ENTREGADA / CANCELADA / DEVUELTA`) **+ suite de tests de la máquina de estados** |
| 3.3 | **Webhook receptor de WooCommerce** (`order.created`) con validación de firma |
| 3.4 | **Interfaz `SupplierAdapter`** + implementación **Dropi** (auth, catálogo, stock, crear orden, tracking) con tests contra mocks |
| 3.5 | Campo `stock` en `SourceProduct`/`Product` + **scheduler de sincronización** + auto-despublicar en stock 0 |
| 3.6 | Bandeja de órdenes en el panel: semáforo de estados, acciones en bloque, filtros |
| 3.7 | `PricingCalculator`: sumar flete real y comisión COD al precio final |

**Criterio de salida:** una compra de prueba en la tienda genera una orden en el panel, se envía
a Dropi, y el número de guía vuelve a WooCommerce. **Automático, sin intervención manual.**
En este punto VISNEX deja de ser un gestor de catálogo y pasa a ser una operación.

---

### FASE 4 — Conversión de la tienda (2-3 sesiones)

Ejecuta la decisión de §2.4: **la home no se toca**; se le suma un tipo de página nuevo.

| # | Tarea |
|---|---|
| 4.1 | **Migrar de mu-plugin a child theme de Storefront** (`style.css` versionado, template overrides). Elimina la mayoría de los 232 `!important` y es lo que habilita 4.2 y 4.3 |
| 4.2 | **Estilar carrito, checkout y mi-cuenta** — hoy en cero. *Aplica a los dos mundos* |
| 4.3 | **Plantilla de landing COD** (page template del child theme): precio y foto arriba, prueba social, beneficios en bullets, escasez, garantía, formulario COD. **Ningún anuncio apunta a la home** |
| 4.4 | **Formulario COD de un clic** (nombre, teléfono, dirección, ciudad — y nada más) |
| 4.5 | **Confirmación por WhatsApp** dentro de la ventana Utility de 24h (costo $0). *Esta es la palanca del 25%: la feature de mayor impacto económico de todo el plan* |
| 4.6 | Búsqueda + filtros de talla/color; reviews visibles; precio COP con contraste WCAG AA. *Aplica al mundo premium* |
| 4.7 | Páginas legales reales (privacidad, términos, devoluciones) — los 8 `href="#"`. **Doble función: requisito legal y señal de confianza en la landing COD** |
| 4.8 | Imágenes propias, sin hotlink a Unsplash |
| 4.9 | Pasarela: Wompi (Nequi) + evaluar Addi BNPL |

**Criterio de salida:** un desconocido llega desde un anuncio a una landing COD en el móvil,
compra sin ver una sola pantalla de Storefront default, y recibe la confirmación por WhatsApp
automáticamente. Y quien entre por la home sigue viendo la marca premium intacta.

---

### FASE 5 — LANZAR (la fase que de verdad importa)

| # | Tarea |
|---|---|
| 5.1 | Elegir **UN** producto en Dropi |
| 5.2 | Publicarlo con el sistema completo (importar → IA → precio → tienda) |
| 5.3 | **UN** anuncio. **Tope de pauta: $300.000 COP, escrito e innegociable** |
| 5.4 | Medir: CPA real = CPA de Meta ÷ tasa de entrega. **Es el único número que importa** |
| 5.5 | Iterar con datos reales, no con supuestos |

**Criterio de salida: UNA venta.** Ese es el hito. No diez, no un negocio rentable. Una.

---

### FASE 6 — Diferenciales (post-primera venta, solo si Fase 5 valida)

Creatividades de anuncios con IA (Ollama, costo marginal 0) · Adaptador CJ internacional ·
Feed de catálogo a Meta Shops · MercadoLibre · Productos propios (`sku`/`stockQuantity`/`productType`
+ router de fulfillment) · Multi-tenancy real → **inicio del Camino B**

---

## 9. Riesgos y cómo se blindan

| Riesgo | Blindaje |
|---|---|
| **Secretos públicos en GitHub desde abril** | Fase 0.1 + 0.4 — hoy |
| **23 commits de julio solo en tu disco** (tienda v3 + auditoría) | Fase 0.5 — hoy |
| **Perfeccionismo infinito** — cada fase invita a pulir más | Criterios de salida binarios. Si se cumple, se avanza. La Fase 5 **no se aplaza por ninguna feature de la 6** |
| Fuga de caja por pauta | Tope escrito de $300.000/mes, innegociable (es exactamente lo que te quebró antes: crecer más rápido que la caja) |
| Repetir el patrón de socios | Sin socios. Ya está decidido, solo hay que sostenerlo |
| Secretos ya expuestos en el historial | Fase 0.4 antes de cualquier push público |
| Vender agotados (COD = devolución pagada por ti) | Fase 3.5, sync de stock + auto-despublicar |

---

## 10. Estado de las decisiones y siguiente paso

**Decidido el 2026-08-07:**

| Decisión | Elección | Dónde |
|---|---|---|
| Estrategia | **Camino C** — operar primero, SaaS después | §7 |
| Diseño de tienda | **Conservar home premium + landings COD aparte** | §2.4, Fase 4 |
| Arranque de Fase 0 | **En pausa** — revisión del documento primero | §8 |

**Siguiente paso:** lees este documento, das feedback, y ajustamos lo que haga falta antes de
tocar una sola línea. Nada se ha ejecutado.

Cuando des luz verde, el orden es: **Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5.**
De esas, la Fase 2 es la que primero produce algo demostrable de punta a punta, y la Fase 5 es
la única que importa de verdad.

> ⚠️ **Nota sobre la Fase 0 mientras esté en pausa:** el repositorio sigue público con los
> secretos en el historial, y los 23 commits de julio siguen sin respaldo fuera de tu disco.
> Si quieres cortar solo ese riesgo sin comprometerte al resto del plan, son dos acciones
> reversibles y de bajo riesgo: poner el repo en privado y subir los 23 commits. La purga del
> historial y la rotación pueden esperar a que revisemos juntos.

Y una nota final, porque este documento ha sido duro con el proyecto y quiero ser justo con
quien lo construyó: **nada de esto está mal hecho.** Está bien construido, es consistente, y la
habilidad que demuestra es exactamente la que tu propia investigación identificó como tu ventaja
frente a 63.000 competidores. El problema nunca fue la calidad. Fue el orden — se construyó
primero todo lo que no da miedo, y quedó pendiente lo único que hace falta: publicar.

El plan de arriba está diseñado para llegar a la Fase 5 lo más rápido que sea responsable.
Porque después de la primera venta, este documento entero se vuelve mucho menos importante.
