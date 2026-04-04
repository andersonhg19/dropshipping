package com.visnex.commerceservice.service.implementation;

import java.net.URISyntaxException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.commerceservice.dto.input.PageDTO;
import com.visnex.commerceservice.dto.input.ProductImageDTO;
import com.visnex.commerceservice.dto.input.ProductImageFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.dto.output.ResultProductImageDTO;
import com.visnex.commerceservice.entity.ProductImage;
import com.visnex.commerceservice.enums.Message;
import com.visnex.commerceservice.exception.ValidationException;
import com.visnex.commerceservice.mapper.ProductImageMapper;
import com.visnex.commerceservice.repository.ProductImageRepository;
import com.visnex.commerceservice.security.ConnectInternalApi;
import com.visnex.commerceservice.service.ProductImageService;
import com.visnex.commerceservice.util.CompletionUtils;
import com.visnex.commerceservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository repository;
    private final ProductImageMapper mapper;
    private final ValidationUtils validation;
    private final ConnectInternalApi connectInternalApi;
    private final CompletionUtils completionUtils;

    private static final String DEFAULT_LANG = "es";
    private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

    private String m(String key, String lng) {
        try { return connectInternalApi.chargeMessage(key, lng); }
        catch (URISyntaxException | JsonProcessingException e) { return key; }
    }

    @Override
    public ResultDTO saveAndUpdate(ProductImageDTO dto, String language) {
        final String lng = lang(language);
        try {
            if (dto == null) return new ResultDTO(false, m(Message.Msj.bodyRequired.toString(), lng), 103);
            if (dto.getIdCompany() == null) return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " idCompany", 103);
            if (dto.getIdProduct() == null) return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " idProduct", 103);
            if (dto.getUrl() == null || dto.getUrl().isBlank()) return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " url", 103);

            if (dto.getId() == null) {
                ProductImage entity = mapper.toEntity(dto);
                if (entity.getActive() == null) entity.setActive(true);
                if (entity.getIsPrimary() == null) entity.setIsPrimary(false);
                if (entity.getSortOrder() == null) entity.setSortOrder(0);
                ProductImage created = repository.save(entity);
                ResultProductImageDTO result = mapper.toDTO(created);
                completionUtils.enrich(result, lng);
                return new ResultDTO(result);
            }

            validation.requireProductImage(dto.getId(), lng);
            ProductImage updated = repository.save(mapper.toEntity(dto));
            ResultProductImageDTO result = mapper.toDTO(updated);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }

    @Override
    public ResultDTO getById(Long id, String language) {
        final String lng = lang(language);
        try {
            ProductImage entity = validation.requireProductImage(id, lng);
            ResultProductImageDTO result = mapper.toDTO(entity);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }

    @Override
    public ResultDTO getAllItems(ProductImageFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            Page<ProductImage> pageResult = repository.findAllWithCriteria(filterDTO, PageRequest.of(page, size));
            if (pageResult == null || pageResult.isEmpty()) return new ResultDTO(new PageDTO<>(page, size, 0, Collections.emptyList()));

            List<ResultProductImageDTO> dtos = pageResult.getContent().stream().map(mapper::toDTO).collect(Collectors.toList());
            completionUtils.enrichList(dtos, lng);
            return new ResultDTO(new PageDTO<>(pageResult.getNumber(), pageResult.getSize(), pageResult.getTotalPages(), dtos));
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }
}
