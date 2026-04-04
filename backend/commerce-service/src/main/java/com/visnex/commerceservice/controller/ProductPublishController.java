package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.ProductPublishDTO;
import com.visnex.commerceservice.dto.input.ProductPublishFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.ProductPublishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Product Publish Management", description = "Controller for managing product publishing to channels.")
@RestController
@RequestMapping("/v2/product-publish")
public class ProductPublishController {

    private final ProductPublishService productPublishService;

    public ProductPublishController(ProductPublishService productPublishService) {
        this.productPublishService = productPublishService;
    }

    @Operation(summary = "Save or update a product publish record.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody ProductPublishDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return productPublishService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a product publish record by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return productPublishService.getById(id, language);
    }

    @Operation(summary = "Get all product publish records based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody ProductPublishFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return productPublishService.getAllItems(filterDTO, language);
    }
}
