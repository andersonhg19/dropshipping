package com.visnex.acquisitionservice.controller;

import com.visnex.acquisitionservice.dto.input.SourceProductDTO;
import com.visnex.acquisitionservice.dto.input.SourceProductFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.service.SourceProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Source Product Management", description = "Controller for managing source products.")
@RestController
@RequestMapping("/v2/source-product")
public class SourceProductController {

    private final SourceProductService sourceProductService;

    public SourceProductController(SourceProductService sourceProductService) {
        this.sourceProductService = sourceProductService;
    }

    @Operation(summary = "Save or update a source product.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody SourceProductDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return sourceProductService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a source product by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return sourceProductService.getById(id, language);
    }

    @Operation(summary = "Get all source products based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody SourceProductFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return sourceProductService.getAllItems(filterDTO, language);
    }
}
