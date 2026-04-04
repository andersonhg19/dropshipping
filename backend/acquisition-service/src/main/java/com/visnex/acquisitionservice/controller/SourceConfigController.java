package com.visnex.acquisitionservice.controller;

import com.visnex.acquisitionservice.dto.input.SourceConfigDTO;
import com.visnex.acquisitionservice.dto.input.SourceConfigFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.service.SourceConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Source Config Management", description = "Controller for managing source configurations.")
@RestController
@RequestMapping("/v2/source-config")
public class SourceConfigController {

    private final SourceConfigService sourceConfigService;

    public SourceConfigController(SourceConfigService sourceConfigService) {
        this.sourceConfigService = sourceConfigService;
    }

    @Operation(summary = "Save or update a source configuration.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody SourceConfigDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return sourceConfigService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a source configuration by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return sourceConfigService.getById(id, language);
    }

    @Operation(summary = "Get all source configurations based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody SourceConfigFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return sourceConfigService.getAllItems(filterDTO, language);
    }
}
