package com.visnex.administrationservice.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.input.StyleFilterDTO;
import com.visnex.administrationservice.dto.input.StyleUpsertDetailDTO;
import com.visnex.administrationservice.dto.input.StyleUpsertListDTO;
import com.visnex.administrationservice.dto.output.ResultStyleDTO;
import com.visnex.administrationservice.dto.output.ResultStyleUpsertDetailDTO;
import com.visnex.administrationservice.dto.output.ResultStyleUpsertListDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Style;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.mapper.StyleMapper;
import com.visnex.administrationservice.repository.StyleRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.StyleService;
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
public class StyleServiceImpl implements StyleService {

    private final StyleRepository styleRepository;
    private final StyleMapper mapper;
    private final ValidationUtils validation;
    private final ConnectInternalApi connectInternalApi;
    private static final String DEFAULT_LANG = "es";

    private String m(String key) {
        try {
            return connectInternalApi.chargeMessage(key, DEFAULT_LANG);
        } catch (URISyntaxException | JsonProcessingException e) {
            return key;
        }
    }

    /**
     * Saves or updates a batch of Style entities described by the provided StyleUpsertListDTO.
     *
     * <p>Behavior:
     * <ul>
     *   <li>Validates that the request body and the details list are present and non-empty.</li>
     *   <li>Resolves the Company and the modifying User (and optionally a Subsidiary) using the validation helper
     *       before processing any details.</li>
     *   <li>Processes each detail in the list in order:
     *     <ul>
     *       <li>Validates that the detail name is present and not blank.</li>
     *       <li>If an id string is provided it is trimmed and parsed to a Long; a non-numeric id causes a
     *           ValidationException for that detail.</li>
     *       <li>If an id is present the existing Style is loaded via validation.requireStyle(id,...).
     *           Otherwise, it attempts to find an existing Style by company/(optional)subsidiary and case-insensitive
     *           name; if none is found a new Style instance is created.</li>
     *       <li>Sets company, subsidiary, modifiedBy and updates fields (name, value, type, typeValue) when non-null
     *           in the incoming detail.</li>
     *       <li>When creating a new Style, a non-blank value is required; otherwise a ValidationException is thrown.</li>
     *       <li>Active flag semantics:
     *         <ul>
     *           <li>For new entities, active defaults to true unless the detail explicitly provides a value.</li>
     *           <li>For existing entities, active is updated only if the detail provides a value.</li>
     *         </ul>
     *       </li>
     *       <li>Saves each entity via the repository. Any DataIntegrityViolationException that arises during save
     *           (for example, unique constraint on company/subsidiary/name) is rethrown with a localized conflict message.</li>
     *       <li>Each saved entity is mapped to ResultStyleDTO and a corresponding ResultStyleUpsertDetailDTO
     *           is built and added to the response details.</li>
     *     </ul>
     *   </li>
     *   <li>The method aggregates header information (company id/name, subsidiary id/name and modifier id/name)
     *       using the saved result of the first processed detail (if any) and returns a ResultStyleUpsertListDTO
     *       that contains the list of per-detail results.</li>
     * </ul>
     *
     * <p>Transactional behavior:
     * <ul>
     *   <li>The method is executed within a transaction: if any validation or persistence error occurs the entire
     *       operation is rolled back so partial updates are not persisted.</li>
     * </ul>
     *
     * @param dto the batch upsert DTO containing the company id, modifier id, optional subsidiary id and a list of details;
     *            must not be null and must contain at least one detail
     * @return a ResultStyleUpsertListDTO containing the company/subsidiary/modifier identifiers and names (when available)
     *         and a list of ResultStyleUpsertDetailDTO entries reflecting the saved state of each processed detail
     * @throws ValidationException if the request body or details are missing/invalid, if a detail name is blank,
     *         if a provided id is non-numeric, if required referenced resources (company, user, subsidiary, or style by id)
     *         are not found, or if required fields for creation (e.g. value) are missing
     * @throws DataIntegrityViolationException if persisting a Style fails due to a database integrity constraint
     *         (for example uniqueness conflict on company/subsidiary/name). The original exception is wrapped to provide
     *         a clearer conflict message for callers.
     */
    @Override
    @Transactional
    public ResultStyleUpsertListDTO saveAndUpdate(StyleUpsertListDTO dto) {
        if (dto == null) throw new ValidationException(m(Message.Msj.bodyRequired.toString()));
        if (dto.getDetails() == null || dto.getDetails().isEmpty())
            throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " details");

        final Company company = validation.requireCompany(dto.getIdCompany(), DEFAULT_LANG);
        final User user = validation.requireUser(dto.getIdModifiedBy(), DEFAULT_LANG);
        final Subsidiary subsidiary = (dto.getIdSubsidiary() != null)
                ? validation.requireSubsidiary(dto.getIdSubsidiary(), DEFAULT_LANG)
                : null;

        final List<ResultStyleUpsertDetailDTO> resultDetails = new ArrayList<>(dto.getDetails().size());
        ResultStyleDTO headerFromFirst = null;

        for (StyleUpsertDetailDTO d : dto.getDetails()) {
            if (d.getName() == null || d.getName().isBlank())
                throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " name");

            // Parseo seguro de id (si viene)
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

            final Style entity;
            final Style oldSnapshot = new Style();

            if (id != null) {
                entity = validation.requireStyle(id, DEFAULT_LANG);
                BeanUtils.copyProperties(entity, oldSnapshot);
            } else {
                Optional<Style> existing = (subsidiary != null)
                        ? styleRepository.findByCompany_IdAndSubsidiary_IdAndNameIgnoreCase(company.getId(), subsidiary.getId(), d.getName())
                        : styleRepository.findByCompany_IdAndNameIgnoreCaseAndSubsidiaryIsNull(company.getId(), d.getName());
                entity = existing.orElseGet(Style::new);
                existing.ifPresent(e -> BeanUtils.copyProperties(e, oldSnapshot));
            }

            entity.setCompany(company);
            entity.setSubsidiary(subsidiary);
            entity.setModifiedBy(user);

            entity.setName(d.getName());
            if (d.getValue() != null)     entity.setValue(d.getValue());
            if (d.getType() != null)      entity.setType(d.getType());
            if (d.getTypeValue() != null) entity.setTypeValue(d.getTypeValue());

            if (entity.getId() == null && (entity.getValue() == null || entity.getValue().isBlank())) {
                throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " value");
            }

            if (entity.getId() == null) {
                entity.setActive(d.getActive() == null ? Boolean.TRUE : d.getActive());
            } else if (d.getActive() != null) {
                entity.setActive(d.getActive());
            }

            final Style saved;
            try {
                saved = styleRepository.save(entity);
            } catch (DataIntegrityViolationException ex) {
                throw new DataIntegrityViolationException("Conflicto de unicidad (company/subsidiary/name).", ex);
            }
            validation.publishChanges(oldSnapshot, saved, user.getId());

            final ResultStyleDTO mapped = mapper.toDTO(saved);
            if (headerFromFirst == null) headerFromFirst = mapped;

            final ResultStyleUpsertDetailDTO rd = new ResultStyleUpsertDetailDTO();
            rd.setId(mapped.getId());
            rd.setName(mapped.getName());
            rd.setValue(mapped.getValue());
            rd.setType(mapped.getType());
            rd.setTypeValue(mapped.getTypeValue());
            rd.setActive(mapped.getActive());
            resultDetails.add(rd);
        }

        final ResultStyleUpsertListDTO out = new ResultStyleUpsertListDTO();
        out.setIdCompany(company.getId());
        out.setCompanyName(headerFromFirst != null ? headerFromFirst.getCompanyName() : null);
        out.setIdSubsidiary(subsidiary != null ? subsidiary.getId() : null);
        out.setSubsidiaryName(headerFromFirst != null ? headerFromFirst.getSubsidiaryName() : null);
        out.setIdModifiedBy(user.getId());
        out.setModifiedBy(headerFromFirst != null ? headerFromFirst.getModifiedBy() : null);
        out.setDetails(resultDetails);

        return out;
    }

    /**
     * Retrieve a style by its identifier and return it as a DTO.
     *
     * <p>This method validates the existence and accessibility of the requested style
     * (using the default language) via validation.requireStyle(...), then maps the
     * resulting domain entity to a ResultStyleDTO with the configured mapper.
     * The operation is executed within a read-only transactional context.
     *
     * @param id the identifier of the style to retrieve; should refer to an existing style
     * @return a ResultStyleDTO representing the requested style in the default language
     * @throws IllegalArgumentException if the provided id is null or otherwise invalid
     * @throws RuntimeException if the style cannot be found or validation fails
     */
    @Override
    @Transactional(readOnly = true)
    public ResultStyleDTO getById(Long id) {
        final Style s = validation.requireStyle(id, DEFAULT_LANG);
        return mapper.toDTO(s);
    }


    /**
     * Searches for styles matching the provided filter and returns a paginated DTO of results.
     *
     * The method performs reference validation for entities included in the filter:
     * - If the filter contains an idCompany, {@code validation.requireCompany(idCompany, DEFAULT_LANG)} is invoked.
     * - If the filter contains an idSubsidiary, {@code validation.requireSubsidiary(idSubsidiary, DEFAULT_LANG)} is invoked.
     *
     * Pagination rules:
     * - page defaults to 0 if null or negative.
     * - size defaults to 20 if null or non-positive.
     * - size is capped at 200 to prevent excessively large pages.
     *
     * The repository is queried with the computed PageRequest and the resulting Page is converted into a
     * PageDTO that includes the current page number, page size, total pages and the page content.
     *
     * This method runs within a read-only transaction.
     *
     * @param filter the search and pagination criteria; must provide any references to be validated (a null filter will cause a NullPointerException)
     * @return a PageDTO containing ResultStyleDTO items and pagination metadata
     * @throws RuntimeException if validation of referenced entities fails or if the repository query fails
     */
    @Override
    @Transactional(readOnly = true)
    public PageDTO<ResultStyleDTO> search(StyleFilterDTO filter) {
        if (filter.getIdCompany() != null) {
            validation.requireCompany(filter.getIdCompany(), DEFAULT_LANG);
        }
        if (filter.getIdSubsidiary() != null) {
            validation.requireSubsidiary(filter.getIdSubsidiary(), DEFAULT_LANG);
        }

        int page = (filter.getPage() == null || filter.getPage() < 0) ? 0 : filter.getPage();
        int size = (filter.getSize() == null || filter.getSize() <= 0) ? 20 : filter.getSize();
        size = Math.min(size, 200);

        Page<ResultStyleDTO> p = styleRepository.findAllWithCriteria(filter, PageRequest.of(page, size));
        return new PageDTO<>(p.getNumber(), p.getSize(), p.getTotalPages(), p.getContent());
    }

    /**
     * Updates the active state of the Style identified by the given id and persists the change.
     *
     * The method resolves the Style (performing any necessary validation), sets its active flag
     * to the provided value and saves the updated entity to the repository.
     *
     * @param id the identifier of the Style to update; must refer to an existing Style
     * @param active true to activate the Style, false to deactivate it
     * @throws RuntimeException if the Style cannot be resolved or validation fails
     */
    @Override
    public void setActive(Long id, boolean active) {
        final Style s = validation.requireStyle(id, DEFAULT_LANG);

        final Style oldSnapshot = new Style();
        BeanUtils.copyProperties(s, oldSnapshot);

        s.setActive(active);
        Style saved = styleRepository.save(s);

        validation.publishChanges(oldSnapshot, saved, null);
    }

    /**
     * Look up a Style by company, optional subsidiary and name, and return its DTO.
     *
     * The method performs the following steps:
     * - Validates that {@code name} is not null or blank (throws {@link ValidationException} otherwise).
     * - Ensures the company exists via {@code validation.requireCompany(idCompany, DEFAULT_LANG)}.
     * - If {@code idSubsidiary} is non-null, ensures the subsidiary exists via {@code validation.requireSubsidiary(idSubsidiary, DEFAULT_LANG)}.
     * - If {@code idSubsidiary} is non-null, searches for a Style by company id, subsidiary id and name (case-insensitive).
     *   If {@code idSubsidiary} is null, searches for a global Style for the company (subsidiary is null) by name (case-insensitive).
     * - Throws {@link EntityNotFoundException} when no matching Style is found.
     * - Maps the found entity to a {@code ResultStyleDTO} and returns it.
     *
     * This method is executed within a read-only transactional context.
     *
     * @param idCompany the company identifier (must exist)
     * @param idSubsidiary the subsidiary identifier to scope the lookup; may be {@code null} to search global styles
     * @param name the name of the style to find (case-insensitive); must not be {@code null} or blank
     * @return a {@code ResultStyleDTO} representing the found Style
     * @throws ValidationException if {@code name} is null/blank or company/subsidiary validation fails
     * @throws EntityNotFoundException if no Style matches the provided criteria
     */
    @Override
    @Transactional(readOnly = true)
    public ResultStyleDTO lookup(Long idCompany, Long idSubsidiary, String name) {
        if (name == null || name.isBlank()) {
            throw new ValidationException(m(Message.Msj.return_field_is_required.toString()) + " name");
        }

        validation.requireCompany(idCompany, DEFAULT_LANG);
        if (idSubsidiary != null) {
            validation.requireSubsidiary(idSubsidiary, DEFAULT_LANG);
        }

        final Style s = (idSubsidiary != null)
                ? styleRepository
                    .findByCompany_IdAndSubsidiary_IdAndNameIgnoreCase(idCompany, idSubsidiary, name)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "No existe style para company=" + idCompany + ", subsidiary=" + idSubsidiary + ", name=" + name))
                : styleRepository
                    .findByCompany_IdAndNameIgnoreCaseAndSubsidiaryIsNull(idCompany, name)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "No existe style global para company=" + idCompany + ", name=" + name));

        return mapper.toDTO(s);
    }
}
