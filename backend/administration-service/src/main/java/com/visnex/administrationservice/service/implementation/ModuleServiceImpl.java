package com.visnex.administrationservice.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.ModuleDTO;
import com.visnex.administrationservice.dto.input.ModuleFilterDTO;
import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.dto.output.ResultModuleDTO;
import com.visnex.administrationservice.entity.Module;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.mapper.ModuleMapper;
import com.visnex.administrationservice.repository.CustomModuleRepository;
import com.visnex.administrationservice.repository.ModuleRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.ModuleService;
import com.visnex.administrationservice.util.ChangeLogUtil;
import com.visnex.administrationservice.util.EntityChangeEvent;
import com.visnex.administrationservice.util.ValidationUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository repository;
    private final CustomModuleRepository customRepository;
    private final ModuleMapper moduleMapper;
    private final ConnectInternalApi connectInternalApi;
    private final ValidationUtils validation;

    @Autowired private ApplicationEventPublisher eventPublisher;
    @Autowired private ChangeLogUtil<Module> changeLogUtil;

    public ModuleServiceImpl(ModuleRepository repository,
                             ConnectInternalApi connectInternalApi,
                             CustomModuleRepository customRepository,
                             ModuleMapper moduleMapper,
                             ValidationUtils validation) {
        this.connectInternalApi = (connectInternalApi == null) ? new ConnectInternalApi() : connectInternalApi;
        this.repository = repository;
        this.customRepository = customRepository;
        this.moduleMapper = moduleMapper;
        this.validation = validation;
    }

    private static final String DEFAULT_LANG = "es";
    private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

    /**
     * Save or update a Module from the provided ModuleDTO.
     *
     * <p>Behavior:
     * - Resolves the effective language via lang(language) for localized messages.
     * - Validates input:
     *   - If dto is null returns ResultDTO(false, localized bodyRequired message, 103).
     *   - If dto.getName() is null/blank returns ResultDTO(false, localized return_field_is_required + " name", 102).
     *   - If dto.getIdModifiedBy() is null or <= 0 returns ResultDTO(false, localized return_field_is_required + " idModifiedBy", 120).
     * - Loads the modifier user via validation.requireUser(dto.getIdModifiedBy(), lng).
     * - If dto.getId() is present and > 0:
     *   - Loads existing Module via validation.requireModule(dto.getId(), lng).
     *   - Copies the loaded module into an oldModule snapshot (BeanUtils.copyProperties(module, oldModule)).
     *   - Sets module.lastUpdate to now.
     *   Else:
     *   - Sets module.creation to now.
     * - Ensures module name uniqueness: if a different Module with the same name exists, returns ResultDTO(false, localized thisNameExists message, 102).
     * - Updates module fields (name, active, modifiedBy) and persists via repository.save(module).
     * - If changeLogUtil and eventPublisher are available, computes changes with changeLogUtil.compararEntidades(oldModule, module)
     *   and publishes an EntityChangeEvent(module, changes, modifier.getId()).
     * - Maps the persisted Module to ResultModuleDTO via moduleMapper and returns ResultDTO(resultDTO).
     *
     * <p>Error handling:
     * - ValidationException is caught and translated to ResultDTO(false, vex.getMessage(), 102, vexClassName).
     * - Any other Exception is caught and translated to ResultDTO(false, localized return_process_error message, 103, e.getMessage()).
     *
     * Note: the method is declared to throw Exception; unexpected errors may propagate to callers depending on call context.
     *
     * @param dto the ModuleDTO containing the information to create or update (must not be null)
     * @param language optional language code used to localize messages
     * @return a ResultDTO containing a ResultModuleDTO on success, or an error ResultDTO describing the failure
     * @throws Exception if an unexpected error propagates out of the method
     */
    @Override
    public ResultDTO saveAndUpdate(ModuleDTO dto, String language) throws Exception {
        final String lng = lang(language);

        if (dto == null) {
            return new ResultDTO(false,
                connectInternalApi.chargeMessage(Message.Msj.bodyRequired.toString(), lng),
                103);
        }
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            return new ResultDTO(false,
                connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " name",
                102);
        }
        if (dto.getIdModifiedBy() == null || dto.getIdModifiedBy() <= 0) {
            return new ResultDTO(false,
                connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " idModifiedBy",
                120);
        }

        try {
            final User modifier = validation.requireUser(dto.getIdModifiedBy(), lng);

            Module module = new Module();
            Module oldModule = new Module();

            if (dto.getId() != null && dto.getId() > 0) {
                module = validation.requireModule(dto.getId(), lng);
                BeanUtils.copyProperties(module, oldModule);
                module.setLastUpdate(LocalDateTime.now());
            } else {
                module.setCreation(LocalDateTime.now());
            }

            Optional<Module> existByName = repository.findByName(dto.getName().trim());
            if (existByName.isPresent() && !existByName.get().getId().equals(dto.getId())) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.thisNameExists.toString(), lng),
                        102);
            }
            module.setName(dto.getName().trim());
            module.setActive(dto.getActive());
            module.setModifiedBy(modifier);

            Module result = repository.save(module);

            if (changeLogUtil != null && eventPublisher != null) {
                List<Map<String, Object>> changes = changeLogUtil.compararEntidades(oldModule, module);
                eventPublisher.publishEvent(new EntityChangeEvent(module, changes, modifier.getId()));
            }

            ResultModuleDTO resultDTO = moduleMapper.toDTO(result);
            return new ResultDTO(resultDTO);

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }

    /**
     * Retrieves a module by its identifier and returns a ResultDTO containing the module data
     * mapped to a ResultModuleDTO, or an error result if retrieval/validation fails.
     *
     * The method uses the provided language code to localize messages. Internally it:
     * - resolves the effective language,
     * - validates and loads the Module via validation.requireModule(id, language),
     * - maps the Module to a ResultModuleDTO via moduleMapper,
     * - returns a successful ResultDTO with the DTO payload.
     *
     * Validation failures are caught and converted into a ResultDTO error with code 102
     * and the validation exception message and type. Other unexpected errors are caught and
     * converted into a ResultDTO error with code 103 and a localized generic error message.
     *
     * @param id       the identifier of the module to retrieve; must not be null
     * @param language the language code used to select/localize messages (e.g. "en", "es"); may be null
     * @return a ResultDTO wrapping a ResultModuleDTO on success, or an error ResultDTO containing
     *         error details and an error code (102 for validation errors, 103 for other errors)
     * @throws Exception if an unexpected condition occurs that is not converted into a ResultDTO
     */
    @Override
    public ResultDTO getById(Long id, String language) throws Exception {
        final String lng = lang(language);
        try {
            Module mod = validation.requireModule(id, lng);
            ResultModuleDTO dto = moduleMapper.toDTO(mod);
            return new ResultDTO(dto);
        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }

    /**
     * Retrieves a pageable list of modules matching the provided filter criteria.
     *
     * Behavior:
     * - Resolves the effective language/locale via lang(language).
     * - Sanitizes pagination parameters:
     *     - page defaults to 0 when null or negative.
     *     - size defaults to 20 when null or non-positive and is capped at 200.
     * - Delegates the filtered query to customRepository.findAllWithCriteria(filterDTO, PageRequest.of(page, size)).
     * - If no results are found, returns an empty PageDTO with the sanitized page and size values.
     * - On success returns a ResultDTO that wraps a PageDTO<ResultModuleDTO> containing:
     *     - page number, page size, total pages and content list.
     *
     * Error handling:
     * - ValidationException is translated into a ResultDTO with success=false, the validation message,
     *   and error code 102.
     * - Any other Exception is translated into a ResultDTO with success=false, a localized internal error
     *   message obtained via connectInternalApi.chargeMessage(...), error code 103, and the exception message
     *   as detail.
     *
     * @param filterDTO the module filter and pagination parameters
     * @param language the requested language/locale (may be null); resolved internally
     * @return a ResultDTO wrapping a PageDTO<ResultModuleDTO> with results or error information
     * @throws URISyntaxException if a URI construction used internally fails
     * @throws JsonProcessingException if JSON processing fails during the operation
     */
    @Override
    public ResultDTO getAllItems(ModuleFilterDTO filterDTO, String language)
            throws URISyntaxException, JsonProcessingException {
        final String lng = lang(language);
        try {
            // Saneo de paginación (defaults + cap)
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            Page<ResultModuleDTO> pageResult = customRepository.findAllWithCriteria(
                    filterDTO, PageRequest.of(page, size));

            if (pageResult == null || pageResult.isEmpty()) {
                return new ResultDTO(new PageDTO<>(page, size, 0, Collections.emptyList()));
            }
            return new ResultDTO(new PageDTO<>(
                    pageResult.getNumber(),
                    pageResult.getSize(),
                    pageResult.getTotalPages(),
                    pageResult.getContent()));

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }
}
