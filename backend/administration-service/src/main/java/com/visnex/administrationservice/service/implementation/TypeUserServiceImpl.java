package com.visnex.administrationservice.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.input.TypeUserDTO;
import com.visnex.administrationservice.dto.input.TypeUserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.dto.output.ResultTypeUserDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.TypeUser;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.repository.CustomTypeUserRepository;
import com.visnex.administrationservice.repository.TypeUserRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.TypeUserService;
import com.visnex.administrationservice.util.ChangeLogUtil;
import com.visnex.administrationservice.util.EntityChangeEvent;
import com.visnex.administrationservice.util.ValidationUtils;
import org.modelmapper.ModelMapper;
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
public class TypeUserServiceImpl implements TypeUserService {

    private final TypeUserRepository repository;
    private final CustomTypeUserRepository customTypeUserRepository;
    private final ConnectInternalApi connectInternalApi;
    private final ModelMapper modelMapper;
    private final ValidationUtils validation;

    @Autowired private ApplicationEventPublisher eventPublisher;
    @Autowired private ChangeLogUtil<TypeUser> changeLogUtil;

    private static final String DEFAULT_LANG = "es";
    private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

    public TypeUserServiceImpl(TypeUserRepository repository,
                               ConnectInternalApi connectInternalApi,
                               ModelMapper modelMapper,
                               CustomTypeUserRepository customTypeUserRepository,
                               ValidationUtils validation) {
        this.repository = repository;
        this.connectInternalApi = (connectInternalApi == null) ? new ConnectInternalApi() : connectInternalApi;
        this.modelMapper = modelMapper;
        this.customTypeUserRepository = customTypeUserRepository;
        this.validation = validation;
    }

    /**
     * Creates or updates a TypeUser entity from the provided DTO.
     *
     * Behavior:
     * - Validates input DTO and required related entities (modifier user, company, subsidiary) via the
     *   validation helper methods. Validation failures yield a ResultDTO with code 102 (see below).
     * - For updates (dto.getId() != null && dto.getId() > 0):
     *     - Loads the existing entity, takes a snapshot of the current state, sets lastUpdate and modifiedBy.
     *   For creates:
     *     - Creates a new entity instance, sets creation timestamp and modifiedBy.
     * - Trims and validates the name; ensures uniqueness by name (case-sensitive as implemented by repository).
     * - Sets company, subsidiary and active flag from the DTO.
     * - Persists the entity via repository.save(...).
     * - If changeLogUtil and eventPublisher are available, computes a list of changes (comparing the old snapshot
     *   with the new entity) and publishes an EntityChangeEvent with the modifier id.
     * - Maps the saved entity to ResultTypeUserDTO and returns it inside a successful ResultDTO.
     *
     * Validation and error handling:
     * - If dto is null -> returns ResultDTO(false, message, 103).
     * - If dto.getName() is null or blank -> returns ResultDTO(false, "<message> name", 102).
     * - If a different entity with the same name already exists -> returns ResultDTO(false, message, 102).
     * - ValidationException thrown by validation.require* methods is caught and returned as ResultDTO(false, message, 102).
     * - Any other unexpected exception is caught and returned as ResultDTO(false, message, 103, e.getMessage()).
     *
     * Messages:
     * - Messages are resolved using connectInternalApi.chargeMessage(...) with the language determined by lang(language).
     *
     * Side effects:
     * - Persists a TypeUser record (create or update).
     * - May publish an EntityChangeEvent when change logging is enabled.
     *
     * Notes:
     * - The method sets timestamps: creation for new entities, lastUpdate for updates.
     * - The entity's modifiedBy is set to the User returned by validation.requireUser(dto.getIdModifiedBy(), ...).
     * - The name value is trimmed before uniqueness check and before persisting.
     *
     * Parameters:
     * @param dto      TypeUserDTO containing fields used to create/update the TypeUser (id, name, active,
     *                 idCompany, idSubsidiary, idModifiedBy, ...).
     * @param language Optional language identifier used to resolve localized messages.
     *
     * Return:
     * @return ResultDTO containing:
     *         - success flag (true on success),
     *         - message (localized or "OK" on success),
     *         - code (0 on success, 102 for validation errors, 103 for processing errors),
     *         - data payload: on success the ResultTypeUserDTO mapped from the saved entity.
     *
     * Exceptions:
     * @throws Exception declared for the signature, but most exceptions are caught and converted into ResultDTO responses.
     */
    @Override
    public ResultDTO saveAndUpdate(TypeUserDTO dto, String language) throws Exception {
        final String lng = lang(language);
        try {
            if (dto == null) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.bodyRequired.toString(), lng),
                        103);
            }
            if (dto.getName() == null || dto.getName().isBlank()) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " name",
                        102);
            }

            final User modifier   = validation.requireUser(dto.getIdModifiedBy(), lng);
            final Company company = validation.requireCompany(dto.getIdCompany(), lng);
            final Subsidiary subsidiary = validation.requireSubsidiary(dto.getIdSubsidiary(), lng);

            TypeUser entity;
            TypeUser old = new TypeUser();

            if (dto.getId() != null && dto.getId() > 0) {
                entity = validation.requireTypeUser(dto.getId(), lng);
                BeanUtils.copyProperties(entity, old);
                entity.setLastUpdate(LocalDateTime.now());
                entity.setModifiedBy(modifier);
            } else {
                entity = new TypeUser();
                entity.setCreation(LocalDateTime.now());
                entity.setModifiedBy(modifier);
            }

            Optional<TypeUser> exist = repository.findByName(dto.getName().trim());
            if (exist.isPresent() && !exist.get().getId().equals(dto.getId())) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.thisNameExists.toString(), lng),
                        102);
            }

            entity.setName(dto.getName().trim());
            entity.setCompany(company);
            entity.setSubsidiary(subsidiary);
            entity.setActive(dto.getActive());

            TypeUser saved = repository.save(entity);

            if (changeLogUtil != null && eventPublisher != null) {
                List<Map<String, Object>> changes = changeLogUtil.compararEntidades(old, entity);
                eventPublisher.publishEvent(new EntityChangeEvent(entity, changes, modifier.getId()));
            }

            ResultTypeUserDTO resultDTO = modelMapper.map(saved, ResultTypeUserDTO.class);
            return new ResultDTO(true, "OK", 0, resultDTO);

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }

    /**
     * Retrieves a TypeUser by its identifier and returns the result wrapped in a ResultDTO.
     *
     * The method resolves the effective language (via lang(language)), validates that the
     * requested TypeUser exists (validation.requireTypeUser), maps the found entity to a
     * ResultTypeUserDTO using modelMapper, and returns a successful ResultDTO containing
     * that DTO.
     *
     * On failure:
     * - If a ValidationException is thrown during validation, the method returns a ResultDTO
     *   indicating failure with an error message from the validation, an error code of 102,
     *   and the validation exception's class name.
     * - If any other exception occurs, the method returns a ResultDTO indicating failure with
     *   a localized "return process error" message (via connectInternalApi.chargeMessage),
     *   an error code of 103, and the exception message.
     *
     * Note: the method signature declares "throws Exception" but most exceptions are caught
     * and converted into a ResultDTO. An Exception may still be propagated if thrown before
     * the internal try/catch (for example from language resolution), depending on the
     * implementation of the called helpers.
     *
     * @param id the identifier of the TypeUser to fetch
     * @param language the preferred language code used for localization of messages; may be null
     * @return a ResultDTO containing a ResultTypeUserDTO on success, or a ResultDTO with
     *         success=false and error details (message, code, exception info) on failure
     * @throws Exception if an unexpected error occurs outside the internal error handling
     */
    @Override
    public ResultDTO getById(long id, String language) throws Exception {
        final String lng = lang(language);
        try {
            TypeUser entity = validation.requireTypeUser(id, lng);
            ResultTypeUserDTO dto = modelMapper.map(entity, ResultTypeUserDTO.class);
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
     * Retrieves a paginated list of type-user items according to the provided filter and language.
     *
     * <p>The method:
     * <ul>
     *   <li>Resolves the effective language using lang(language).</li>
     *   <li>Normalizes pagination parameters from the filter: default page = 0, default size = 20,
     *       and enforces a maximum page size of 200.</li>
     *   <li>Delegates to customTypeUserRepository.findAllWithCriteria(filterDTO, PageRequest.of(page, size))
     *       to obtain a Page&lt;ResultTypeUserDTO&gt;.</li>
     *   <li>If no results are found (null or empty content), returns a ResultDTO wrapping an empty
     *       PageDTO with total elements = 0.</li>
     *   <li>On success, returns a ResultDTO wrapping a PageDTO&lt;ResultTypeUserDTO&gt; populated
     *       from the repository Page (page number, page size, total pages, content).</li>
     *   <li>On any unexpected exception, returns a failure ResultDTO containing an error message
     *       (retrieved via connectInternalApi.chargeMessage(...)), error code 103 and the exception message.</li>
     * </ul>
     *
     * @param filterDTO filter and pagination options used to query type-user entries; may contain
     *                  page and size values which will be normalized as described above
     * @param language  requested language code used to resolve localized messages
     * @return a ResultDTO containing a PageDTO&lt;ResultTypeUserDTO&gt; on success; on error a ResultDTO
     *         indicating failure with an error message and code 103
     * @throws URISyntaxException       declared for callers; related URI construction errors may be propagated
     * @throws com.fasterxml.jackson.core.JsonProcessingException declared for callers; JSON processing errors may be propagated
     */
    @Override
    public ResultDTO getAllItems(TypeUserFilterDTO filterDTO, String language)
            throws URISyntaxException, JsonProcessingException {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            Page<ResultTypeUserDTO> list = customTypeUserRepository.findAllWithCriteria(
                    filterDTO, PageRequest.of(page, size));

            if (list == null || list.getContent().isEmpty()) {
                return new ResultDTO(new PageDTO<ResultTypeUserDTO>(page, size, 0, Collections.emptyList()));
            }
            return new ResultDTO(new PageDTO<ResultTypeUserDTO>(list.getNumber(), list.getSize(), list.getTotalPages(), list.getContent()));

        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }
}
