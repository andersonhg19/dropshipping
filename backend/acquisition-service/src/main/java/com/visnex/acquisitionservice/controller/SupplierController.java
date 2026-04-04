package com.visnex.acquisitionservice.controller;

import com.visnex.acquisitionservice.dto.input.SupplierDTO;
import com.visnex.acquisitionservice.dto.input.SupplierFilterDTO;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Supplier Management", description = "Controller for managing suppliers.")
@RestController
@RequestMapping("/v2/supplier")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @Operation(summary = "Save or update a supplier.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody SupplierDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return supplierService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a supplier by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return supplierService.getById(id, language);
    }

    @Operation(summary = "Get all suppliers based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody SupplierFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return supplierService.getAllItems(filterDTO, language);
    }
}
