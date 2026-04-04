package com.visnex.administrationservice.service.implementation;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.input.SubsidiaryDTO;
import com.visnex.administrationservice.dto.input.SubsidiaryFilterDTO;
import com.visnex.administrationservice.dto.output.ResultSubsidiaryDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.mapper.SubsidiaryMapper;
import com.visnex.administrationservice.repository.SubsidiaryRepository;
import com.visnex.administrationservice.service.SubsidiaryService;
import com.visnex.administrationservice.util.ChangeLogUtil;
import com.visnex.administrationservice.util.EntityChangeEvent;
import com.visnex.administrationservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SubsidiaryServiceImpl implements SubsidiaryService {

    private final SubsidiaryRepository subsidiaryRepository;
    private final SubsidiaryMapper mapper;
    private final ValidationUtils validation;
    private final ApplicationEventPublisher eventPublisher;
    private final ChangeLogUtil<Subsidiary> changeLogUtil;

    private static final String DEFAULT_LANG = "es";

    /**
     * Creates or updates a Subsidiary from the provided DTO.
     *
     * <p>Behavior:
     * - If {@code dto} is {@code null}, a {@code ValidationException} is thrown.
     * - Determines create vs update by checking whether {@code dto.getId()} is {@code null}:
     *   - Create: validates required fields, maps the DTO to a new entity, clears/ensures the id is null,
     *     assigns resolved company and modifiedBy references (if provided), and defaults {@code active}
     *     to {@code true} when not specified.
     *   - Update: verifies the existing subsidiary exists, resolves optional company and modifiedBy
     *     references when provided, and updates only the non-null fields from the DTO on the existing entity.
     * - Persists the entity using the repository and returns a mapped {@code ResultSubsidiaryDTO}.
     *
     * <p>Reference resolution:
     * - When creating or when {@code dto.getIdCompany()} is provided, the company is resolved via validation.
     * - When {@code dto.getIdModifiedBy()} is provided, the user is resolved via validation.
     *
     * <p>Side effects:
     * - The method may modify and persist an entity in the repository.
     *
     * @param dto the SubsidiaryDTO containing data for creation or update; must not be {@code null}
     * @return a ResultSubsidiaryDTO representing the persisted subsidiary
     * @throws ValidationException if {@code dto} is {@code null} or any required validation or referenced
     *                             entity (company, user, or existing subsidiary for updates) cannot be satisfied
     * @throws RuntimeException for underlying persistence/mapper errors propagated from the repository or mapper
     */
    @Override
    public ResultSubsidiaryDTO saveAndUpdate(SubsidiaryDTO dto) {
        if (dto == null) throw new ValidationException("Body requerido");

        final boolean isCreate = (dto.getId() == null);

        if (isCreate) {
            validateRequired(dto);
        } else {
            validation.requireSubsidiary(dto.getId(), DEFAULT_LANG);
        }

        Company company = null;
        if (isCreate || dto.getIdCompany() != null) {
            company = validation.requireCompany(isCreate ? dto.getIdCompany() : dto.getIdCompany(), DEFAULT_LANG);
        }
        User modifiedBy = null;
        if (dto.getIdModifiedBy() != null) {
            modifiedBy = validation.requireUser(dto.getIdModifiedBy(), DEFAULT_LANG);
        }

        Subsidiary entity;
        Subsidiary oldEntity = null;
        if (isCreate) {
            entity = mapper.toEntity(dto);
            entity.setId(null);
            entity.setCompany(company);
            entity.setModifiedBy(modifiedBy);
            if (entity.getActive() == null) entity.setActive(true);
        } else {
            oldEntity = validation.requireSubsidiary(dto.getId(), DEFAULT_LANG);
            entity = oldEntity;

            if (company != null)   entity.setCompany(company);
            if (modifiedBy != null) entity.setModifiedBy(modifiedBy);

            if (dto.getName() != null)                entity.setName(dto.getName());
            if (dto.getNit() != null)                 entity.setNit(dto.getNit());
            if (dto.getAddress() != null)             entity.setAddress(dto.getAddress());
            if (dto.getLegalRepresentative() != null) entity.setLegalRepresentative(dto.getLegalRepresentative());
            if (dto.getEmail() != null)               entity.setEmail(dto.getEmail());
            if (dto.getPhone() != null)               entity.setPhone(dto.getPhone());
            if (dto.getImage() != null)               entity.setImage(dto.getImage());
            if (dto.getActive() != null)              entity.setActive(dto.getActive());
        }

        Subsidiary saved = subsidiaryRepository.save(entity);
        
        // Publicar evento de auditoría
        try {
            Long actorUserId = (dto.getIdModifiedBy() != null) ? dto.getIdModifiedBy() : null;
            if (isCreate) {
                eventPublisher.publishEvent(new EntityChangeEvent(saved, Collections.emptyList(), actorUserId));
            } else if (oldEntity != null) {
                List<Map<String, Object>> changes = changeLogUtil.compararEntidades(oldEntity, saved);
                eventPublisher.publishEvent(new EntityChangeEvent(saved, changes, actorUserId));
            }
        } catch (Exception e) {
            System.err.println("Failed to publish audit event for Subsidiary: " + e.getMessage());
        }
        
        return mapper.toDTO(saved);
    }

    /**
     * Retrieves a subsidiary by its identifier and returns a DTO representation.
     *
     * <p>This method runs in a read-only transactional context. It delegates existence
     * and business validation to the underlying validation layer (via
     * validation.requireSubsidiary(id, DEFAULT_LANG)); if validation fails or the
     * entity cannot be found, an unchecked exception will be propagated.</p>
     *
     * @param id the identifier of the subsidiary to retrieve; must not be null
     * @return a ResultSubsidiaryDTO containing the data of the requested subsidiary
     * @throws IllegalArgumentException if the provided id is null or otherwise invalid
     * @throws RuntimeException if the subsidiary does not exist or validation fails
     */
    @Override
    @Transactional(readOnly = true)
    public ResultSubsidiaryDTO getById(Long id) {
        Subsidiary entity = validation.requireSubsidiary(id, DEFAULT_LANG);
        return mapper.toDTO(entity);
    }

    /**
     * Retrieves a paginated list of subsidiaries that match the provided filter.
     *
     * Behavior:
     * - If the filter contains an idCompany, the method will validate that company
     *   using validation.requireCompany(idCompany, DEFAULT_LANG) before querying.
     * - Pagination defaults:
     *   - page: defaults to 0 when filter.getPage() is null or negative.
     *   - size: defaults to 20 when filter.getSize() is null or non-positive.
     * - The query is executed via subsidiaryRepository.findAllWithCriteria(filter, PageRequest.of(page, size))
     *   and the resulting Spring Page is converted into a PageDTO<ResultSubsidiaryDTO> containing
     *   the current page number, page size, total pages and the page content.
     *
     * Transactional semantics:
     * - Executed in a read-only transactional context (@Transactional(readOnly = true)).
     *
     * @param filter filter criteria for subsidiaries; must not be null. Common fields used:
     *               - idCompany (Long): when present, company existence/validity is checked.
     *               - page (Integer): requested page index (0-based). Negative values treated as 0.
     *               - size (Integer): page size. Non-positive values treated as 20.
     *               - other filter fields as supported by the repository criteria.
     * @return a PageDTO<ResultSubsidiaryDTO> containing the page index, page size, total pages and the list of matching subsidiaries.
     * @throws NullPointerException if filter is null.
     * @throws RuntimeException if company validation fails or if the underlying repository/query raises an error.
     */
    @Override
    @Transactional(readOnly = true)
    public PageDTO<ResultSubsidiaryDTO> getAllItems(SubsidiaryFilterDTO filter) {
        // Si el filtro trae company, validar para coherencia/mensajes homogéneos
        if (filter.getIdCompany() != null) {
            validation.requireCompany(filter.getIdCompany(), DEFAULT_LANG);
        }

        int page = (filter.getPage() == null || filter.getPage() < 0) ? 0 : filter.getPage();
        int size = (filter.getSize() == null || filter.getSize() <= 0) ? 20 : filter.getSize();

        Page<ResultSubsidiaryDTO> p = subsidiaryRepository.findAllWithCriteria(filter, PageRequest.of(page, size));
        return new PageDTO<>(p.getNumber(), p.getSize(), p.getTotalPages(), p.getContent());
    }

    /**
     * Updates the "active" flag of the subsidiary identified by the provided id and persists the change.
     *
     * <p>The subsidiary is first retrieved and validated using validation.requireSubsidiary(id, DEFAULT_LANG).
     * If the subsidiary does not exist or validation fails, a runtime exception is thrown. After updating the
     * active state, the modified entity is saved through the repository.
     *
     * @param id the identifier of the subsidiary to update; must not be null
     * @param active the new active state to set for the subsidiary
     * @throws RuntimeException if the subsidiary cannot be found or validation fails
     * @throws org.springframework.dao.DataAccessException if an error occurs while persisting the change
     */
    @Override
    public void setActive(Long id, boolean active) {
        Subsidiary entity = validation.requireSubsidiary(id, DEFAULT_LANG);
        Boolean oldActive = entity.getActive();
        entity.setActive(active);
        Subsidiary saved = subsidiaryRepository.save(entity);
        
        // Publicar evento de auditoría solo si cambió el valor
        try {
            if (oldActive != null && !oldActive.equals(active)) {
                List<Map<String, Object>> changes = Collections.singletonList(
                    Map.of("field", "active", "oldValue", oldActive, "newValue", active)
                );
                eventPublisher.publishEvent(new EntityChangeEvent(saved, changes, null));
            }
        } catch (Exception e) {
            System.err.println("Failed to publish audit event for Subsidiary setActive: " + e.getMessage());
        }
    }


    private void validateRequired(SubsidiaryDTO dto) {
        if (dto.getIdCompany() == null)                       throw new ValidationException("idCompany es requerido");
        if (dto.getName() == null || dto.getName().isBlank()) throw new ValidationException("name es requerido");
        if (dto.getNit() == null || dto.getNit().isBlank())   throw new ValidationException("nit es requerido");
        if (dto.getActive() == null) dto.setActive(true);
    }
}
