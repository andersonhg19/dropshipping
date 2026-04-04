package com.visnex.administrationservice.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.ConfigurationFilterDTO;
import com.visnex.administrationservice.dto.input.ConfigurationUpsertListDTO;
import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationUpsertDetailDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationUpsertListDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Configuration;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.mapper.ConfigurationMapper;
import com.visnex.administrationservice.repository.ConfigurationRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.ConfigurationService;
import com.visnex.administrationservice.util.ValidationUtils;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.BeanUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ConfigurationServiceImpl implements ConfigurationService {

    private final ConfigurationRepository configurationRepository;
    private final ValidationUtils validation;
    private final ConfigurationMapper mapper;
    private final ConnectInternalApi connectInternalApi;
    private static final String DEFAULT_LANG = "es";

    private String m(String key) {
        try {
            return connectInternalApi.chargeMessage(key, DEFAULT_LANG);
        } catch (URISyntaxException | JsonProcessingException e) {
            // fallback a la key si el micro de language no responde
            return key;
        }
    }

    /**
     * Saves or updates multiple Configuration entities for a company (and optional subsidiary) in a single transactional operation.
     *
     * Behavior and validations:
     * - dto must be non-null; dto.getIdCompany() and dto.getIdModifiedBy() must be present; dto.getDetails() must be non-null and non-empty.
     * - Resolves required references using validation helpers: Company, User and optionally Subsidiary (uses DEFAULT_LANG).
     * - Iterates each detail in dto.getDetails():
     *   - detail.name and detail.value are required and must be non-blank.
     *   - If detail.id is provided (non-blank) it is parsed as a Long; a non-numeric id results in ValidationException.
     *   - If an id is present the existing Configuration is loaded via validation.requireConfiguration(id).
     *     Otherwise, the repository is queried for an existing configuration by company (+ subsidiary when provided) and name
     *     (case-insensitive). If none is found a new Configuration instance is created.
     *   - Sets company, subsidiary, modifiedBy, name and value on the entity. If detail.type is non-null it is set.
     *   - Active flag semantics:
     *     - For new entities: active defaults to true if detail.active is null; otherwise uses detail.active.
     *     - For existing entities: active is updated only when detail.active is non-null.
     *   - Persists the entity via configurationRepository.save(...). DataIntegrityViolationException caused by uniqueness
     *     constraint violations (company/subsidiary/name) is re-thrown with a descriptive message.
     *   - Maps the saved entity to a DTO (mapper.toDTO) and builds a ResultConfigurationUpsertDetailDTO for the response list.
     *
     * Response:
     * - Returns a ResultConfigurationUpsertListDTO containing:
     *   - idCompany and companyName (companyName is taken from the first mapped result when available),
     *   - optional idSubsidiary and subsidiaryName,
     *   - idModifiedBy and modifiedBy (taken from the first mapped result when available),
     *   - details: list of ResultConfigurationUpsertDetailDTO with id, name, value, type and active for each saved detail.
     *
     * Transactionality:
     * - The method is transactional: all changes are committed atomically or rolled back on error.
     *
     * Exceptions:
     * - ValidationException for missing/invalid input or when required referenced entities cannot be found.
     * - DataIntegrityViolationException when saving fails due to a uniqueness conflict on (company, subsidiary, name).
     *
     * Notes:
     * - Uses DEFAULT_LANG when resolving referenced entities.
     * - Concurrent calls that create entities with the same (company, subsidiary, name) may trigger DataIntegrityViolationException.
     *
     * @param dto the ConfigurationUpsertListDTO containing header information and the list of details to create or update
     * @return a ResultConfigurationUpsertListDTO summarizing the saved/updated configurations and related identifying info
     * @throws ValidationException if dto or required fields are missing/invalid or referenced entities are not found
     * @throws DataIntegrityViolationException if a uniqueness constraint (company/subsidiary/name) is violated during save
     */
    @Override
    @Transactional
    public ResultConfigurationUpsertListDTO saveAndUpdate(ConfigurationUpsertListDTO dto) {
        if (dto == null) throw new ValidationException(m(Message.Msj.bodyRequired.toString()));
        if (dto.getIdCompany() == null)    throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " idCompany");
        if (dto.getIdModifiedBy() == null) throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " idModifiedBy");
        if (dto.getDetails() == null || dto.getDetails().isEmpty())
            throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " details");

        final Company company = validation.requireCompany(dto.getIdCompany(), DEFAULT_LANG);
        final User user = validation.requireUser(dto.getIdModifiedBy(), DEFAULT_LANG);
        final Subsidiary subsidiary = (dto.getIdSubsidiary() != null)
                ? validation.requireSubsidiary(dto.getIdSubsidiary(), DEFAULT_LANG)
                : null;

        final List<ResultConfigurationUpsertDetailDTO> detailsOut = new ArrayList<>(dto.getDetails().size());
        ResultConfigurationDTO headerFromFirst = null;

        for (var d : dto.getDetails()) {
            if (d.getName() == null || d.getName().isBlank())
                throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " name");
            if (d.getValue() == null || d.getValue().isBlank())
                throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " value");

            Long id = null;
            if (d.getId() != null) {
                String s = d.getId().trim();
                if (!s.isEmpty()) {
                    try { id = Long.valueOf(s); }
                    catch (NumberFormatException nfe) {
                        throw new ValidationException("El id del detalle no es numérico: '" + d.getId() + "'");
                    }
                }
            }

            final Configuration entity;
            final Configuration oldSnapshot = new Configuration();

            if (id != null) {
                // UPDATE por id explícito
                entity = validation.requireConfiguration(id, DEFAULT_LANG);
                BeanUtils.copyProperties(entity, oldSnapshot);
            } else {
                // Si existe por (company, subsidiary?, name) => UPDATE; si no, CREATE
                Optional<Configuration> existing = (subsidiary != null)
                        ? configurationRepository.findByCompany_IdAndSubsidiary_IdAndNameIgnoreCase(company.getId(), subsidiary.getId(), d.getName())
                        : configurationRepository.findByCompany_IdAndNameIgnoreCaseAndSubsidiaryIsNull(company.getId(), d.getName());
                entity = existing.orElseGet(Configuration::new);
                existing.ifPresent(cfg -> BeanUtils.copyProperties(cfg, oldSnapshot));
            }

            // Mutaciones
            entity.setCompany(company);
            entity.setSubsidiary(subsidiary);
            entity.setModifiedBy(user);
            entity.setName(d.getName());
            entity.setValue(d.getValue());
            if (d.getType() != null) entity.setType(d.getType());

            if (entity.getId() == null) {
                entity.setActive(d.getActive() == null ? Boolean.TRUE : d.getActive());
            } else if (d.getActive() != null) {
                entity.setActive(d.getActive());
            }

            final Configuration saved;
            try {
                saved = configurationRepository.save(entity);
            } catch (DataIntegrityViolationException ex) {
                throw new DataIntegrityViolationException("Conflicto de unicidad (company/subsidiary/name).", ex);
            }

            // Auditoría (old vs new)
            validation.publishChanges(oldSnapshot, saved, user.getId());

            final var mapped = mapper.toDTO(saved);
            if (headerFromFirst == null) headerFromFirst = mapped;

            final var rd = new ResultConfigurationUpsertDetailDTO();
            rd.setId(mapped.getId());
            rd.setName(mapped.getName());
            rd.setValue(mapped.getValue());
            rd.setType(mapped.getType());
            rd.setActive(mapped.getActive());
            detailsOut.add(rd);
        }

        final var out = new ResultConfigurationUpsertListDTO();
        out.setIdCompany(company.getId());
        out.setCompanyName(headerFromFirst != null ? headerFromFirst.getCompanyName() : null);
        out.setIdSubsidiary(subsidiary != null ? subsidiary.getId() : null);
        out.setSubsidiaryName(headerFromFirst != null ? headerFromFirst.getSubsidiaryName() : null);
        out.setIdModifiedBy(user.getId());
        out.setModifiedBy(headerFromFirst != null ? headerFromFirst.getModifiedBy() : null);
        out.setDetails(detailsOut);
        return out;
    }

    
    /**
     * Retrieve a configuration by its identifier and return its DTO representation.
     *
     * <p>This method performs validation to ensure a configuration with the provided id exists
     * (using validation.requireConfiguration with the default language) and then maps the
     * resulting Configuration entity to a ResultConfigurationDTO. The operation is executed
     * within a read-only transactional context.</p>
     *
     * @param id the identifier of the configuration to retrieve; must not be null
     * @return a ResultConfigurationDTO representing the requested configuration
     * @throws RuntimeException if validation fails or no configuration is found for the given id
     * @implNote this method suppresses deprecation warnings for the use of the DEFAULT_LANG constant
     */
    @Override
    @Transactional(readOnly = true)
    public ResultConfigurationDTO getById(Long id) {
        final Configuration entity = validation.requireConfiguration(id, DEFAULT_LANG);
        return mapper.toDTO(entity);
    }


    /**
     * Search for configurations matching the provided filter and return a paginated result.
     *
     * Validates company and subsidiary IDs when present in the filter before executing the query.
     * Pagination defaults: page -> 0 when null or negative; size -> 20 when null or <= 0.
     * The search is delegated to the repository (findAllWithCriteria) and the resulting Spring Page
     * is adapted into a PageDTO containing page number, page size, total pages and the content list.
     *
     * This method is executed within a read-only transaction.
     *
     * @param filter the filter and pagination parameters used to narrow the search (must be non-null)
     * @return a PageDTO<ResultConfigurationDTO> holding the current page metadata and matching results
     * @throws RuntimeException if validation of company/subsidiary IDs fails
     * @throws org.springframework.dao.DataAccessException if an error occurs while querying the repository
     */
    @Override
    @Transactional(readOnly = true)
    public PageDTO<ResultConfigurationDTO> search(ConfigurationFilterDTO filter) {
        if (filter.getIdCompany() != null) {
            validation.requireCompany(filter.getIdCompany(), DEFAULT_LANG);
        }
        if (filter.getIdSubsidiary() != null) {
            validation.requireSubsidiary(filter.getIdSubsidiary(), DEFAULT_LANG);
        }

        int page = (filter.getPage() == null || filter.getPage() < 0) ? 0 : filter.getPage();
        int size = (filter.getSize() == null || filter.getSize() <= 0) ? 20 : filter.getSize();
        size = Math.min(size, 200);

        Page<ResultConfigurationDTO> p = configurationRepository.findAllWithCriteria(filter, PageRequest.of(page, size));
        return new PageDTO<>(p.getNumber(), p.getSize(), p.getTotalPages(), p.getContent());
    }

    /**
     * Set the active state of a Configuration entity identified by the given id.
     *
     * <p>This method performs the following steps:
     * <ol>
     *   <li>Validates that a Configuration with the specified {@code id} exists (validation uses the default language).</li>
     *   <li>Updates the entity's active flag to the value of {@code active}.</li>
     *   <li>Persists the updated entity to the underlying repository.</li>
     * </ol>
     *
     * @param id the identifier of the Configuration to update; must not be {@code null}
     * @param active the new active state to apply to the Configuration
     * @throws IllegalArgumentException if {@code id} is {@code null}
     * @throws RuntimeException if the configuration cannot be found or validation fails
     */
    @Override
    public void setActive(Long id, boolean active) {
        final Configuration entity = validation.requireConfiguration(id, DEFAULT_LANG);

        final Configuration oldSnapshot = new Configuration();
        BeanUtils.copyProperties(entity, oldSnapshot);

        entity.setActive(active);
        Configuration saved = configurationRepository.save(entity);

        validation.publishChanges(oldSnapshot, saved, null);
    }


    /**
     * Look up a configuration by company, optional subsidiary and name.
     *
     * The lookup is case-insensitive for the configuration name. If {@code idSubsidiary}
     * is non-null the method searches for a configuration associated with that subsidiary;
     * otherwise it searches for a global configuration (subsidiary == null).
     *
     * This method validates that the company exists (and the subsidiary when provided)
     * using the service's validation helpers and executes within a read-only transactional
     * context.
     *
     * @param idCompany    the company identifier; must refer to an existing company
     * @param idSubsidiary the subsidiary identifier to restrict the search to; may be null to indicate a global configuration
     * @param name         the configuration name to look up; must not be null or blank
     * @return the DTO representation of the found configuration
     * @throws ValidationException   if {@code name} is null/blank or if company/subsidiary validation fails
     * @throws EntityNotFoundException if no matching configuration is found for the given company/subsidiary and name
     */
    @Override
    @Transactional(readOnly = true)
    public ResultConfigurationDTO lookup(Long idCompany, Long idSubsidiary, String name) {
        if (name == null || name.isBlank())
            throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " name");

        validation.requireCompany(idCompany, DEFAULT_LANG);
        if (idSubsidiary != null) {
            validation.requireSubsidiary(idSubsidiary, DEFAULT_LANG);
        }

        Configuration cfg = (idSubsidiary != null)
                ? configurationRepository.findByCompany_IdAndSubsidiary_IdAndNameIgnoreCase(idCompany, idSubsidiary, name)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "No existe configuración para company=" + idCompany + ", subsidiary=" + idSubsidiary + ", name=" + name))
                : configurationRepository.findByCompany_IdAndNameIgnoreCaseAndSubsidiaryIsNull(idCompany, name)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "No existe configuración global para company=" + idCompany + ", name=" + name));

        return mapper.toDTO(cfg);
    }
}