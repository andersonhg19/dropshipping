package com.visnex.acquisitionservice.service.implementation;

import java.net.URISyntaxException;
import java.util.Collections;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.acquisitionservice.dto.input.PageDTO;
import com.visnex.acquisitionservice.dto.input.SourceProductDTO;
import com.visnex.acquisitionservice.dto.input.SourceProductFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.dto.output.ResultSourceProductDTO;
import com.visnex.acquisitionservice.entity.SourceProduct;
import com.visnex.acquisitionservice.enums.Message;
import com.visnex.acquisitionservice.exception.ValidationException;
import com.visnex.acquisitionservice.mapper.SourceProductMapper;
import com.visnex.acquisitionservice.repository.CustomSourceProductRepository;
import com.visnex.acquisitionservice.repository.SourceProductRepository;
import com.visnex.acquisitionservice.security.ConnectInternalApi;
import com.visnex.acquisitionservice.service.SourceProductService;
import com.visnex.acquisitionservice.util.CompletionUtils;
import com.visnex.acquisitionservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SourceProductServiceImpl implements SourceProductService {

    private final SourceProductRepository repository;
    private final CustomSourceProductRepository customRepository;
    private final SourceProductMapper mapper;
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
    public ResultDTO saveAndUpdate(SourceProductDTO dto, String language) {
        final String lng = lang(language);
        try {
            if (dto == null) {
                return new ResultDTO(false, m(Message.Msj.bodyRequired.toString(), lng), 103);
            }

            if (dto.getTitle() != null) dto.setTitle(dto.getTitle().trim());

            if (dto.getIdCompany() == null) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " idCompany", 103);
            }
            if (dto.getTitle() == null || dto.getTitle().isBlank()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " title", 103);
            }

            // CREATE
            if (dto.getId() == null) {
                SourceProduct entity = mapper.toEntity(dto);
                if (entity.getActive() == null) entity.setActive(true);
                if (entity.getImported() == null) entity.setImported(false);
                if (entity.getCurrency() == null) entity.setCurrency("USD");
                SourceProduct created = repository.save(entity);
                ResultSourceProductDTO result = mapper.toDTO(created);
                completionUtils.enrich(result, lng);
                return new ResultDTO(result);
            }

            // UPDATE
            validation.requireSourceProduct(dto.getId(), lng);

            SourceProduct updated = repository.save(mapper.toEntity(dto));
            ResultSourceProductDTO result = mapper.toDTO(updated);
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
            SourceProduct entity = validation.requireSourceProduct(id, lng);
            ResultSourceProductDTO result = mapper.toDTO(entity);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

    @Override
    public ResultDTO getAllItems(SourceProductFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            PageRequest pageable = PageRequest.of(page, size);
            Page<ResultSourceProductDTO> pageResult = customRepository.findAllWithCriteria(filterDTO, pageable);

            if (pageResult == null || pageResult.isEmpty()) {
                PageDTO<ResultSourceProductDTO> empty = new PageDTO<>(page, size, 0, Collections.emptyList());
                return new ResultDTO(empty);
            }

            completionUtils.enrichList(pageResult.getContent(), lng);

            PageDTO<ResultSourceProductDTO> result = new PageDTO<>(
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
