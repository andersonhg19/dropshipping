package com.visnex.acquisitionservice.controller;

import com.visnex.acquisitionservice.dto.input.ImportJobDTO;
import com.visnex.acquisitionservice.dto.input.ImportJobFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.service.ImportJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Import Job Management", description = "Controller for managing import jobs.")
@RestController
@RequestMapping("/v2/import-job")
public class ImportJobController {

    private final ImportJobService importJobService;

    public ImportJobController(ImportJobService importJobService) {
        this.importJobService = importJobService;
    }

    @Operation(summary = "Save or update an import job.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@Valid @RequestBody ImportJobDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return importJobService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get an import job by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return importJobService.getById(id, language);
    }

    @Operation(summary = "Get all import jobs based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody ImportJobFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return importJobService.getAllItems(filterDTO, language);
    }
}
