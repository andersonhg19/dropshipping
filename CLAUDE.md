# CLAUDE.md - VISNEX Platform

Este archivo proporciona orientacion a Claude Code cuando trabaja con este repositorio.

## Descripcion del Proyecto

**VISNEX** es una plataforma de dropshipping automatizado con arquitectura hibrida:
- **WordPress ecommerce** - Tienda visible al publico, estetica premium tipo Apple
- **SaaS middleware** - Cerebro del sistema: acquisition (busqueda/importacion) + commerce (enriquecimiento/publicacion)
- **Frontend React** - Panel de administracion del SaaS
- **Docker** - Entorno completo portable y persistente

**Stack**: Java 17, Spring Boot 3.2.0, Spring Cloud 2023.0.0-RC1, PostgreSQL, Next.js 15, React 18, WordPress, Docker

**Estado**: En desarrollo - Preparacion de base completada, iniciando construccion

---

## Protocolo de Inicio de Sesion

**OBLIGATORIO al comenzar cada conversacion:**

1. Preguntar al usuario si va a trabajar sobre un proyecto/tarea ya existente o uno nuevo
2. Si es **existente**: solicitar el nombre del archivo de seguimiento (changelog)
3. Si es **nuevo**: crear archivo de seguimiento en `C:\Users\ander\Documents\proyectos en curso\Bopos-core\`
4. Leer el archivo de seguimiento para retomar contexto

**Archivo de seguimiento actual:** `C:\Users\ander\Documents\proyectos en curso\Bopos-core\dropshipping-saas-changelog.md`

---

## Git - REGLA CRITICA

- **NUNCA** tocar ni usar la cuenta `anderherrerarhiscom` - es la cuenta PROFESIONAL de la empresa
- La cuenta personal es: `andersonhguzman@gmail.com`
- **NUNCA** modificar git config global
- Antes de cualquier operacion git, configurar LOCAL:
```bash
git config --local user.email "andersonhguzman@gmail.com"
git config --local user.name "Anderson Herrera"
```

---

## Flujo de Trabajo Obligatorio

### Antes de tocar codigo: PLAN primero
```
1. Presentar PLAN con:
   - Archivos a modificar (rutas completas)
   - Que cambios exactos se haran
   - Impacto esperado y riesgos
   - Como se validara que funciona

2. ESPERAR aprobacion del usuario

3. Implementar (si es grande, dividir en iteraciones pequenas)
```

### Principios no negociables
- **Cambios minimos**: No refactorizar "porque si". Solo lo necesario.
- **Compatibilidad**: Todo debe ser compatible con lo existente.
- **No asumir**: Si algo no esta claro, PREGUNTAR antes de continuar.
- **Calidad > Velocidad**: Preferir iterar lento con certeza que rapido con riesgo.
- **Idioma**: Toda comunicacion con el usuario debe ser en espanol.

---

## Arquitectura

```
                    ┌──────────────┐
                    │   Frontend   │ :3000 (Next.js / React)
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │   Gateway    │ :8820
                    └──────┬───────┘
                           │
     ┌──────────┬──────────┼──────────┬──────────┐
     │          │          │          │          │
  ┌──┴──┐  ┌───┴──┐  ┌───┴───┐  ┌──┴───┐  ┌──┴───┐
  │Auth │  │Admin │  │Audit  │  │Acqui │  │Comm  │
  │:8821│  │:8823 │  │:8827  │  │:8830 │  │:8831 │
  └──┬──┘  └───┬──┘  └───┬───┘  └──┬───┘  └──┬───┘
     │         │         │         │         │
  ┌──┴─────────┴─────────┴─────────┴─────────┴──┐
  │              PostgreSQL :5432                 │
  └──────────────────────────────────────────────┘

  WordPress :8085 + MySQL :3306 | phpMyAdmin :8081
  Discovery (Eureka) :8760 | Language :8822
```

### Servicios

| Puerto | Servicio | Proposito | BD |
|--------|----------|-----------|-----|
| 8760 | discovery-service | Registro Eureka | - |
| 8820 | gateway-service | API Gateway + CORS | - |
| 8821 | auth-service | Autenticacion JWT | auth_db |
| 8822 | language-service | Internacionalizacion | lang_db |
| 8823 | administration-service | Empresas, usuarios, roles, config | admin_db |
| 8827 | audit-service | Registro de auditoria | audit_db |
| 8830 | acquisition-service | Busqueda, importacion, proveedores, scores | acquisition_db |
| 8831 | commerce-service | Catalogo, IA, pricing, publicacion, stats | commerce_db |
| 3000 | frontend | Panel admin (Next.js) | - |
| 8085 | wordpress | Tienda ecommerce | wordpress_vn (MySQL) |

---

## Comandos

```bash
# TODO unificado
docker-compose --env-file ./backend/.env up --build -d

# Solo infraestructura
docker-compose -f docker-compose.infra.yml --env-file ./backend/.env up --build -d

# Solo WordPress
docker-compose -f docker-compose.wp.yml up --build -d

# Compilar servicio especifico
cd backend && mvn clean package -pl {nombre-servicio}

# Compilar todo
cd backend && mvn clean package
```

---

## Estandares de Desarrollo

### Context Path
Todos los servicios: `/vn-api`

### Paquetes Java
`com.visnex.{nombreservicio}` (ej: `com.visnex.administrationservice`, `com.visnex.acquisitionservice`)

### Prefijo de Tablas BD
`vn_{servicio}_{entidad}` (ej: `vn_adm_company`, `vn_acq_supplier`, `vn_com_product`)

---

## Campos OBLIGATORIOS en Todas las Entidades

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@EqualsAndHashCode.Include
private Long id;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "company_id")
private Company company;                    // SIEMPRE obligatorio

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "subsidiary_id")
private Subsidiary subsidiary;              // SIEMPRE obligatorio

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "modified_by")
private User modifiedBy;                    // Quien creo/modifico

@Column(columnDefinition = "boolean default true")
private Boolean active = true;              // Soft delete

@CreationTimestamp
@Column(updatable = false)
private LocalDateTime creation;             // Solo en Entity, NUNCA en DTO output

@UpdateTimestamp
private LocalDateTime lastUpdate;           // Solo en Entity, NUNCA en DTO output
```

### Anotaciones obligatorias en toda Entity
```java
@Entity
@Table(name = "vn_{srv}_{entity}")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
```

---

## Patron de DTOs

### Input DTO (Request)
- Campos necesarios para crear/actualizar
- Incluye `@Schema` con description y example
- NO incluye creation, lastUpdate
- Debe tener: idCompany, idSubsidiary, idModifiedBy (Long)

### Filter DTO (Busqueda/Paginacion)
- Campos de filtro opcionales
- Paginacion: page (default 0), size (default 20, max 200)

### Output DTO (Result*DTO)
- **NUNCA** incluye creation ni lastUpdate
- **SI** incluye campos enriquecidos:
  - `companyName` (NO nameCompany)
  - `subsidiaryName` (NO nameSubsidiary)
  - `modifiedBy` (nombre del usuario)
- Convencion: `{entidad}Name` (ej: companyName, subsidiaryName, supplierName)

---

## Patron de Servicios (ServiceImpl)

### Estructura obligatoria
```java
@Service
public class XyzServiceImpl implements XyzService {
    // Dependencias
    private final XyzRepository repository;
    private final XyzMapper mapper;
    private final ValidationUtils validation;
    private final ConnectInternalApi connectInternalApi;
    @Autowired ApplicationEventPublisher eventPublisher;
    @Autowired ChangeLogUtil<Xyz> changeLogUtil;
    
    // Helpers de idioma
    private static final String DEFAULT_LANG = "es";
    private String lang(String language) {
        return (language == null || language.isBlank()) ? DEFAULT_LANG : language;
    }
    private String m(String key, String lng) {
        try { return connectInternalApi.chargeMessage(key, lng); }
        catch (Exception e) { return key; }
    }
    
    // 3 metodos base OBLIGATORIOS
    ResultDTO saveAndUpdate(XyzDTO dto, String language);
    ResultDTO getById(Long id, String language);
    ResultDTO getAllItems(XyzFilterDTO filter, String language);
}
```

### Flujo de saveAndUpdate
1. Normalizar idioma
2. Validar DTO con ValidationUtils
3. Si `dto.getId() == null` → CREATE (verificar unicidad, guardar, publicar evento)
4. Si `dto.getId() != null` → UPDATE (cargar viejo, verificar unicidad excluyendo actual, guardar, publicar evento con cambios)
5. Retornar `new ResultDTO(resultado)`

### Flujo de getAllItems
1. Normalizar paginacion (page=0, size=20, max 200)
2. Llamar customRepository.findAllWithCriteria()
3. Retornar PageDTO

---

## Validaciones: Usar ValidationUtils SIEMPRE

```java
// CORRECTO - Centralizado
validation.requireCompany(idCompany, language);
validation.requireUser(idUser, language);
validation.requireSubsidiary(idSubsidiary, language);

// INCORRECTO - No hacer validacion manual inline
if (dto.getIdCompany() == null) return error("...");
```

Si el servicio no tiene ValidationUtils, crear uno siguiendo el patron del administration-service.

---

## Completado de Datos (Enrichment)

**Usar CompletionUtils centralizado con caches ConcurrentHashMap:**

```java
completionUtils.enrich(resultDTO, language);       // Un solo DTO
completionUtils.enrichList(listDTO, language);      // Lista con cache optimizado
```

**Patron de cache:**
```java
Map<Long, String> companyNameCache = new ConcurrentHashMap<>();
String name = companyNameCache.computeIfAbsent(id, 
    k -> companyRepository.findById(k).map(Company::getName).orElse(null));
```

Si el servicio no tiene CompletionUtils, crear uno siguiendo el patron del administration-service.

---

## Mapeo Entity <-> DTO

### Patron principal: MapStruct con BaseMapper

```java
// BaseMapper interface (reutilizable)
public interface BaseMapper<E, InputDTO, OutputDTO> {
    OutputDTO toDTO(E entity);
    List<OutputDTO> toDTOList(List<E> entities);
    E toEntity(InputDTO dto);
}

// Mapper especifico
@Mapper(componentModel = "spring")
public interface XyzMapper extends BaseMapper<Xyz, XyzDTO, ResultXyzDTO> {
    @Mapping(target = "idModifiedBy", expression = "java(entity.getModifiedBy() != null ? entity.getModifiedBy().getId() : null)")
    @Mapping(target = "modifiedBy", expression = "java(entity.getModifiedBy() != null ? entity.getModifiedBy().getName() : null)")
    @Override
    ResultXyzDTO toDTO(Xyz entity);
    
    @Mapping(target = "creation", ignore = true)
    @Mapping(target = "lastUpdate", ignore = true)
    @Override
    Xyz toEntity(XyzDTO dto);
}
```

**NO mezclar MapStruct y ModelMapper** en el mismo microservicio.

---

## Repositorios Custom

```java
// Interface principal
public interface XyzRepository extends JpaRepository<Xyz, Long>, XyzCustomRepository {}

// Interface custom
public interface XyzCustomRepository {
    Page<ResultXyzDTO> findAllWithCriteria(XyzFilterDTO filter, Pageable pageable);
}

// Implementacion (OBLIGATORIO sufijo Impl)
public class XyzCustomRepositoryImpl implements XyzCustomRepository {
    // Usar PredicateBuilderUtil para construir queries dinamicas
}
```

### PredicateBuilderUtil (reutilizable)
```java
PredicateBuilderUtil.addEquals(predicates, cb, root, "fieldName", value);
PredicateBuilderUtil.addLikeIgnoreCase(predicates, cb, root, "name", searchTerm);
PredicateBuilderUtil.addJoinEquals(predicates, cb, root, "company", "id", companyId);
PredicateBuilderUtil.addDateRange(predicates, cb, root, "creation", startDate, endDate);
```

---

## Controllers

### Todos los endpoints son POST
```java
@PostMapping(value = "/save", produces = "application/json")
@PostMapping(value = "/get/{id}", produces = "application/json")  // NO @GetMapping
@PostMapping(value = "/all", produces = "application/json")
```

### Versionado: `/v2/{recurso}`
```
/vn-api/v2/company/save
/vn-api/v2/company/get/{id}
/vn-api/v2/company/all
```

### Header obligatorio: `lng` (idioma)

---

## Respuesta Estandarizada

```java
new ResultDTO(data)                    // Exito: correct=true, message="OK", errorCode=0
new ResultDTO(false, "mensaje", 101)   // Error: unicidad (ej: NIT ya existe)
new ResultDTO(false, "mensaje", 102)   // Error: no encontrado / validacion
new ResultDTO(false, "mensaje", 103)   // Error: proceso / body required
new ResultDTO(false, "mensaje", 120)   // Error: campo requerido
```

### Paginacion
```json
{
  "correct": true,
  "message": "OK",
  "errorCode": 0,
  "object": {
    "page": 0,
    "size": 20,
    "totalPage": 1,
    "list": [...]
  }
}
```

---

## Mensajes de Error (i18n)

1. Verificar si existe en el enum `Message.Msj` del microservicio
2. Si no existe, agregarlo
3. Usar siempre el servicio de language: `m(Message.Msj.xxx.toString(), language)`
4. **NUNCA hardcodear mensajes** directamente en el codigo

---

## Auditoria

Cada servicio registra cambios mediante eventos:
```java
// En ServiceImpl
validation.publishChanges(oldEntity, newEntity, dto.getIdModifiedBy());

// O directamente
eventPublisher.publishEvent(new EntityChangeEvent(entity, changes, userId));
```

---

## Checklist de Entidad Nueva

Al crear una entidad nueva, verificar que incluya:

```
[] Entity (con TODOS los campos obligatorios: id, company, subsidiary, modifiedBy, active, creation, lastUpdate)
[] DTO Input (Request con @Schema)
[] DTO Filter (paginacion + filtros)
[] DTO Output (Result*DTO - SIN creation/lastUpdate, CON nombres enriquecidos)
[] Repository (extends JpaRepository + CustomRepository)
[] CustomRepository interface
[] CustomRepositoryImpl (sufijo Impl obligatorio)
[] Mapper (MapStruct con BaseMapper)
[] Service interface
[] ServiceImpl (saveAndUpdate, getById, getAllItems + validaciones con ValidationUtils)
[] Controller (versionado /v2/, todos POST, header lng)
[] Registro en SecurityConfig
[] Mensajes en enum Message.Msj
[] Actualizar coleccion Postman
```

---

## Formularios (Frontend)

- **Maximo 8 campos visibles** por formulario
- Si hay mas campos, organizar en **tabs**
- Defaults inteligentes (si se puede calcular, no pedirlo)
- JSON para campos flexibles (atributos, variantes)
- Templates reutilizables para importacion

---

## Variables de Entorno
Siempre con valores por defecto: `${VARIABLE:default_value}`

---

## Documentos del Proyecto

| Documento | Ubicacion |
|-----------|-----------|
| Plan maestro | `seguimiento/PLAN_MAESTRO_DROPSHIPPING.md` |
| Puntos criticos | `seguimiento/PUNTOS_CRITICOS_NO_OLVIDAR.md` |
| Arquitectura 2 servicios | `seguimiento/PROPUESTA_ARQUITECTURA_2_SERVICIOS.md` |
| Entidades simplificadas | `seguimiento/ENTIDADES_SIMPLIFICADAS_V2.md` |
| Investigacion APIs | `seguimiento/investigacion-apis-fuentes-datos.md` |
| Investigacion Shein | `seguimiento/investigacion-shein-moda.md` |
| Investigacion herramientas | `seguimiento/investigacion-herramientas-dropshipping.md` |
| Analisis revision plan | `seguimiento/ANALISIS_REVISION_PLAN_V2.md` |

---

## Proyectos de Referencia (solo lectura, NO MODIFICAR)

- **JeesFull**: `C:\Users\ander\Documents\Anderson\JeesFull` (WordPress dockerizado)
