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
import com.visnex.commerceservice.dto.input.PricingConfigDTO;
import com.visnex.commerceservice.dto.input.PricingConfigFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.dto.output.ResultPricingConfigDTO;
import com.visnex.commerceservice.entity.PricingConfig;
import com.visnex.commerceservice.enums.Message;
import com.visnex.commerceservice.exception.ValidationException;
import com.visnex.commerceservice.mapper.PricingConfigMapper;
import com.visnex.commerceservice.repository.PricingConfigRepository;
import com.visnex.commerceservice.security.ConnectInternalApi;
import com.visnex.commerceservice.service.PricingConfigService;
import com.visnex.commerceservice.util.CompletionUtils;
import com.visnex.commerceservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PricingConfigServiceImpl implements PricingConfigService {

    private final PricingConfigRepository repository;
    private final PricingConfigMapper mapper;
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
    public ResultDTO saveAndUpdate(PricingConfigDTO dto, String language) {
        final String lng = lang(language);
        try {
            if (dto == null) return new ResultDTO(false, m(Message.Msj.bodyRequired.toString(), lng), 103);
            if (dto.getIdCompany() == null) return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " idCompany", 103);

            if (dto.getId() == null) {
                PricingConfig entity = mapper.toEntity(dto);
                if (entity.getActive() == null) entity.setActive(true);
                if (entity.getCustomsRate() == null) entity.setCustomsRate(new BigDecimal("7.5"));
                if (entity.getIvaRate() == null) entity.setIvaRate(new BigDecimal("19"));
                if (entity.getIvaThresholdUsd() == null) entity.setIvaThresholdUsd(new BigDecimal("50"));
                if (entity.getGatewayFeePercent() == null) entity.setGatewayFeePercent(new BigDecimal("3.5"));
                if (entity.getPackagingCost() == null) entity.setPackagingCost(BigDecimal.ZERO);
                if (entity.getDefaultMargin() == null) entity.setDefaultMargin(new BigDecimal("40"));
                PricingConfig created = repository.save(entity);
                ResultPricingConfigDTO result = mapper.toDTO(created);
                completionUtils.enrich(result, lng);
                return new ResultDTO(result);
            }

            validation.requirePricingConfig(dto.getId(), lng);
            PricingConfig updated = repository.save(mapper.toEntity(dto));
            ResultPricingConfigDTO result = mapper.toDTO(updated);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }

    @Override
    public ResultDTO getById(Long id, String language) {
        final String lng = lang(language);
        try {
            PricingConfig entity = validation.requirePricingConfig(id, lng);
            ResultPricingConfigDTO result = mapper.toDTO(entity);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }

    @Override
    public ResultDTO getAllItems(PricingConfigFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            Page<PricingConfig> pageResult = repository.findAllWithCriteria(filterDTO, PageRequest.of(page, size));
            if (pageResult == null || pageResult.isEmpty()) return new ResultDTO(new PageDTO<>(page, size, 0, Collections.emptyList()));

            List<ResultPricingConfigDTO> dtos = pageResult.getContent().stream().map(mapper::toDTO).collect(Collectors.toList());
            completionUtils.enrichList(dtos, lng);
            return new ResultDTO(new PageDTO<>(pageResult.getNumber(), pageResult.getSize(), pageResult.getTotalPages(), dtos));
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }
}
