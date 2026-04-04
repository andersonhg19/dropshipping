package com.visnex.acquisitionservice.controller;

import com.visnex.acquisitionservice.dto.input.ImportTemplateDTO;
import com.visnex.acquisitionservice.dto.input.ImportTemplateFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.service.ImportTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Import Template Management", description = "Controller for managing import templates.")
@RestController
@RequestMapping("/v2/import-template")
public class ImportTemplateController {

    private final ImportTemplateService importTemplateService;

    public ImportTemplateController(ImportTemplateService importTemplateService) {
        this.importTemplateService = importTemplateService;
    }

    @Operation(summary = "Save or update an import template.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody ImportTemplateDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return importTemplateService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get an import template by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return importTemplateService.getById(id, language);
    }

    @Operation(summary = "Get all import templates based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody ImportTemplateFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return importTemplateService.getAllItems(filterDTO, language);
    }
}
