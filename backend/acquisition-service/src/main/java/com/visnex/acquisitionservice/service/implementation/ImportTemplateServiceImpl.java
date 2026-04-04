package com.visnex.acquisitionservice.service.implementation;

import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.acquisitionservice.dto.input.ImportTemplateDTO;
import com.visnex.acquisitionservice.dto.input.ImportTemplateFilterDTO;
import com.visnex.acquisitionservice.dto.input.PageDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.dto.output.ResultImportTemplateDTO;
import com.visnex.acquisitionservice.entity.ImportTemplate;
import com.visnex.acquisitionservice.enums.Message;
import com.visnex.acquisitionservice.exception.ValidationException;
import com.visnex.acquisitionservice.mapper.ImportTemplateMapper;
import com.visnex.acquisitionservice.repository.CustomImportTemplateRepository;
import com.visnex.acquisitionservice.repository.ImportTemplateRepository;
import com.visnex.acquisitionservice.security.ConnectInternalApi;
import com.visnex.acquisitionservice.service.ImportTemplateService;
import com.visnex.acquisitionservice.util.CompletionUtils;
import com.visnex.acquisitionservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImportTemplateServiceImpl implements ImportTemplateService {

    private final ImportTemplateRepository repository;
    private final CustomImportTemplateRepository customRepository;
    private final ImportTemplateMapper mapper;
    private final ValidationUtils validation;
    private final ConnectInternalApi connectInternalApi;
    private final CompletionUtils completionUtils;

    private static final String DEFAULT_LANG = "es";
    private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

    private String m(String key, String lng) {
        try {
            return connectInternalApi.chargeMessage(key, lng);
        } catch (URISyntaxException | JsonProcessingException e) {
            return key;
        }
    }

    @Override
    public ResultDTO saveAndUpdate(ImportTemplateDTO dto, String language) {
        final String lng = lang(language);
        try {
            if (dto == null) {
                return new ResultDTO(false, m(Message.Msj.bodyRequired.toString(), lng), 103);
            }

            if (dto.getName() != null) dto.setName(dto.getName().trim());

            if (dto.getIdCompany() == null) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " idCompany", 103);
            }
            if (dto.getName() == null || dto.getName().isBlank()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " name", 103);
            }

            // CREATE
            if (dto.getId() == null) {
                Optional<ImportTemplate> existingByName = repository.findFirstByNameAndCompanyIdAndActive(dto.getName(), dto.getIdCompany(), true);
                if (existingByName.isPresent()) {
                    return new ResultDTO(false, m(Message.Msj.thisNameExists.toString(), lng), 101);
                }
                ImportTemplate entity = mapper.toEntity(dto);
                if (entity.getActive() == null) entity.setActive(true);
                ImportTemplate created = repository.save(entity);
                ResultImportTemplateDTO result = mapper.toDTO(created);
                completionUtils.enrich(result, lng);
                return new ResultDTO(result);
            }

            // UPDATE
            validation.requireImportTemplate(dto.getId(), lng);

            Optional<ImportTemplate> conflict = repository.findFirstByNameAndCompanyIdAndActive(dto.getName(), dto.getIdCompany(), true);
            if (conflict.isPresent() && !conflict.get().getId().equals(dto.getId())) {
                return new ResultDTO(false, m(Message.Msj.thisNameExists.toString(), lng), 101);
            }

            ImportTemplate updated = repository.save(mapper.toEntity(dto));
            ResultImportTemplateDTO result = mapper.toDTO(updated);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

    @Override
    public ResultDTO getById(Long id, String language) {
        final String lng = lang(language);
        try {
            ImportTemplate entity = validation.requireImportTemplate(id, lng);
            ResultImportTemplateDTO result = mapper.toDTO(entity);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

    @Override
    public ResultDTO getAllItems(ImportTemplateFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            PageRequest pageable = PageRequest.of(page, size);
            Page<ResultImportTemplateDTO> pageResult = customRepository.findAllWithCriteria(filterDTO, pageable);

            if (pageResult == null || pageResult.isEmpty()) {
                PageDTO<ResultImportTemplateDTO> empty = new PageDTO<>(page, size, 0, Collections.emptyList());
                return new ResultDTO(empty);
            }

            completionUtils.enrichList(pageResult.getContent(), lng);

            PageDTO<ResultImportTemplateDTO> result = new PageDTO<>(
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
