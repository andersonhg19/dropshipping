package com.visnex.commerceservice.service.implementation;

import java.net.URISyntaxException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.commerceservice.dto.input.PageDTO;
import com.visnex.commerceservice.dto.input.PublishChannelDTO;
import com.visnex.commerceservice.dto.input.PublishChannelFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.dto.output.ResultPublishChannelDTO;
import com.visnex.commerceservice.entity.PublishChannel;
import com.visnex.commerceservice.enums.Message;
import com.visnex.commerceservice.exception.ValidationException;
import com.visnex.commerceservice.mapper.PublishChannelMapper;
import com.visnex.commerceservice.repository.PublishChannelRepository;
import com.visnex.commerceservice.security.ConnectInternalApi;
import com.visnex.commerceservice.service.PublishChannelService;
import com.visnex.commerceservice.util.CompletionUtils;
import com.visnex.commerceservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PublishChannelServiceImpl implements PublishChannelService {

    private final PublishChannelRepository repository;
    private final PublishChannelMapper mapper;
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
    public ResultDTO saveAndUpdate(PublishChannelDTO dto, String language) {
        final String lng = lang(language);
        try {
            if (dto == null) return new ResultDTO(false, m(Message.Msj.bodyRequired.toString(), lng), 103);
            if (dto.getName() != null) dto.setName(dto.getName().trim());
            if (dto.getIdCompany() == null) return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " idCompany", 103);
            if (dto.getName() == null || dto.getName().isBlank()) return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " name", 103);

            if (dto.getId() == null) {
                Optional<PublishChannel> existingByName = repository.findFirstByNameAndCompanyIdAndActive(dto.getName(), dto.getIdCompany(), true);
                if (existingByName.isPresent()) return new ResultDTO(false, m(Message.Msj.thisNameExists.toString(), lng), 101);
                PublishChannel entity = mapper.toEntity(dto);
                if (entity.getActive() == null) entity.setActive(true);
                if (entity.getAutoSync() == null) entity.setAutoSync(false);
                if (entity.getStatus() == null) entity.setStatus("DISCONNECTED");
                PublishChannel created = repository.save(entity);
                ResultPublishChannelDTO result = mapper.toDTO(created);
                completionUtils.enrich(result, lng);
                return new ResultDTO(result);
            }

            validation.requirePublishChannel(dto.getId(), lng);
            Optional<PublishChannel> conflict = repository.findFirstByNameAndCompanyIdAndActive(dto.getName(), dto.getIdCompany(), true);
            if (conflict.isPresent() && !conflict.get().getId().equals(dto.getId())) return new ResultDTO(false, m(Message.Msj.thisNameExists.toString(), lng), 101);

            PublishChannel updated = repository.save(mapper.toEntity(dto));
            ResultPublishChannelDTO result = mapper.toDTO(updated);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }

    @Override
    public ResultDTO getById(Long id, String language) {
        final String lng = lang(language);
        try {
            PublishChannel entity = validation.requirePublishChannel(id, lng);
            ResultPublishChannelDTO result = mapper.toDTO(entity);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }

    @Override
    public ResultDTO getAllItems(PublishChannelFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            Page<PublishChannel> pageResult = repository.findAllWithCriteria(filterDTO, PageRequest.of(page, size));
            if (pageResult == null || pageResult.isEmpty()) return new ResultDTO(new PageDTO<>(page, size, 0, Collections.emptyList()));

            List<ResultPublishChannelDTO> dtos = pageResult.getContent().stream().map(mapper::toDTO).collect(Collectors.toList());
            completionUtils.enrichList(dtos, lng);
            return new ResultDTO(new PageDTO<>(pageResult.getNumber(), pageResult.getSize(), pageResult.getTotalPages(), dtos));
        } catch (ValidationException vex) { return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName()); }
        catch (Exception e) { return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage()); }
    }
}
