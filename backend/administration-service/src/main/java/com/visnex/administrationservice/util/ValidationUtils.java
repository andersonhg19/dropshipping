package com.visnex.administrationservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.entity.*;
import com.visnex.administrationservice.entity.Module;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.repository.*;
import com.visnex.administrationservice.security.ConnectInternalApi;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.net.URISyntaxException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class ValidationUtils {

    private final CompanyRepository companyRepo;
    private final UserRepository userRepo;
    private final ModuleRepository moduleRepo;
    private final PagesRepository pagesRepo;
    private final TypeUserRepository typeUserRepo;

    private final SubsidiaryRepository subsidiaryRepo;
    private final ConfigurationRepository configurationRepo;
    private final StyleRepository styleRepo;
    private final PageTypeUserRepository pageTypeUserRepo;

    private final ConnectInternalApi api;

    // NUEVO: util de comparación y publicador de eventos
    private final ChangeLogUtil changeLogUtil;               
    private final ApplicationEventPublisher eventPublisher;

    public ValidationUtils(CompanyRepository companyRepo,
                           UserRepository userRepo,
                           ModuleRepository moduleRepo,
                           PagesRepository pagesRepo,
                           TypeUserRepository typeUserRepo,
                           SubsidiaryRepository subsidiaryRepo,
                           ConfigurationRepository configurationRepo,
                           StyleRepository styleRepo,
                           PageTypeUserRepository pageTypeUserRepo,
                           ConnectInternalApi api,
                           ChangeLogUtil changeLogUtil,
                           ApplicationEventPublisher eventPublisher) {
        this.companyRepo = companyRepo;
        this.userRepo = userRepo;
        this.moduleRepo = moduleRepo;
        this.pagesRepo = pagesRepo;
        this.typeUserRepo = typeUserRepo;
        this.subsidiaryRepo = subsidiaryRepo;
        this.configurationRepo = configurationRepo;
        this.styleRepo = styleRepo;
        this.pageTypeUserRepo = pageTypeUserRepo;
        this.api = api;
        this.changeLogUtil = changeLogUtil;
        this.eventPublisher = eventPublisher;
    }

    /* =========================
       VALIDACIONES
       ========================= */

    public Company requireCompany(Long idCompany, String language) {
        requirePositive(idCompany, "idCompany", language);
        return companyRepo.findById(idCompany).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.return_not_exist_the_entity_with_id.toString(), language, idCompany)));
    }

    public User requireUser(Long idUser, String language) {
        requirePositive(idUser, "idUser", language);
        return userRepo.findById(idUser).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.userNotFount.toString(), language, idUser)));
    }

    public Module requireModule(Long idModule, String language) {
        requirePositive(idModule, "idModule", language);
        return moduleRepo.findById(idModule).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.return_not_exist_the_entity_with_id.toString(), language, idModule)));
    }

    public Pages requirePage(Long idPage, String language) {
        requirePositive(idPage, "idPage", language);
        return pagesRepo.findById(idPage).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.pageNotFound.toString(), language, idPage)));
    }

    public TypeUser requireTypeUser(Long idTypeUser, String language) {
        requirePositive(idTypeUser, "idTypeUser", language);
        return typeUserRepo.findById(idTypeUser).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.return_not_exist_the_entity_with_id.toString(), language, idTypeUser)));
    }

    public Subsidiary requireSubsidiary(Long idSubsidiary, String language) {
        requirePositive(idSubsidiary, "idSubsidiary", language);
        return subsidiaryRepo.findById(idSubsidiary).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.return_not_exist_the_entity_with_id.toString(), language, idSubsidiary)));
    }

    public Configuration requireConfiguration(Long idConfiguration, String language) {
        requirePositive(idConfiguration, "idConfiguration", language);
        return configurationRepo.findById(idConfiguration).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.return_not_exist_the_entity_with_id.toString(), language, idConfiguration)));
    }

    public Style requireStyle(Long idStyle, String language) {
        requirePositive(idStyle, "idStyle", language);
        return styleRepo.findById(idStyle).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.return_not_exist_the_entity_with_id.toString(), language, idStyle)));
    }

    public PageTypeUser requirePageTypeUser(Long idPageTypeUser, String language) {
        requirePositive(idPageTypeUser, "idPageTypeUser", language);
        return pageTypeUserRepo.findById(idPageTypeUser).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.return_not_exist_the_entity_with_id.toString(), language, idPageTypeUser)));
    }

    /* =========================
       UTILIDADES COMUNES
       ========================= */

    private void requirePositive(Long id, String fieldName, String language) {
        if (id == null || id <= 0) {
            throw new ValidationException(
                msg(Message.Msj.return_field_is_required.toString(), language) + " " + fieldName
            );
        }
    }

    private String msg(String key, String language) {
        try {
            return api.chargeMessage(key, language);
        } catch (URISyntaxException | JsonProcessingException e) {
            throw new ValidationException("Error cargando mensajes (" + key + "): " + e.getMessage());
        }
    }

    private String fmt(String key, String language, Object... args) {
        return String.format(msg(key, language), args);
    }

    /* =========================
       NUEVO: Auditoría opcional (reutilizable)
       ========================= */

    /** Devuelve la lista de cambios entre dos entidades del mismo tipo (sin publicar evento). */
    public <E> List<Map<String, Object>> compare(E oldEntity, E newEntity) {
        if (oldEntity == null || newEntity == null || changeLogUtil == null) {
            return Collections.emptyList();
        }
        return changeLogUtil.compararEntidades(oldEntity, newEntity);
    }

    /**
     * Publica un EntityChangeEvent con los cambios detectados.
     * No lanza excepción; si no hay cambios o falta wiring, simplemente no hace nada.
     */
    public <E> void publishChanges(E oldEntity, E newEntity, Long actorUserId) {
        if (oldEntity == null || newEntity == null || changeLogUtil == null || eventPublisher == null) return;
        List<Map<String, Object>> changes = changeLogUtil.compararEntidades(oldEntity, newEntity);
        if (changes != null && !changes.isEmpty()) {
            eventPublisher.publishEvent(new EntityChangeEvent(newEntity, changes, actorUserId));
        }
    }
}
