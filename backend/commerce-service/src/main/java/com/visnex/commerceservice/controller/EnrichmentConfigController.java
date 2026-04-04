package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.EnrichmentConfigDTO;
import com.visnex.commerceservice.dto.input.EnrichmentConfigFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.EnrichmentConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Enrichment Config Management", description = "Controller for managing AI enrichment configurations.")
@RestController
@RequestMapping("/v2/enrichment-config")
public class EnrichmentConfigController {

    private final EnrichmentConfigService enrichmentConfigService;

    public EnrichmentConfigController(EnrichmentConfigService enrichmentConfigService) {
        this.enrichmentConfigService = enrichmentConfigService;
    }

    @Operation(summary = "Save or update an enrichment config.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody EnrichmentConfigDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return enrichmentConfigService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get an enrichment config by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return enrichmentConfigService.getById(id, language);
    }

    @Operation(summary = "Get all enrichment configs based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody EnrichmentConfigFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return enrichmentConfigService.getAllItems(filterDTO, language);
    }
}
