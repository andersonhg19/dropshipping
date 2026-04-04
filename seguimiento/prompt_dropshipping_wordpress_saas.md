# Prompt maestro para construir una plataforma de dropshipping automatizada con WordPress + SaaS + Docker

## Rol y objetivo general

Quiero que actúes como **arquitecto de software senior, líder técnico, analista de producto y ejecutor full stack**, con criterio de negocio y enfoque en construcción incremental.  
Tu objetivo es **analizar, diseñar y construir** una solución de comercio electrónico para **dropshipping automatizado**, tomando como base una arquitectura híbrida compuesta por:

1. **Un ecosistema WordPress** orientado a ventas, con estilo visual premium y limpio, inspirado en la web de Apple.
2. **Una plataforma SaaS propia** que centraliza la lógica de automatización, análisis de tendencias, importación de productos, enriquecimiento con IA, publicación, seguimiento y estadísticas.
3. **Un entorno completamente dockerizado**, portable y persistente, que pueda levantarse localmente durante desarrollo y luego desplegarse en servidor sin rehacer la arquitectura.

---

## Contexto del proyecto

Este proyecto nace con una visión pragmática:

- No estamos buscando inicialmente una gran plataforma enterprise.
- Queremos construir una **primera iteración comercializable**, de bajo costo, con posibilidad de generar ingresos pequeños pero constantes.
- Se quiere evitar costos innecesarios durante la etapa inicial.
- La primera fase será completamente **local**, usando Docker, sin depender de hosting pago mientras se valida el producto.
- La estrategia será construir una solución que luego pueda evolucionar hacia un producto más grande o incluso hacia un SaaS comercializable.

El primer enfoque comercial será el segmento de **ropa para dama y caballero**.

---

## Restricciones y lineamientos clave

### Restricción 1: usar proyectos locales de referencia
Vas a recibir o tendrás acceso local a dos rutas de referencia que debes **analizar primero** para reducir incertidumbre arquitectónica y no gastar tokens proponiendo estructuras desde cero si ya existen bases reutilizables.

#### Ruta de referencia WordPress
`C:\Users\ander\Documents\Anderson\JeesFull`

En esa ruta existe un proyecto WordPress previo.  
Quiero que:

- Analices su estructura.
- Revises la documentación disponible.
- Revises sus archivos `docker-compose`, `Dockerfile`, `.yml`, configuraciones y convenciones.
- Reutilices lo que sea útil para montar esta nueva solución.
- Tomes como referencia la forma en que está organizado el entorno WordPress, persistencia, plugins, despliegue local y demás componentes asociados.


#### Ruta del nuevo proyecto destino
`C:\Users\ander\Documents\Anderson\Personales\dropshipping`

En esta ruta debe quedar creado o reutilizado el nuevo proyecto de trabajo.  
Quiero que:

- uses esta ruta como base del nuevo desarrollo
- evites gastar tokens creando una estructura totalmente desde cero si puedes limpiar, reorganizar o reutilizar una base inicial en este destino
- dejes allí el proyecto consolidado
- tomes este proyecto como el espacio principal de construcción
- prepares una estructura limpia, ordenada y lista para crecer

La intención es que el nuevo proyecto se construya en esta ruta destino, apoyándose en las referencias anteriores, pero dejando el resultado central de trabajo en:

`C:\Users\ander\Documents\Anderson\Personales\dropshipping`


#### Ruta de referencia backend / microservicios
`C:\Users\ander\Documents\Anderson\Universidad\Oh Churus`

En esta ruta existe un proyecto de referencia con el stack deseado.  
Quiero que:

- Analices su arquitectura.
- Estudies la estructura de carpetas.
- Revises cómo están construidos los microservicios base.
- Reutilices los patrones técnicos y organizativos.

Especialmente revisa si existen o cómo están manejados estos componentes:

- Gateway
- Discovery
- Language / internacionalización
- Administración
- Auth / manejo de tokens
- Convenciones de paquetes
- Configuración por ambientes
- Manejo de seguridad
- Estructura de DTOs, entities, services, repositories, controllers
- Comunicación entre componentes

**No quiero que inventes una estructura nueva si ya existe una base válida allí.**  
Quiero que tomes ese proyecto como referencia para construir el nuevo producto con una metodología semejante.

---

## Stack tecnológico obligatorio

La plataforma propia SaaS debe construirse con este stack:

### Backend
- Java + Spring Boot

### Frontend
- React

### Base de datos
- PostgreSQL

### Infraestructura local
- Docker
- Docker Compose

### CMS / Ecommerce
- WordPress

---

## Arquitectura esperada

Quiero que el sistema final tenga **tres componentes principales**:

### 1. WordPress ecommerce
Este será el canal visible de venta.

Debe ser una tienda web enfocada en ecommerce, con estética:

- minimalista
- premium
- limpia
- moderna
- mucho espacio en blanco
- jerarquía tipográfica clara
- sensación visual tipo Apple

Quiero que inicialmente investigues visualmente la página de Apple y tomes esa referencia como inspiración de UX/UI, **sin copiarla literalmente**, sino extrayendo principios como:

- limpieza visual
- composición elegante
- pocos elementos por pantalla
- imágenes hero
- sensación premium
- buena experiencia en móvil y desktop

El WordPress debe estar preparado para:

- catálogo de productos
- fichas de producto
- imágenes
- precios
- promociones
- categorías
- filtros
- carrito
- checkout
- páginas informativas
- integración futura con pasarelas de pago
- administración sencilla

### 2. Plataforma SaaS / middleware central
Este será el cerebro del sistema.

Debe encargarse de:

- consultar fuentes externas gratuitas o de bajo costo
- detectar productos potenciales o tendencias
- capturar catálogos o datos base
- transformar esa información
- enriquecer títulos y descripciones con IA
- generar contenido comercial
- proponer precios o márgenes
- publicar o sincronizar productos hacia WordPress
- recopilar métricas
- mostrar estadísticas
- sugerir productos con potencial
- centralizar automatizaciones futuras

### 3. Infraestructura dockerizada
Todo debe poder ejecutarse localmente con Docker, incluyendo:

- WordPress
- base de datos WordPress
- backend SaaS
- frontend SaaS
- PostgreSQL del SaaS
- componentes auxiliares si se requieren
- volúmenes persistentes

Necesito que el entorno sea:

- reproducible
- persistente
- portable
- fácil de levantar
- organizado por servicios
- preparado para luego desplegarse

---

## Qué necesito que hagas

No quiero una respuesta superficial.  
Quiero que desarrolles el trabajo en **múltiples niveles**, de forma ordenada.

---

## Fase 1: análisis previo

Antes de construir, necesito que hagas un análisis técnico y funcional de todo el escenario.

### Quiero que:
1. Analices los proyectos de referencia.
2. Me expliques qué conviene reutilizar del WordPress existente.
3. Me expliques qué conviene reutilizar del proyecto de microservicios.
4. Identifiques riesgos, vacíos, dependencias y oportunidades.
5. Definas una arquitectura objetivo inicial razonable y ejecutable.

### Entregable esperado de esta fase
- diagnóstico del estado base
- propuesta de arquitectura inicial
- componentes a reutilizar
- componentes nuevos a construir
- decisiones técnicas justificadas

---

## Fase 2: definición funcional del producto

Quiero que definas la solución funcionalmente como si estuvieras diseñando un MVP serio.

### Debes definir:
- objetivo del producto
- propuesta de valor
- usuario administrador
- flujo operativo
- flujo de importación
- flujo de enriquecimiento con IA
- flujo de publicación a WordPress
- flujo de análisis de tendencias
- flujo de estadísticas
- backlog inicial priorizado

### Además
Como el segmento inicial será ropa para dama y caballero, debes pensar:

- taxonomía base del catálogo
- categorías
- atributos
- tallas
- colores
- género
- variantes
- imágenes
- filtros útiles
- tipo de copy comercial adecuado

---

## Fase 3: arquitectura técnica detallada

Quiero una propuesta concreta de arquitectura.

### A nivel del backend SaaS
Define:

- qué microservicios sí vale la pena tener desde el inicio
- cuáles conviene dejar monolito modular al principio
- cómo estructurar paquetes, módulos o servicios
- cómo manejar autenticación
- cómo exponer APIs
- cómo manejar sincronización con WordPress
- cómo manejar tareas programadas
- cómo guardar logs
- cómo modelar productos, categorías, fuentes, tendencias, publicaciones y estadísticas

### A nivel del frontend React
Define:

- estructura del frontend
- módulos o vistas
- dashboard principal
- pantalla de fuentes
- pantalla de productos detectados
- pantalla de revisión manual
- pantalla de generación de contenido
- pantalla de publicación
- pantalla de métricas
- pantalla de configuración
- manejo de autenticación
- consumo de APIs
- estrategia visual alineada al producto

### A nivel de WordPress
Define:

- qué plugin ecommerce conviene
- qué plugin o integración propia crear
- cómo se conectará con el backend SaaS
- cómo se publicarán productos
- cómo se actualizarán existencias/precios/descripciones
- cómo se manejarán categorías, atributos, variaciones e imágenes
- cómo preservar limpieza y performance

---

## Fase 4: diseño del entorno Docker

Necesito que diseñes el entorno local completo.

### Incluye:
- servicios necesarios
- `docker-compose.yml`
- redes
- volúmenes
- persistencia
- variables de entorno
- nombres de servicios
- puertos
- dependencias entre contenedores

### Debes contemplar:
1. WordPress persistente
2. base de datos del WordPress persistente
3. backend Spring Boot
4. frontend React
5. PostgreSQL del SaaS
6. posible servicio auxiliar para tareas programadas, colas o workers si realmente vale la pena

### Importante
Quiero que el WordPress y sus datos queden **almacenables y persistentes**.  
Nada de una instalación efímera.

---

## Fase 5: fuentes de datos, tendencias y automatización

Aquí necesito criterio práctico, no teoría vacía.

Quiero que investigues y propongas **fuentes gratuitas o de bajo costo** para:

- obtener productos
- identificar tendencias
- revisar demanda
- detectar señales de oportunidad

### Evalúa especialmente:
- Mercado Libre
- Amazon
- Google Trends
- otras fuentes accesibles legalmente
- APIs públicas o semi públicas viables
- opciones donde no tengamos que pagar al inicio

### Debes responder:
- qué fuentes se pueden usar gratis realmente
- cuáles tienen limitaciones
- cuáles requieren registro
- cuáles tienen costos escondidos o escalamiento costoso
- cuál conviene usar para el MVP
- cuál conviene dejar para una segunda fase

### Sobre Amazon
Analiza si realmente es viable usarlo como fuente en Colombia y qué restricciones existen operativamente.  
No asumas que se puede revender sin más: revisa las implicaciones técnicas y comerciales.

---

## Fase 6: integración con IA

Quiero que diseñes cómo se usará IA dentro del sistema.

### Casos de uso mínimos
- mejorar títulos
- generar descripciones
- generar bullets comerciales
- resumir atributos
- enriquecer SEO
- redactar textos para producto
- sugerir categorías
- sugerir etiquetas
- proponer precio de venta basado en reglas

### Muy importante
Ten en cuenta este contexto:

- Ya cuento con suscripción paga de ChatGPT.
- Ya cuento con suscripción paga de Claude.

Quiero que distingas claramente entre:

1. lo que puede hacerse usando estas herramientas **como apoyo al desarrollo**
2. lo que requiere **integración vía API** dentro del producto
3. lo que generaría **costos adicionales reales**

No quiero que asumas que por tener la suscripción web ya tengo acceso API ilimitado, porque sé que no es así.

### Entonces debes explicar:
- qué partes del desarrollo pueden apoyarse en ChatGPT/Claude sin costo extra
- qué partes del producto necesitarían APIs pagas si se automatizan dentro del software
- qué alternativas existen para minimizar costo al inicio
- qué estrategia recomiendas para el MVP

---

## Fase 7: plugin o integración WordPress

Quiero que definas si conviene:

- construir un plugin propio de WordPress
- usar la REST API de WordPress/WooCommerce desde el backend
- o una mezcla de ambas

### Debes comparar:
- complejidad
- mantenibilidad
- seguridad
- velocidad de implementación
- flexibilidad
- escalabilidad

### Resultado esperado
Quiero una recomendación clara y argumentada sobre cómo publicar productos desde el middleware hacia WordPress.

---

## Fase 8: roadmap de construcción paso a paso

Necesito que lo conviertas en un plan real de ejecución.

### Quiero un roadmap por etapas, por ejemplo:
- etapa 0: análisis de referencias
- etapa 1: levantar entorno Docker base
- etapa 2: montar WordPress ecommerce
- etapa 3: crear backend base
- etapa 4: crear frontend base
- etapa 5: integrar autenticación
- etapa 6: modelar dominio principal
- etapa 7: conexión con fuente de datos inicial
- etapa 8: generar enriquecimiento con IA
- etapa 9: publicar productos a WordPress
- etapa 10: dashboard de administración
- etapa 11: métricas y estadísticas
- etapa 12: hardening y preparación de despliegue

### Para cada etapa quiero:
- objetivo
- tareas
- definición de terminado
- riesgos
- dependencias

---

## Fase 9: criterios de MVP

Necesito que definas qué sí debe entrar en el MVP y qué no.

### Debes separar:
#### Incluido en MVP
#### Posterior al MVP
#### No prioritario

Quiero proteger el alcance para no construir de más.

---

## Fase 10: salida esperada del trabajo

Tu respuesta debe quedar organizada en este orden:

1. Resumen ejecutivo del proyecto
2. Análisis de referencias locales
3. Arquitectura propuesta
4. Diseño funcional del MVP
5. Diseño técnico del backend
6. Diseño técnico del frontend
7. Diseño técnico de WordPress
8. Diseño Docker y persistencia
9. Fuentes de datos y tendencias
10. Estrategia de IA y costos
11. Recomendación de integración con WordPress
12. Roadmap paso a paso
13. Riesgos y mitigaciones
14. Backlog inicial priorizado
15. Estructura de carpetas sugerida
16. Siguiente acción concreta de desarrollo

---

## Nivel de profundidad esperado

No quiero una respuesta corta.  
Quiero un documento técnico y estratégico bien pensado.

### Quiero que:
- argumentes decisiones
- señales trade-offs
- evites humo
- priorices lo realizable
- pienses como alguien que sí va a construir esto
- propongas una base sólida pero no exagerada
- mantengas el foco en un MVP comercializable

---

## Importante: forma de trabajar

No empieces a construir a ciegas.

### Orden obligatorio:
1. Primero analiza los proyectos de referencia.
2. Después propone la arquitectura.
3. Después define el MVP.
4. Después propone la implementación.
5. Después sí pasa a construcción de archivos, estructuras, contenedores y código base.

Si detectas inconsistencias entre lo que existe en los proyectos de referencia y lo que propones, debes explicarlo y justificar cualquier desviación.

---



### Instrucción adicional sobre naming del proyecto
Antes de fijar el nombre definitivo del sistema, propón varias opciones de naming para la marca o producto, alineadas con estas características:

- ecommerce
- dropshipping
- automatización
- tecnología
- estilo premium
- sensación moderna
- posibilidad de crecer a SaaS
- enfoque inicial en moda / ropa
- marca fácil de recordar
- idealmente corta o escalable

Luego recomienda una terna final con breve justificación.


## Consideraciones de negocio

Quiero que mantengas presente lo siguiente:

- El objetivo inicial no es construir una mega plataforma.
- El objetivo es crear algo ejecutable, automatizable y potencialmente vendible.
- Debe poder operar con costos bajos al comienzo.
- Debe estar orientado a monetización progresiva.
- Debe permitir validación rápida.
- Debe dejar una base lista para escalar luego.

---

## Tono y enfoque de la respuesta

Responde con mentalidad de:

- arquitecto
- fundador técnico
- product strategist
- desarrollador senior pragmático

No me des teoría genérica.  
Quiero decisiones concretas, bien explicadas y accionables.

---

## Entregable adicional opcional si lo consideras útil

Si lo ves conveniente, además del análisis principal puedes incluir:

- árbol de carpetas sugerido
- ejemplo de `docker-compose`
- propuesta inicial de entidades
- propuesta de endpoints
- propuesta de cron jobs o procesos automáticos
- propuesta de tablas principales en PostgreSQL
- propuesta de integración inicial con WooCommerce / WordPress REST API

Pero solo después de haber completado bien el análisis principal.

---

## Instrucción final

Actúa como si fueras a construir esto conmigo desde cero, reutilizando inteligentemente los proyectos existentes, manteniendo bajo el costo inicial y maximizando velocidad de validación sin sacrificar una base técnica limpia.

Quiero que tu respuesta esté en español, muy detallada, estructurada y lista para ser usada como guía real de implementación.
