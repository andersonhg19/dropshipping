package com.visnex.administrationservice.service.implementation;

import java.net.URISyntaxException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.CompanyDTO;
import com.visnex.administrationservice.dto.input.CompanyFilterDTO;
import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.output.ResultCompanyDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.mapper.CompanyMapper;
import com.visnex.administrationservice.repository.CompanyRepository;
import com.visnex.administrationservice.repository.CustomCompanyRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.CompanyService;
import com.visnex.administrationservice.util.ChangeLogUtil;
import com.visnex.administrationservice.util.EntityChangeEvent;
import com.visnex.administrationservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository repository;
    private final CustomCompanyRepository customRepository;
    private final CompanyMapper mapper;
    private final ValidationUtils validation;
    private final ConnectInternalApi connectInternalApi;
    private final ApplicationEventPublisher eventPublisher;
    private final ChangeLogUtil<Company> changeLogUtil;

    private static final String DEFAULT_LANG = "es";
    private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

    private String m(String key, String lng) {
        try {
            return connectInternalApi.chargeMessage(key, lng);
        } catch (URISyntaxException | JsonProcessingException e) {
            return key;
        }
    }


    /**
     * Saves a new Company or updates an existing one based on the provided CompanyDTO.
     *
     * <p>Behavior:
     * <ul>
     *   <li>If dto is null, returns a failure ResultDTO indicating body required.</li>
     *   <li>Performs minimal sanitization: trims nit and name when present.</li>
     *   <li>Validates required fields (nit and name) and returns a failure ResultDTO if missing.</li>
     *   <li>Create flow (dto.getId() == null):
     *       <ul>
     *         <li>Checks for existing company with the same NIT; if found returns a failure ResultDTO with code 101.</li>
     *         <li>Persists a new Company and returns a success ResultDTO containing the mapped ResultCompanyDTO.</li>
     *       </ul>
     *   </li>
     *   <li>Update flow (dto.getId() != null):
     *       <ul>
     *         <li>Validates the target company exists via validation.requireCompany(id, language).</li>
     *         <li>Checks NIT uniqueness excluding the current entity; if conflict returns a failure ResultDTO with code 101.</li>
     *         <li>Persists the updated Company and returns a success ResultDTO containing the mapped ResultCompanyDTO.</li>
     *       </ul>
     *   </li>
     *   <li>Catches ValidationException and general Exception and maps them to failure ResultDTO responses (includes message and exception simple name).</li>
     * </ul>
     *
     * @param dto the CompanyDTO to create or update; must not be null for processing and must contain non-blank nit and name
     * @param language the language code used for validation/messages (may be null); normalized internally via lang(language)
     * @return a ResultDTO:
     *         - on success: contains the resulting ResultCompanyDTO,
     *         - on validation or business errors: contains an appropriate error message and code (e.g. 101 for NIT conflict, 103 for validation/body errors),
     *         - on unexpected errors: contains the exception message and type wrapped as a failure ResultDTO.
     */
    @Override
    public ResultDTO saveAndUpdate(CompanyDTO dto, String language) {
        final String lng = lang(language);
        try {
            if (dto == null) {
                return new ResultDTO(false, m(Message.Msj.bodyRequired.toString(), lng), 103);
            }

            if (dto.getNit() != null) dto.setNit(dto.getNit().trim());
            if (dto.getName() != null) dto.setName(dto.getName().trim());

            if (dto.getNit() == null || dto.getNit().isBlank()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " nit", 103);
            }
            if (dto.getName() == null || dto.getName().isBlank()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " name", 103);
            }

            // CREATE
            if (dto.getId() == null) {
                Optional<Company> existingByNit = repository.findFirstByNit(dto.getNit());
                if (existingByNit.isPresent()) {
                    return new ResultDTO(false, m(Message.Msj.thisNitExists.toString(), lng), 101);
                }
                Company created = repository.save(mapper.toEntity(dto));
                ResultCompanyDTO result = mapper.toDTO(created);

                // Publicar evento de auditoría
                try {
                    eventPublisher.publishEvent(new EntityChangeEvent(created, Collections.emptyList(), null));
                } catch (Exception e) {
                    System.err.println("Failed to publish audit event for Company: " + e.getMessage());
                }

                return new ResultDTO(result);
            }

            // UPDATE
            Company oldEntity = validation.requireCompany(dto.getId(), lng);

            Optional<Company> conflict = repository.findFirstByNit(dto.getNit());
            if (conflict.isPresent() && !conflict.get().getId().equals(dto.getId())) {
                return new ResultDTO(false, m(Message.Msj.thisNitExists.toString(), lng), 101);
            }

            Company updated = repository.save(mapper.toEntity(dto));
            ResultCompanyDTO result = mapper.toDTO(updated);
            
            // Publicar evento de auditoría
            try {
                List<Map<String, Object>> changes = changeLogUtil.compararEntidades(oldEntity, updated);
                eventPublisher.publishEvent(new EntityChangeEvent(updated, changes, null));
            } catch (Exception e) {
                System.err.println("Failed to publish audit event for Company: " + e.getMessage());
            }

            return new ResultDTO(result);

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            // Mensaje genérico i18n + detalle técnico en "detail"
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

/**
 * Retrieves a company by its identifier, maps it to a ResultCompanyDTO and wraps it into a ResultDTO.
 *
 * The method:
 * - Normalizes the language parameter via lang(language).
 * - Validates the existence of the company using validation.requireCompany(id, lng).
 * - Converts the found Company entity to a ResultCompanyDTO using mapper.toDTO(entity).
 * - Returns a successful ResultDTO containing the ResultCompanyDTO.
 *
 * Error handling:
 * - If validation.requireCompany throws a ValidationException, the method returns a ResultDTO with success=false,
 *   the exception message, error code 102, and the exception's simple class name.
 * - For any other exception, the method returns a ResultDTO with success=false, the exception message,
 *   error code 103, and the exception's simple class name.
 *
 * @param id the unique identifier of the company to retrieve (may be null; validation enforces existence)
 * @param language the requested language or locale string (may be null; will be normalized)
 * @return a ResultDTO containing a ResultCompanyDTO on success, or a ResultDTO indicating failure with
 *         an appropriate message, error code (102 for validation errors, 103 for general errors), and exception type
 */
   @Override
    public ResultDTO getById(Long id, String language) {
        final String lng = lang(language);
        try {
            Company entity = validation.requireCompany(id, lng);
            ResultCompanyDTO result = mapper.toDTO(entity);
            return new ResultDTO(result);
        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());        }
    }


    /**
     * Retrieves a paginated list of companies that match the provided filter criteria.
     *
     * Behavior:
     * - Normalizes pagination parameters:
     *     - If filterDTO.page is null or negative, defaults to 0.
     *     - If filterDTO.size is null or non-positive, defaults to 20.
     *     - The requested size is capped at a maximum of 200.
     * - Builds a PageRequest and delegates to the repository to fetch a Page<ResultCompanyDTO>.
     * - If the resulting page is null or has no content, returns a ResultDTO indicating failure with an empty PageDTO payload.
     * - Otherwise wraps the Page content into a PageDTO (page number, size, total pages, content) and returns it inside a successful ResultDTO.
     * - Catches ValidationException and general Exception and converts them to failure ResultDTOs containing the exception message and type.
     *
     * @param filterDTO container for filter criteria and pagination parameters (page, size). May contain null fields.
     * @param language  language/locale code used for message localization (accepted for API compatibility).
     * @return ResultDTO whose payload is a PageDTO<ResultCompanyDTO>:
     *         - success=true and payload populated when matching items exist;
     *         - success=false and payload an empty PageDTO when no matching items are found (error code 102);
     *         - success=false with exception details when a validation or unexpected error occurs (error code 103).
     */
    @Override
    public ResultDTO getAllItems(CompanyFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            PageRequest pageable = PageRequest.of(page, size);
            Page<ResultCompanyDTO> pageResult = customRepository.findAllWithCriteria(filterDTO, pageable);

            if (pageResult == null || pageResult.isEmpty()) {
                // Éxito con página vacía (consistente con ModuleServiceImpl)
                PageDTO<ResultCompanyDTO> empty = new PageDTO<>(page, size, 0, Collections.emptyList());
                return new ResultDTO(empty);
            }

            PageDTO<ResultCompanyDTO> result = new PageDTO<>(
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalPages(),
                pageResult.getContent()
            );
            return new ResultDTO(result);

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

}
