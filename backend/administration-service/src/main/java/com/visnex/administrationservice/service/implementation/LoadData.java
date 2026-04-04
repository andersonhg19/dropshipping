package com.visnex.administrationservice.service.implementation;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Configuration;
import com.visnex.administrationservice.entity.Module;
import com.visnex.administrationservice.entity.PageTypeUser;
import com.visnex.administrationservice.entity.Pages;
import com.visnex.administrationservice.entity.Style;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.TypeUser;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.repository.CompanyRepository;
import com.visnex.administrationservice.repository.ConfigurationRepository;
import com.visnex.administrationservice.repository.ModuleRepository;
import com.visnex.administrationservice.repository.PageTypeUserRepository;
import com.visnex.administrationservice.repository.PagesRepository;
import com.visnex.administrationservice.repository.StyleRepository;
import com.visnex.administrationservice.repository.SubsidiaryRepository;
import com.visnex.administrationservice.repository.TypeUserRepository;
import com.visnex.administrationservice.repository.UserRepository;

@Service
public class LoadData {

    private final ObjectMapper objectMapper;

    private final CompanyRepository companyRepository;
    private final TypeUserRepository typeUserRepository;
    private final UserRepository userRepository;
    private final SubsidiaryRepository subsidiaryRepository;
    private final ConfigurationRepository configurationRepository;
    private final StyleRepository styleRepository;
    private final PagesRepository pagesRepository;
    private final PageTypeUserRepository pageTypeUserRepository;
    private final ModuleRepository moduleRepository;

    @Autowired
    public LoadData(UserRepository userRepository,
                    TypeUserRepository typeUserRepository,
                    PagesRepository pagesRepository,
                    PageTypeUserRepository pageTypeUserRepository,
                    CompanyRepository companyRepository,
                    SubsidiaryRepository subsidiaryRepository,
                    ConfigurationRepository configurationRepository,
                    StyleRepository styleRepository,
                    ModuleRepository moduleRepository,
                    ObjectMapper objectMapper) {

        this.userRepository = userRepository;
        this.typeUserRepository = typeUserRepository;
        this.companyRepository = companyRepository;
        this.subsidiaryRepository = subsidiaryRepository;
        this.configurationRepository = configurationRepository;
        this.styleRepository = styleRepository;
        this.pagesRepository = pagesRepository;
        this.pageTypeUserRepository = pageTypeUserRepository;
        this.moduleRepository = moduleRepository;
        this.objectMapper = objectMapper;
    }

    public void seedData() {
        try {
            // 1) Entidades base (sin dependencias)
            System.out.println("Loading Company data...");
            loadAndSaveEntities("dataSeeder/companyData.json", Company.class, companyRepository);
            
            // 2) Entidades que dependen de Company
            System.out.println("Loading TypeUser data...");
            loadAndSaveEntities("dataSeeder/typeUsersData.json", TypeUser.class, typeUserRepository);
            
            System.out.println("Loading User data...");
            loadAndSaveEntities("dataSeeder/usersData.json", User.class, userRepository);
            
            System.out.println("Loading Subsidiary data...");
            loadAndSaveEntities("dataSeeder/subsidiaryData.json", Subsidiary.class, subsidiaryRepository);

            // 3) Entidades con dependencias adicionales
            System.out.println("Loading Module data...");
            loadAndSaveEntities("dataSeeder/moduleData.json", Module.class, moduleRepository);
            
            System.out.println("Loading Pages data...");
            loadAndSaveEntities("dataSeeder/pagesData.json", Pages.class, pagesRepository);
            
            System.out.println("Loading PageTypeUser data...");
            loadAndSaveEntities("dataSeeder/pageTypeUserData.json", PageTypeUser.class, pageTypeUserRepository);
            
            System.out.println("Loading Configuration data...");
            loadAndSaveEntities("dataSeeder/ConfigurationData.json", Configuration.class, configurationRepository);
            
            System.out.println("Loading Style data...");
            loadAndSaveEntities("dataSeeder/StyleData.json", Style.class, styleRepository);

            // 4) Backfill de relaciones (modifiedBy, etc.)
            System.out.println("Backfilling relations...");
            backfillRelations();

            // 5) Configuración por defecto de centro de costos
            System.out.println("Loading default CostCenter configuration...");
            loadDefaultCostCenterConfiguration();
            
            System.out.println("Seed data loading completed successfully!");

        } catch (Exception e) {
            System.err.println("Error loading seed data: " + e.getMessage());
            e.printStackTrace();
            // No lanzar excepción para no detener el startup, pero loguear el error
        }
    }

    /**
     * Método genérico para cargar y guardar entidades desde JSON
     */
    @SuppressWarnings("unchecked")
    private <T> void loadAndSaveEntities(String fileName, Class<T> entityClass, Object repository) throws IOException {
        try {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream(fileName);
            if (inputStream == null) {
                throw new IOException("File not found: " + fileName);
            }

            List<Map<String, Object>> rawData = objectMapper.readValue(
                    inputStream,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );

            // Procesar según el tipo de entidad
            if (repository instanceof CompanyRepository && entityClass.equals(Company.class)) {
                if (companyRepository.findAll().isEmpty()) {
                    List<Company> entities = mapToCompanies(rawData);
                    companyRepository.saveAll(entities);
                }
            } else if (repository instanceof TypeUserRepository && entityClass.equals(TypeUser.class)) {
                if (typeUserRepository.findAll().isEmpty()) {
                    List<TypeUser> entities = mapToTypeUsers(rawData);
                    typeUserRepository.saveAll(entities);
                }
            } else if (repository instanceof UserRepository && entityClass.equals(User.class)) {
                if (userRepository.findAll().isEmpty()) {
                    List<User> entities = mapToUsers(rawData);
                    userRepository.saveAll(entities);
                }
            } else if (repository instanceof SubsidiaryRepository && entityClass.equals(Subsidiary.class)) {
                if (subsidiaryRepository.findAll().isEmpty()) {
                    List<Subsidiary> entities = mapToSubsidiaries(rawData);
                    subsidiaryRepository.saveAll(entities);
                }
            } else if (repository instanceof ModuleRepository && entityClass.equals(Module.class)) {
                if (moduleRepository.findAll().isEmpty()) {
                    List<Module> entities = mapToModules(rawData);
                    moduleRepository.saveAll(entities);
                }
            } else if (repository instanceof PagesRepository && entityClass.equals(Pages.class)) {
                pagesRepository.saveAll(mapToPages(rawData));
            } else if (repository instanceof PageTypeUserRepository && entityClass.equals(PageTypeUser.class)) {
                if (pageTypeUserRepository.findAll().isEmpty()) {
                    List<PageTypeUser> entities = mapToPageTypeUsers(rawData);
                    pageTypeUserRepository.saveAll(entities);
                }
            } else if (repository instanceof ConfigurationRepository && entityClass.equals(Configuration.class)) {
                // Configuration tiene lógica especial: verificar por nombre antes de crear
                List<Configuration> entities = mapToConfigurations(rawData);
                for (Configuration cfg : entities) {
                    try {
                        // Validar que tenga company (obligatorio)
                        if (cfg.getCompany() == null || cfg.getCompany().getId() == null) {
                            System.err.println("Warning: Configuration sin company, se omite: " + cfg.getName());
                            continue;
                        }
                        // Verificar si ya existe una configuración con el mismo nombre para la misma company/subsidiary
                        Long subsidiaryId = cfg.getSubsidiary() != null ? cfg.getSubsidiary().getId() : null;
                        boolean exists = configurationRepository
                                .findByCompany_IdAndSubsidiary_IdAndNameIgnoreCase(
                                        cfg.getCompany().getId(),
                                        subsidiaryId,
                                        cfg.getName())
                                .isPresent();
                        if (!exists) {
                            configurationRepository.save(cfg);
                        } else {
                            System.out.println("Configuration '" + cfg.getName() + "' already exists, skipping.");
                        }
                    } catch (Exception e) {
                        System.err.println("Error processing Configuration: " + e.getMessage());
                        // Continuar con la siguiente configuración
                    }
                }
            } else if (repository instanceof StyleRepository && entityClass.equals(Style.class)) {
                if (styleRepository.findAll().isEmpty()) {
                    List<Style> entities = mapToStyles(rawData);
                    styleRepository.saveAll(entities);
                }
            }

        } catch (Exception err) {
            System.err.println("FileName: " + fileName);
            System.err.println("Error: " + err.getMessage());
            err.printStackTrace();
        }
    }

    // ===================== MAPPERS =====================

    private List<Company> mapToCompanies(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            Company company = new Company();
            if (map.get("id") != null) company.setId(toLong(map.get("id")));
            if (map.get("name") != null) company.setName((String) map.get("name"));
            if (map.get("nit") != null) company.setNit((String) map.get("nit"));
            if (map.get("address") != null) company.setAddress((String) map.get("address"));
            if (map.get("contactPerson") != null) company.setLegalRepresentative((String) map.get("contactPerson"));
            if (map.get("phone") != null) company.setPhone((String) map.get("phone"));
            if (map.get("mail") != null) company.setEmail((String) map.get("mail"));
            if (map.get("state") != null) company.setActive(Boolean.TRUE.equals(map.get("state")));
            if (map.get("creation") != null) {
                try {
                    company.setCreation(LocalDateTime.parse((String) map.get("creation")));
                } catch (Exception e) {
                    company.setCreation(LocalDateTime.now());
                }
            }
            return company;
        }).toList();
    }

    private List<TypeUser> mapToTypeUsers(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            TypeUser typeUser = new TypeUser();
            if (map.get("id") != null) typeUser.setId(toLong(map.get("id")));
            if (map.get("name") != null) typeUser.setName((String) map.get("name"));
            // Manejar tanto "active" como "isActive" por compatibilidad
            if (map.get("active") != null) {
                typeUser.setActive(Boolean.TRUE.equals(map.get("active")));
            } else if (map.get("isActive") != null) {
                typeUser.setActive(Boolean.TRUE.equals(map.get("isActive")));
            }
            // Company es obligatorio para TypeUser
            if (map.get("idCompany") != null) {
                Long companyId = toLong(map.get("idCompany"));
                Company company = companyRepository.findById(companyId)
                        .orElseThrow(() -> new RuntimeException("Company id=" + companyId + " no existe para TypeUser"));
                typeUser.setCompany(company);
            } else {
                throw new RuntimeException("TypeUser requiere idCompany");
            }
            if (map.get("idSubsidiary") != null) {
                subsidiaryRepository.findById(toLong(map.get("idSubsidiary"))).ifPresent(typeUser::setSubsidiary);
            }
            return typeUser;
        }).toList();
    }

    private List<User> mapToUsers(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            User user = new User();
            if (map.get("id") != null) user.setId(toLong(map.get("id")));
            if (map.get("name") != null) user.setName((String) map.get("name"));
            if (map.get("lastName") != null) user.setLastName((String) map.get("lastName"));
            if (map.get("dni") != null) user.setDni((String) map.get("dni"));
            if (map.get("email") != null) user.setEmail((String) map.get("email"));
            if (map.get("cellphone") != null) user.setCellphone((String) map.get("cellphone"));
            if (map.get("password") != null) user.setPassword((String) map.get("password"));
            if (map.get("isAdmin") != null) user.setAdmin(Boolean.TRUE.equals(map.get("isAdmin")));
            if (map.get("isActive") != null) user.setActive(Boolean.TRUE.equals(map.get("isActive")));
            // Company es opcional pero se recomienda
            if (map.get("idCompany") != null) {
                companyRepository.findById(toLong(map.get("idCompany"))).ifPresent(user::setCompany);
            }
            // TypeUser es opcional
            if (map.get("idTypeUser") != null) {
                typeUserRepository.findById(toLong(map.get("idTypeUser"))).ifPresent(user::setTypeUser);
            }
            // Subsidiary es opcional
            if (map.get("idSubsidiary") != null) {
                subsidiaryRepository.findById(toLong(map.get("idSubsidiary"))).ifPresent(user::setSubsidiary);
            }
            return user;
        }).toList();
    }

    private List<Subsidiary> mapToSubsidiaries(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            Subsidiary subsidiary = new Subsidiary();
            if (map.get("id") != null) subsidiary.setId(toLong(map.get("id")));
            if (map.get("name") != null) subsidiary.setName((String) map.get("name"));
            if (map.get("nit") != null) subsidiary.setNit((String) map.get("nit"));
            if (map.get("address") != null) subsidiary.setAddress((String) map.get("address"));
            if (map.get("contactPerson") != null) subsidiary.setContactPerson((String) map.get("contactPerson"));
            if (map.get("phone") != null) subsidiary.setPhone((String) map.get("phone"));
            if (map.get("mail") != null) subsidiary.setEmail((String) map.get("mail"));
            if (map.get("state") != null) subsidiary.setActive(Boolean.TRUE.equals(map.get("state")));
            if (map.get("decimalsNumber") != null) subsidiary.setDecimalsNumber((Integer) map.get("decimalsNumber"));
            if (map.get("roundingType") != null) subsidiary.setRoundingType((String) map.get("roundingType"));
            if (map.get("idCompany") != null) {
                Long companyId = toLong(map.get("idCompany"));
                Company company = companyRepository.findById(companyId)
                        .orElseThrow(() -> new RuntimeException("Company id=" + companyId + " no existe"));
                subsidiary.setCompany(company);
            }
            return subsidiary;
        }).toList();
    }

    private List<Module> mapToModules(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            Module module = new Module();
            if (map.get("id") != null) module.setId(toLong(map.get("id")));
            if (map.get("name") != null) module.setName((String) map.get("name"));
            if (map.get("active") != null) module.setActive(Boolean.TRUE.equals(map.get("active")));
            // ModifiedBy es opcional para Module
            if (map.get("idModifiedBy") != null) {
                userRepository.findById(toLong(map.get("idModifiedBy"))).ifPresent(module::setModifiedBy);
            } else if (map.get("idUser") != null) {
                // Compatibilidad: algunos JSONs usan "idUser"
                userRepository.findById(toLong(map.get("idUser"))).ifPresent(module::setModifiedBy);
            }
            return module;
        }).toList();
    }

    private List<Pages> mapToPages(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            Pages page = new Pages();
            if (map.get("id") != null) page.setId(toLong(map.get("id")));
            if (map.get("name") != null) page.setName((String) map.get("name"));
            if (map.get("npage") != null) page.setNpage((String) map.get("npage"));
            if (map.get("icon") != null) page.setIcon((String) map.get("icon"));
            // Manejar tanto "active" como "isActive" por compatibilidad
            if (map.get("active") != null) {
                page.setActive(Boolean.TRUE.equals(map.get("active")));
            } else if (map.get("isActive") != null) {
                page.setActive(Boolean.TRUE.equals(map.get("isActive")));
            }
            // Module es obligatorio para Pages
            if (map.get("idModule") != null) {
                Long moduleId = toLong(map.get("idModule"));
                Module module = moduleRepository.findById(moduleId)
                        .orElseThrow(() -> new RuntimeException("Module id=" + moduleId + " no existe para Pages"));
                page.setModule(module);
            } else {
                throw new RuntimeException("Pages requiere idModule");
            }
            if (map.get("idModifiedBy") != null) {
                userRepository.findById(toLong(map.get("idModifiedBy"))).ifPresent(page::setModifiedBy);
            } else if (map.get("idUser") != null) {
                // Compatibilidad: algunos JSONs usan "idUser" en lugar de "idModifiedBy"
                userRepository.findById(toLong(map.get("idUser"))).ifPresent(page::setModifiedBy);
            }
            return page;
        }).toList();
    }

    private List<PageTypeUser> mapToPageTypeUsers(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            PageTypeUser ptu = new PageTypeUser();
            // Page es obligatorio
            if (map.get("idPage") != null) {
                Long pageId = toLong(map.get("idPage"));
                Pages page = pagesRepository.findById(pageId)
                        .orElseThrow(() -> new RuntimeException("Page id=" + pageId + " no existe para PageTypeUser"));
                ptu.setPage(page);
            } else if (map.get("pages_id") != null) {
                // Compatibilidad: algunos JSONs usan "pages_id"
                Long pageId = toLong(map.get("pages_id"));
                Pages page = pagesRepository.findById(pageId)
                        .orElseThrow(() -> new RuntimeException("Page id=" + pageId + " no existe para PageTypeUser"));
                ptu.setPage(page);
            } else {
                throw new RuntimeException("PageTypeUser requiere idPage");
            }
            // TypeUser es obligatorio
            if (map.get("idTypeUser") != null) {
                Long typeUserId = toLong(map.get("idTypeUser"));
                TypeUser typeUser = typeUserRepository.findById(typeUserId)
                        .orElseThrow(() -> new RuntimeException("TypeUser id=" + typeUserId + " no existe para PageTypeUser"));
                ptu.setTypeUser(typeUser);
            } else {
                throw new RuntimeException("PageTypeUser requiere idTypeUser");
            }
            // ModifiedBy es obligatorio
            if (map.get("idModifiedBy") != null) {
                Long userId = toLong(map.get("idModifiedBy"));
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User id=" + userId + " no existe para PageTypeUser"));
                ptu.setModifiedBy(user);
            } else if (map.get("idUser") != null) {
                // Compatibilidad: algunos JSONs usan "idUser"
                Long userId = toLong(map.get("idUser"));
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User id=" + userId + " no existe para PageTypeUser"));
                ptu.setModifiedBy(user);
            } else {
                throw new RuntimeException("PageTypeUser requiere idModifiedBy");
            }
            // Campos de permisos (obligatorios)
            if (map.get("canCreate") != null) {
                ptu.setCanCreate(Boolean.TRUE.equals(map.get("canCreate")));
            } else if (map.get("isCreate") != null) {
                // Compatibilidad: algunos JSONs usan "isCreate"
                ptu.setCanCreate(Boolean.TRUE.equals(map.get("isCreate")));
            } else {
                ptu.setCanCreate(true); // Default
            }
            if (map.get("canUpdate") != null) {
                ptu.setCanUpdate(Boolean.TRUE.equals(map.get("canUpdate")));
            } else if (map.get("isUpdate") != null) {
                // Compatibilidad: algunos JSONs usan "isUpdate"
                ptu.setCanUpdate(Boolean.TRUE.equals(map.get("isUpdate")));
            } else {
                ptu.setCanUpdate(true); // Default
            }
            if (map.get("canRead") != null) {
                ptu.setCanRead(Boolean.TRUE.equals(map.get("canRead")));
            } else {
                ptu.setCanRead(true); // Default
            }
            if (map.get("canDelete") != null) {
                ptu.setCanDelete(Boolean.TRUE.equals(map.get("canDelete")));
            } else {
                ptu.setCanDelete(false); // Default
            }
            // Active
            if (map.get("active") != null) {
                ptu.setActive(Boolean.TRUE.equals(map.get("active")));
            } else if (map.get("isActive") != null) {
                ptu.setActive(Boolean.TRUE.equals(map.get("isActive")));
            }
            return ptu;
        }).toList();
    }

    private List<Configuration> mapToConfigurations(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            Configuration cfg = new Configuration();
            if (map.get("id") != null) cfg.setId(toLong(map.get("id")));
            if (map.get("name") != null) cfg.setName((String) map.get("name"));
            if (map.get("value") != null) cfg.setValue((String) map.get("value"));
            if (map.get("type") != null) cfg.setType((String) map.get("type"));
            if (map.get("active") != null) cfg.setActive(Boolean.TRUE.equals(map.get("active")));
            // Company es obligatorio para Configuration
            if (map.get("idCompany") != null) {
                Long companyId = toLong(map.get("idCompany"));
                Company company = companyRepository.findById(companyId)
                        .orElseThrow(() -> new RuntimeException("Company id=" + companyId + " no existe para Configuration"));
                cfg.setCompany(company);
            } else {
                throw new RuntimeException("Configuration requiere idCompany");
            }
            if (map.get("idSubsidiary") != null) {
                subsidiaryRepository.findById(toLong(map.get("idSubsidiary"))).ifPresent(cfg::setSubsidiary);
            }
            if (map.get("idUser") != null) {
                userRepository.findById(toLong(map.get("idUser"))).ifPresent(cfg::setModifiedBy);
            }
            return cfg;
        }).toList();
    }

    private List<Style> mapToStyles(List<Map<String, Object>> rawData) {
        return rawData.stream().map(map -> {
            Style style = new Style();
            if (map.get("id") != null) style.setId(toLong(map.get("id")));
            if (map.get("name") != null) style.setName((String) map.get("name"));
            if (map.get("value") != null) style.setValue((String) map.get("value"));
            if (map.get("type") != null) style.setType((String) map.get("type"));
            if (map.get("typeValue") != null) style.setTypeValue((String) map.get("typeValue"));
            if (map.get("active") != null) style.setActive(Boolean.TRUE.equals(map.get("active")));
            // Company es obligatorio para Style
            if (map.get("idCompany") != null) {
                Long companyId = toLong(map.get("idCompany"));
                Company company = companyRepository.findById(companyId)
                        .orElseThrow(() -> new RuntimeException("Company id=" + companyId + " no existe para Style"));
                style.setCompany(company);
            } else {
                throw new RuntimeException("Style requiere idCompany");
            }
            if (map.get("idSubsidiary") != null) {
                subsidiaryRepository.findById(toLong(map.get("idSubsidiary"))).ifPresent(style::setSubsidiary);
            }
            if (map.get("idUser") != null) {
                userRepository.findById(toLong(map.get("idUser"))).ifPresent(style::setModifiedBy);
            }
            return style;
        }).toList();
    }

    // ===================== BACKFILL RELATIONS =====================

    private void backfillRelations() {
        try {
            // Buscar usuario por defecto (id=1) una sola vez
            User defaultUser = userRepository.findById(1L).orElse(null);
            
            // Backfill modifiedBy para Company (opcional)
            if (defaultUser != null) {
                companyRepository.findAll().forEach(company -> {
                    if (company.getModifiedBy() == null) {
                        company.setModifiedBy(defaultUser);
                        companyRepository.save(company);
                    }
                });
            }

            // Backfill modifiedBy para TypeUser (opcional)
            if (defaultUser != null) {
                typeUserRepository.findAll().forEach(typeUser -> {
                    if (typeUser.getModifiedBy() == null) {
                        typeUser.setModifiedBy(defaultUser);
                        typeUserRepository.save(typeUser);
                    }
                });
            }

            // Backfill modifiedBy para Subsidiary (opcional)
            if (defaultUser != null) {
                subsidiaryRepository.findAll().forEach(subsidiary -> {
                    if (subsidiary.getModifiedBy() == null) {
                        subsidiary.setModifiedBy(defaultUser);
                        subsidiaryRepository.save(subsidiary);
                    }
                });
            }

            // Backfill modifiedBy para User (self-reference o defaultUser)
            userRepository.findAll().forEach(user -> {
                if (user.getModifiedBy() == null) {
                    // Si es el usuario default (id=1), self-reference, sino usar defaultUser
                    if (user.getId() != null && user.getId().equals(1L)) {
                        user.setModifiedBy(user);
                    } else if (defaultUser != null) {
                        user.setModifiedBy(defaultUser);
                    } else {
                        // Si no hay defaultUser, self-reference
                        user.setModifiedBy(user);
                    }
                    userRepository.save(user);
                }
            });
        } catch (Exception e) {
            System.err.println("Error in backfillRelations: " + e.getMessage());
            // No lanzar excepción, solo loguear
        }
    }

    // ===================== DEFAULT COST CENTER CONFIGURATION =====================

    /**
     * Crea la configuración por defecto para el centro de costos de transacciones médicas.
     * Solo se crea si no existe ya una configuración con el nombre "cenCosTrMed" para la company/subsidiary.
     */
    private void loadDefaultCostCenterConfiguration() {
        try {
            Long defaultCompanyId = 1L;
            Long defaultSubsidiaryId = 1L;
            Long defaultUserId = 1L;
            String configName = "cenCosTrMed";
            String costCenterCode = "TRMED001";

            // Verificar si ya existe
            boolean exists = configurationRepository
                    .findByCompany_IdAndSubsidiary_IdAndNameIgnoreCase(defaultCompanyId, defaultSubsidiaryId, configName)
                    .isPresent();

            if (exists) {
                System.out.println("Configuration 'cenCosTrMed' already exists. Skipping creation.");
                return;
            }

            // Verificar que existan las entidades necesarias
            Company company = companyRepository.findById(defaultCompanyId).orElse(null);
            if (company == null) {
                System.err.println("Warning: Company id=" + defaultCompanyId + " no existe. No se creará la configuración 'cenCosTrMed'.");
                return;
            }

            Subsidiary subsidiary = subsidiaryRepository.findById(defaultSubsidiaryId).orElse(null);
            if (subsidiary == null) {
                System.err.println("Warning: Subsidiary id=" + defaultSubsidiaryId + " no existe. No se creará la configuración 'cenCosTrMed'.");
                return;
            }

            User user = userRepository.findById(defaultUserId).orElse(null);
            if (user == null) {
                System.err.println("Warning: User id=" + defaultUserId + " no existe. No se creará la configuración 'cenCosTrMed'.");
                return;
            }

            // Crear la configuración
            Configuration cfg = new Configuration();
            cfg.setCompany(company);
            cfg.setSubsidiary(subsidiary);
            cfg.setModifiedBy(user);
            cfg.setName(configName);
            cfg.setValue(costCenterCode);
            cfg.setActive(true);

            configurationRepository.save(cfg);
            System.out.println("Default CostCenter Configuration created successfully: " + configName + " = " + costCenterCode);

        } catch (Exception e) {
            System.err.println("Warning: Error creating default CostCenter Configuration: " + e.getMessage());
            System.err.println("The system will continue to start. You can create the configuration manually if needed.");
            // No imprimir stack trace completo para no llenar los logs
        }
    }

    // ===================== UTILITIES =====================

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.longValue();
        if (v instanceof String s) {
            String t = s.trim();
            if (t.isEmpty()) return null;
            return Long.parseLong(t);
        }
        throw new IllegalArgumentException("Unsupported id type: " + v.getClass());
    }
}
