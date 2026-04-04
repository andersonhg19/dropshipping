package com.visnex.administrationservice.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.*;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.dto.output.ResultPageTypeUserDTO;
import com.visnex.administrationservice.entity.PageTypeUser;
import com.visnex.administrationservice.entity.Pages;
import com.visnex.administrationservice.entity.TypeUser;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.mapper.PageTypeUserMapper;
import com.visnex.administrationservice.repository.CustomPageTypeUserRepository;
import com.visnex.administrationservice.repository.PageTypeUserRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.PageTypeUserService;
import com.visnex.administrationservice.util.ChangeLogUtil;
import com.visnex.administrationservice.util.CompletionUtils;
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
import java.util.*;

@Service
public class PageTypeUserServiceImpl implements PageTypeUserService {

    private final ConnectInternalApi connectInternalApi;
    private final PageTypeUserRepository repository;
    private final CustomPageTypeUserRepository customPageTypeUserRepository;
    private final PageTypeUserMapper pageTypeUserMapper; // MapStruct
    private final ValidationUtils validation;

    @Autowired private ApplicationEventPublisher eventPublisher;
    @Autowired private ChangeLogUtil<PageTypeUser> changeLogUtil;
    private final CompletionUtils completionUtils;

    public PageTypeUserServiceImpl(PageTypeUserRepository repository,
                                   ConnectInternalApi connectInternalApi,
                                   CustomPageTypeUserRepository customPageTypeUserRepository,
                                   PageTypeUserMapper pageTypeUserMapper,
                                   CompletionUtils completionUtils,
                                   ValidationUtils validation) {
        this.connectInternalApi = (connectInternalApi == null) ? new ConnectInternalApi() : connectInternalApi;
        this.repository = repository;
        this.customPageTypeUserRepository = customPageTypeUserRepository;
        this.pageTypeUserMapper = pageTypeUserMapper;
        this.completionUtils = completionUtils;
        this.validation = validation;
    }

    private static final String DEFAULT_LANG = "es";
    private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

    /**
     * Persistently saves or updates PageTypeUser relations for a given type of user based on the provided DTO.
     *
     * <p>Behavior overview:
     * - Validates the incoming PageTypeUserSaveDTO and required fields (idTypeUser, idModifiedBy, pages).
     * - Loads the referenced TypeUser and User (modifier) entities.
     * - Iterates over the pages list:
     *     - Validates each referenced Page.
     *     - Attempts to find an existing PageTypeUser by page id and typeUser id. If found, updates it;
     *       otherwise creates a new PageTypeUser and sets creation timestamp.
     *     - Copies the previous state into a temporary oldEntity for change comparison when updating.
     *     - Sets relation fields (page, typeUser, modifiedBy), permission flags (canCreate, canUpdate,
     *       canRead, canDelete) and the active flag (defaults to true when null).
     *     - Persists the entity through the repository.
     *     - If changeLogUtil and eventPublisher are available, calculates field-level changes and publishes
     *       an EntityChangeEvent with the modifier id.
     *     - Maps the saved entity to a ResultPageTypeUserDTO and collects results.
     * - Returns a ResultDTO wrapping the list of ResultPageTypeUserDTO on success.
     *
     * <p>Localization and messages:
     * - Uses the provided language parameter (via internal lang(language) call) to localize error messages
     *   obtained from connectInternalApi.
     *
     * <p>Error handling and result codes:
     * - If dto is null: returns ResultDTO(false, localized "body required" message, code 103).
     * - If idTypeUser, idModifiedBy, or pages are missing/invalid: returns ResultDTO(false, localized
     *   "field is required" message + field name, code 120).
     * - ValidationException (thrown by validation.require* methods) is caught and returned as
     *   ResultDTO(false, message, code 102).
     * - Any other Exception is caught and returned as ResultDTO(false, localized generic error message,
     *   code 1) with the exception message included.
     *
     * <p>Side-effects:
     * - Writes/updates PageTypeUser entities in the repository.
     * - May publish EntityChangeEvent events when changes are detected.
     * - Uses changeLogUtil, connectInternalApi, pageTypeUserMapper and eventPublisher collaborators.
     *
     * @param dto the PageTypeUserSaveDTO containing:
     *            - idTypeUser: id of the TypeUser to which pages' permissions will be assigned,
     *            - idModifiedBy: id of the User performing the modification,
     *            - pages: collection of PagesListDTO describing page ids and permission flags.
     * @param language language/locale code used to localize response messages.
     * @return ResultDTO on success contains List<ResultPageTypeUserDTO> (one per processed page);
     *         on validation or processing failure returns a ResultDTO with success=false and an
     *         appropriate error message and code (see documentation above).
     * @throws Exception declared for the method signature; however, ValidationException and general
     *                   exceptions are caught and converted into ResultDTO responses within the method.
     */
    @Override
    public ResultDTO saveAndUpdate(PageTypeUserSaveDTO dto, String language) throws Exception {
        final String lng = lang(language);
        try {
            if (dto == null) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.bodyRequired.toString(), lng),
                        103);
            }
            if (dto.getIdTypeUser() == null || dto.getIdTypeUser() <= 0) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " IdTypeUser",
                        120);
            }
            if (dto.getIdModifiedBy() == null || dto.getIdModifiedBy() <= 0) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " idModifiedBy",
                        120);
            }
            if (dto.getPages() == null || dto.getPages().isEmpty()) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " Pages",
                        120);
            }

            final TypeUser typeUser = validation.requireTypeUser(dto.getIdTypeUser(), lng);
            final User modifier = validation.requireUser(dto.getIdModifiedBy(), lng);

            final List<ResultPageTypeUserDTO> out = new ArrayList<>(dto.getPages().size());

            for (PagesListDTO item : dto.getPages()) {
                final Pages page = validation.requirePage(item.getIdPage(), lng);

                Collection<PageTypeUser> existing = repository
                        .findAllByPage_IdAndTypeUser_Id(item.getIdPage(), dto.getIdTypeUser());

                PageTypeUser entity = existing.isEmpty() ? new PageTypeUser() : existing.iterator().next();
                PageTypeUser oldEntity = new PageTypeUser();

                if (existing.isEmpty()) {
                    entity.setCreation(LocalDateTime.now());
                } else {
                    BeanUtils.copyProperties(entity, oldEntity);
                    entity.setLastUpdate(LocalDateTime.now());
                }

                entity.setPage(page);
                entity.setTypeUser(typeUser);
                entity.setModifiedBy(modifier);

                entity.setCanCreate(Boolean.TRUE.equals(item.getCanCreate()));
                entity.setCanUpdate(Boolean.TRUE.equals(item.getCanUpdate()));
                entity.setCanRead(Boolean.TRUE.equals(item.getCanRead()));
                entity.setCanDelete(Boolean.TRUE.equals(item.getCanDelete()));
                entity.setActive(item.getActive() == null ? Boolean.TRUE : item.getActive());

                PageTypeUser saved = repository.save(entity);

                if (changeLogUtil != null && eventPublisher != null) {
                    List<Map<String, Object>> changes = changeLogUtil.compararEntidades(oldEntity, entity);
                    eventPublisher.publishEvent(new EntityChangeEvent(entity, changes, modifier.getId()));
                }

                out.add(pageTypeUserMapper.toDTO(saved));
            }
            completionUtils.enrichList(out, lng);
            return new ResultDTO(out);

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_error.toString(), lng),
                    1, e.getMessage());
        }
    }

    /**
     * Retrieves a PageTypeUser by its identifier and returns a ResultDTO containing the corresponding DTO.
     *
     * <p>Behavior:
     * - Normalizes the provided language via {@code lang(language)}.
     * - Validates existence and fetches the entity using {@code validation.requirePageTypeUser(id, lng)}.
     * - On success, maps the entity to a DTO via {@code pageTypeUserMapper.toDTO(entity)} and returns a successful ResultDTO.
     * - If a {@code ValidationException} occurs, returns a ResultDTO with success=false, a validation message and code 102.
     * - If any other exception occurs, returns a ResultDTO with success=false, a localized process error message and code 103.
     *
     * @param id the identifier of the PageTypeUser to retrieve
     * @param language the desired language for messages (may be normalized internally)
     * @return a ResultDTO containing the mapped PageTypeUser DTO on success or an error ResultDTO on failure
     * @throws Exception if an unexpected error occurs during processing
     */
    @Override
    public ResultDTO getById(long id, String language) throws Exception {
        final String lng = lang(language);
        try {
            // Existencia — centralizada
            PageTypeUser entity = validation.requirePageTypeUser(id, lng);
            ResultPageTypeUserDTO dto = pageTypeUserMapper.toDTO(entity);
            completionUtils.enrich(dto, lng);
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
     * Retrieves a paginated list of page-type-user items according to the provided filter.
     *
     * <p>Behavior:
     * - Sanitizes pagination parameters from the filter:
     *   - page defaults to 0 if null or negative.
     *   - size defaults to 20 if null or non-positive.
     *   - size is capped to a maximum of 200.
     * - Delegates to {@code customPageTypeUserRepository.findAllWithCriteria(filterDTO, PageRequest.of(page, size))}
     *   to obtain a Spring {@code Page<ResultPageTypeUserDTO>} result.
     * - If the repository returns {@code null} or an empty page, a successful {@code ResultDTO} is returned
     *   containing an empty {@code PageDTO} with the requested page and size and zero total pages.
     * - If the repository returns results, a successful {@code ResultDTO} is returned containing a {@code PageDTO}
     *   populated with the page number, page size, total pages and content from the repository page.
     *
     * <p>Error handling:
     * - Validation problems encountered inside the method are caught and returned as a failed {@code ResultDTO}
     *   with code 102 and the validation message.
     * - Other exceptions are caught and returned as a failed {@code ResultDTO} with code 103 and a localized
     *   error message (language is selected via the {@code language} parameter).
     *
     * @param filterDTO a filter DTO containing search criteria and optional pagination parameters (page, size)
     *                  used to build the repository query. Must not be assumed non-null by callers.
     * @param language  the language/locale hint used to localize error messages; may be null or empty.
     * @return a {@code ResultDTO} containing a {@code PageDTO<ResultPageTypeUserDTO>} on success, or a failed
     *         {@code ResultDTO} with an error code and message on validation or other failures.
     * @throws URISyntaxException     if an underlying operation that builds or parses URIs fails.
     * @throws JsonProcessingException if JSON processing required by underlying operations fails.
     */
    @Override
    public ResultDTO getAllItems(PageTypeUserFilterDTO filterDTO, String language)
            throws URISyntaxException, JsonProcessingException {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            Page<ResultPageTypeUserDTO> p = customPageTypeUserRepository.findAllWithCriteria(
                    filterDTO, PageRequest.of(page, size));

            if (p == null || p.getContent().isEmpty()) {
                return new ResultDTO(new PageDTO<ResultPageTypeUserDTO>(page, size, 0, Collections.emptyList()));
            }

            // 1) copiar a lista mutable
            List<ResultPageTypeUserDTO> content = new ArrayList<>(p.getContent());
            // 2) enriquecer (npage, nombres, etc.)
            completionUtils.enrichList(content, lng);
            // 3) devolver la lista enriquecida
            return new ResultDTO(new PageDTO<ResultPageTypeUserDTO>(
                    p.getNumber(), p.getSize(), p.getTotalPages(), content));

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }

    /**
     * Retrieves a paged list of PageTypeUser entries for the type of the user identified by the
     * provided filter DTO.
     *
     * Behavior and validations:
     * - Resolves the effective language via lang(language) and uses it to fetch localized messages.
     * - Validates that the provided filter DTO identifies an existing user:
     *   - If the user has no associated TypeUser or the TypeUser id is null, returns a failure ResultDTO
     *     with a localized "type user not found" message and code 120.
     * - Validates that the resolved TypeUser exists (via validation.requireTypeUser).
     * - Applies paging parameters from the filter DTO:
     *   - page: negative values are normalized to 0.
     *   - size: values <= 0 default to 20; size is capped to a maximum of 200.
     * - Queries the repository for active PageTypeUser entries associated with the user's TypeUser id.
     *   - If the resulting page is empty, returns a failure ResultDTO with a localized "page not found"
     *     message (appended with the idUser) and code 120.
     * - Maps the page content to ResultPageTypeUserDTO using pageTypeUserMapper and returns a success
     *   ResultDTO containing a PageDTO(page, size, totalPages, list).
     *
     * Return value:
     * - On success: ResultDTO whose payload is PageDTO<Integer page, Integer size, Integer totalPages,
     *   List<ResultPageTypeUserDTO>>.
     * - On validation errors (ValidationException): ResultDTO(false, validationMessage, 102, exceptionClassName).
     * - On business-not-found conditions (no TypeUser or empty page): ResultDTO(false, localizedMessage, 120).
     * - On unexpected errors: ResultDTO(false, localizedGenericErrorMessage, 1, exceptionMessage).
     *
     * Parameters:
     * @param filterDTO  Filter data; expected to contain at least:
     *                    - idUser: the id of the user whose TypeUser will be used to fetch pages,
     *                    - page: requested page index (optional, defaults applied),
     *                    - size: requested page size (optional, defaults and cap applied).
     * @param language   Optional language code used for localization; resolved internally.
     *
     * Exceptions:
     * @throws Exception Declared for compatibility; in normal execution exceptions are caught and
     *                   converted into ResultDTO error responses as described above.
     */
    @Override
    public ResultDTO getByIdTypeUser(PageTypeUserByTypeFilterDTO filterDTO, String language) throws Exception {
        final String lng = lang(language);
        try {
            User user = validation.requireUser(filterDTO.idUser(), lng);
            if (user.getTypeUser() == null || user.getTypeUser().getId() == null) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.typeUserNotFound.toString(), lng),
                        120);
            }
            final Long idTypeUser = user.getTypeUser().getId();
            validation.requireTypeUser(idTypeUser, lng);

            int page = (filterDTO.page() < 0) ? 0 : filterDTO.page();
            int size = (filterDTO.size() <= 0) ? 20 : filterDTO.size();
            size = Math.min(size, 200);

            Page<PageTypeUser> p = repository.findByTypeUser_IdAndActive(
                    idTypeUser, true, PageRequest.of(page, size));

            if (p.getContent().isEmpty()) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.pageNotFound.toString(), lng) + filterDTO.idUser(),
                        120);
            }

//            List<ResultPageTypeUserDTO> list = p.stream()
//                    .map(pageTypeUserMapper::toDTO)
//                    .toList();
//
//            return new ResultDTO(new PageDTO<>(page, size, p.getTotalPages(), list));
            List<ResultPageTypeUserDTO> list = p.stream().map(pageTypeUserMapper::toDTO).toList();
            completionUtils.enrichList(list, lng);
            return new ResultDTO(new PageDTO<>(page, size, p.getTotalPages(), list));

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_error.toString(), lng),
                    1, e.getMessage());
        }
    }
}
