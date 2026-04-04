package com.visnex.acquisitionservice.service.implementation;

import java.net.URISyntaxException;
import java.util.Collections;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.acquisitionservice.dto.input.PageDTO;
import com.visnex.acquisitionservice.dto.input.SupplierDTO;
import com.visnex.acquisitionservice.dto.input.SupplierFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.dto.output.ResultSupplierDTO;
import com.visnex.acquisitionservice.entity.Supplier;
import com.visnex.acquisitionservice.enums.Message;
import com.visnex.acquisitionservice.exception.ValidationException;
import com.visnex.acquisitionservice.mapper.SupplierMapper;
import com.visnex.acquisitionservice.repository.CustomSupplierRepository;
import com.visnex.acquisitionservice.repository.SupplierRepository;
import com.visnex.acquisitionservice.security.ConnectInternalApi;
import com.visnex.acquisitionservice.service.SupplierService;
import com.visnex.acquisitionservice.util.CompletionUtils;
import com.visnex.acquisitionservice.util.ValidationUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository repository;
    private final CustomSupplierRepository customRepository;
    private final SupplierMapper mapper;
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
    public ResultDTO saveAndUpdate(SupplierDTO dto, String language) {
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
                Optional<Supplier> existingByName = repository.findFirstByNameAndCompanyIdAndActive(dto.getName(), dto.getIdCompany(), true);
                if (existingByName.isPresent()) {
                    return new ResultDTO(false, m(Message.Msj.thisNameExists.toString(), lng), 101);
                }
                Supplier entity = mapper.toEntity(dto);
                if (entity.getActive() == null) entity.setActive(true);
                Supplier created = repository.save(entity);
                ResultSupplierDTO result = mapper.toDTO(created);
                completionUtils.enrich(result, lng);
                return new ResultDTO(result);
            }

            // UPDATE
            Supplier existing = validation.requireSupplier(dto.getId(), lng);

            Optional<Supplier> conflict = repository.findFirstByNameAndCompanyIdAndActive(dto.getName(), dto.getIdCompany(), true);
            if (conflict.isPresent() && !conflict.get().getId().equals(dto.getId())) {
                return new ResultDTO(false, m(Message.Msj.thisNameExists.toString(), lng), 101);
            }

            Supplier updated = repository.save(mapper.toEntity(dto));
            ResultSupplierDTO result = mapper.toDTO(updated);
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
            Supplier entity = validation.requireSupplier(id, lng);
            ResultSupplierDTO result = mapper.toDTO(entity);
            completionUtils.enrich(result, lng);
            return new ResultDTO(result);
        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

    @Override
    public ResultDTO getAllItems(SupplierFilterDTO filterDTO, String language) {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            PageRequest pageable = PageRequest.of(page, size);
            Page<ResultSupplierDTO> pageResult = customRepository.findAllWithCriteria(filterDTO, pageable);

            if (pageResult == null || pageResult.isEmpty()) {
                PageDTO<ResultSupplierDTO> empty = new PageDTO<>(page, size, 0, Collections.emptyList());
                return new ResultDTO(empty);
            }

            completionUtils.enrichList(pageResult.getContent(), lng);

            PageDTO<ResultSupplierDTO> result = new PageDTO<>(
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
