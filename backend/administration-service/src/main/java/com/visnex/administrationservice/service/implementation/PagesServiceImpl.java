package com.visnex.administrationservice.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.input.PagesDTO;
import com.visnex.administrationservice.dto.input.PagesFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.dto.output.ResultPagesDTO;
import com.visnex.administrationservice.entity.Module;
import com.visnex.administrationservice.entity.Pages;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.repository.CustomPagesRepository;
import com.visnex.administrationservice.repository.PagesRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.PagesService;
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

@Service
public class PagesServiceImpl implements PagesService {

    private final ConnectInternalApi connectInternalApi;
    private final PagesRepository repository;
    private final ModelMapper modelMapper;
    private final CustomPagesRepository customPagesRepository;
    private final ValidationUtils validation;

    @Autowired private ApplicationEventPublisher eventPublisher;
    @Autowired private ChangeLogUtil<Pages> changeLogUtil;

    public PagesServiceImpl(PagesRepository repository,
                            ConnectInternalApi connectInternalApi,
                            ModelMapper modelMapper,
                            CustomPagesRepository customPagesRepository,
                            ValidationUtils validation) {
        this.connectInternalApi = (connectInternalApi == null) ? new ConnectInternalApi() : connectInternalApi;
        this.repository = repository;
        this.modelMapper = modelMapper;
        this.customPagesRepository = customPagesRepository;
        this.validation = validation;
    }

    private static final String DEFAULT_LANG = "es";
    private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

    /**
     * Saves a new Pages entity or updates an existing one based on the provided PagesDTO.
     *
     * Behavior:
     * - Validates input DTO and required fields (pagesDTO, name, npage, idModule, idModifiedBy).
     * - Resolves the modifier User and the associated Module via the validation helper.
     * - If an id is provided (> 0), loads the existing Page, preserves a copy of the old entity for change logging,
     *   and updates the lastUpdate timestamp. Otherwise, sets the creation timestamp for a new entity.
     * - Copies values from the DTO into the Pages entity (name, npage, icon, active, modifiedBy, module).
     * - Persists the entity via the repository.
     * - If changeLogUtil and eventPublisher are available, computes the list of changes and publishes an
     *   EntityChangeEvent with the changed entity, change details and modifier id.
     * - Maps the persisted entity to a ResultPagesDTO and returns it wrapped in a successful ResultDTO.
     *
     * Validation and error handling:
     * - Returns a ResultDTO with an appropriate error message and code when required fields are missing or invalid:
     *   - Missing body (pagesDTO): code 103
     *   - Missing or empty name/npage/idModule: code 102
     *   - Missing or invalid idModifiedBy: code 120
     * - Catches unexpected exceptions and returns an error ResultDTO (code 103) containing a generic error message
     *   and the exception message.
     *
     * Note:
     * - idModule and idModifiedBy must be non-null and greater than zero.
     * - The method maps the persisted Pages to ResultPagesDTO via modelMapper before returning.
     *
     * @param pagesDTO the DTO containing page data to create or update; must not be null
     * @param language the language code used to load localized messages
     * @return ResultDTO containing a ResultPagesDTO on success, or an error ResultDTO with message and code on failure
     * @throws Exception declared for compatibility; method implementation handles exceptions and returns error ResultDTOs
     */
    @Override
    public ResultDTO saveAndUpdate(PagesDTO pagesDTO, String language) throws Exception {
        final String lng = lang(language);
        try {
            if (pagesDTO == null) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.bodyRequired.toString(), lng),
                        103);
            }
            if (pagesDTO.getName() == null || pagesDTO.getName().trim().isEmpty()) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " name",
                        102);
            }
            if (pagesDTO.getNpage() == null || pagesDTO.getNpage().trim().isEmpty()) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " npage",
                        102);
            }
            if (pagesDTO.getIdModule() == null || pagesDTO.getIdModule() <= 0) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " idModule",
                        102);
            }
            if (pagesDTO.getIdModifiedBy() == null || pagesDTO.getIdModifiedBy() <= 0) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lng) + " idModifiedBy",
                        120);
            }

            final User modifier = validation.requireUser(pagesDTO.getIdModifiedBy(), lng);
            final Module module = validation.requireModule(pagesDTO.getIdModule(), lng);

            Pages pages = new Pages();
            Pages oldPages = new Pages();

            if (pagesDTO.getId() != null && pagesDTO.getId() > 0) {
                pages = validation.requirePage(pagesDTO.getId(), lng);
                BeanUtils.copyProperties(pages, oldPages);
                pages.setLastUpdate(LocalDateTime.now());
            } else {
                pages.setCreation(LocalDateTime.now());
            }

            pages.setName(pagesDTO.getName().trim());
            pages.setNpage(pagesDTO.getNpage().trim());
            pages.setIcon(pagesDTO.getIcon());
            pages.setActive(pagesDTO.getActive());
            pages.setModifiedBy(modifier);
            pages.setModule(module);

            Pages result = repository.save(pages);

            if (changeLogUtil != null && eventPublisher != null) {
                List<Map<String, Object>> changes = changeLogUtil.compararEntidades(oldPages, pages);
                eventPublisher.publishEvent(new EntityChangeEvent(pages, changes, modifier.getId()));
            }

            ResultPagesDTO resultDTO = modelMapper.map(result, ResultPagesDTO.class);
            return new ResultDTO(resultDTO);

        } catch (Exception err) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, err.getMessage());
        }
    }

    /**
     * Retrieves a Page by its identifier and returns the result wrapped in a ResultDTO.
     *
     * The method normalizes the provided language, ensures the page exists via validation.requirePage(...),
     * maps the found Pages entity to a ResultPagesDTO using modelMapper, and returns a successful ResultDTO
     * containing that DTO. In case of errors, an error ResultDTO is returned (and the method signature
     * declares Exception for callers to handle unexpected conditions).
     *
     * @param id the identifier of the page to retrieve
     * @param language an optional language code used to localize messages and to resolve the entity; a default language is used if null or empty
     * @return a ResultDTO containing a ResultPagesDTO on success, or an error ResultDTO on failure
     * @throws Exception if an unexpected error occurs during validation, mapping, or message resolution
     */
    @Override
    public ResultDTO getById(long id, String language) throws Exception {
        final String lng = lang(language);
        try {
            // Existencia — centralizada
            Pages entity = validation.requirePage(id, lng);
            ResultPagesDTO dto = modelMapper.map(entity, ResultPagesDTO.class);
            return new ResultDTO(dto);
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }

    /**
     * Retrieves a paginated list of pages according to the provided filter criteria.
     *
     * Behavior:
     * - Normalizes pagination inputs:
     *   - If filterDTO.page is null or negative, defaults to 0.
     *   - If filterDTO.size is null or <= 0, defaults to 20.
     *   - Enforces a maximum page size of 200.
     * - Delegates the query to the underlying repository (customPagesRepository.findAllWithCriteria)
     *   using the computed PageRequest.
     * - If the repository returns null or an empty content list, returns a ResultDTO containing
     *   a PageDTO with the requested page, size, total pages of 0 and an empty content list.
     * - On success returns a ResultDTO wrapping a PageDTO constructed from the repository result
     *   (page number, page size, total pages and the content list of ResultPagesDTO).
     * - On unexpected exceptions, returns a ResultDTO indicating failure with an error message
     *   obtained from an internal messaging API (language-sensitive), error code 103 and the
     *   exception message as details.
     *
     * Parameters:
     * @param filterDTO filter object containing search criteria and pagination parameters (page, size, etc.)
     * @param language  preferred language code used to localize error/feedback messages
     *
     * Returns:
     * @return a ResultDTO whose payload is a PageDTO<ResultPagesDTO> representing the requested page of results;
     *         in case of no data the PageDTO will contain an empty list and total pages = 0; on internal error the
     *         ResultDTO indicates failure and contains a localized error message and code 103.
     *
     * Exceptions:
     * @throws URISyntaxException      when constructing or invoking internal URIs for messaging fails
     * @throws JsonProcessingException when JSON processing related to messaging or payload handling fails
     */
    @Override
    public ResultDTO getAllItems(PagesFilterDTO filterDTO, String language)
            throws URISyntaxException, JsonProcessingException {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            Page<ResultPagesDTO> list = customPagesRepository.findAllWithCriteria(
                    filterDTO, PageRequest.of(page, size));

            if (list == null || list.getContent().isEmpty()) {
                return new ResultDTO(new PageDTO<>(page, size, 0, Collections.emptyList()));
            }
            return new ResultDTO(new PageDTO<>(list.getNumber(), list.getSize(), list.getTotalPages(), list.getContent()));

        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }
}
