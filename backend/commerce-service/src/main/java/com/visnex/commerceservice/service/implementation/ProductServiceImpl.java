package com.visnex.commerceservice.service.implementation;

import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.commerceservice.dto.input.PageDTO;
import com.visnex.commerceservice.dto.input.ProductDTO;
import com.visnex.commerceservice.dto.input.ProductFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.dto.output.ResultProductDTO;
import com.visnex.commerceservice.entity.Product;
import com.visnex.commerceservice.enums.Message;
import com.visnex.commerceservice.exception.ValidationException;
import com.visnex.commerceservice.mapper.ProductMapper;
import com.visnex.commerceservice.repository.ProductRepository;
import com.visnex.commerceservice.security.ConnectInternalApi;
import com.visnex.commerceservice.service.ProductService;
import com.visnex.commerceservice.util.CompletionUtils;
import com.visnex.commerceservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repository;
    private final ProductMapper mapper;
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
    public ResultDTO saveAndUpdate(ProductDTO dto, String language) {
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

            if (dto.getStatus() == null || dto.getStatus().isBlank()) {
                dto.setStatus("DRAFT");
            }
            if (dto.getCurrency() == null || dto.getCurrency().isBlank()) {
                dto.setCurrency("USD");
            }

            // CREATE
            if (dto.getId() == null) {
                Optional<Product> existingByTitle = repository.findFirstByTitleAndCompanyIdAndActive(dto.getTitle(), dto.getIdCompany(), true);
                if (existingByTitle.isPresent()) {
                    return new ResultDTO(false, m(Message.Msj.thisNameExists.toString(), lng), 101);
                }
                Product entity = mapper.toEntity(dto);
                if (entity.getActive() == null) entity.setActive(true);
                Product created = repository.save(entity);
                ResultProductDTO result = mapper.toDTO(created);
                completionUtils.enrich(result, lng);
                return new ResultDTO(result);
            }

            // UPDATE
            Product existing = validation.requireProduct(dto.getId(), lng);

            Optional<Product> conflict = repository.findFirstByTitleAndCompanyIdAndActive(dto.getTitle(), dto.getIdCompany(), true);
            if (conflict.isPresent() && !conflict.get().getId().equals(dto.getId())) {
                return new ResultDTO(false, m(Message.Msj.thisNameExists.toString(), lng), 101);
            }

            Product updated = repository.save(mapper.toEntity(dto));
            ResultProductDTO result = mapper.toDTO(updated);
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
            Product entity = validation.requireProduct(id, lng);
            ResultProductDTO result = mapper.toDTO(entity);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

    @Override
    public ResultDTO getAllItems(ProductFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            PageRequest pageable = PageRequest.of(page, size);
            Page<Product> pageResult = repository.findAllWithCriteria(filterDTO, pageable);

            if (pageResult == null || pageResult.isEmpty()) {
                PageDTO<ResultProductDTO> empty = new PageDTO<>(page, size, 0, Collections.emptyList());
                return new ResultDTO(empty);
            }

            List<ResultProductDTO> dtos = pageResult.getContent().stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.toList());

            completionUtils.enrichList(dtos, lng);

            PageDTO<ResultProductDTO> result = new PageDTO<>(
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalPages(),
                dtos
            );
            return new ResultDTO(result);

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }
}
