package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.ProductImageDTO;
import com.visnex.commerceservice.dto.input.ProductImageFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.ProductImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Product Image Management", description = "Controller for managing product images.")
@RestController
@RequestMapping("/v2/product-image")
public class ProductImageController {

    private final ProductImageService productImageService;

    public ProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    @Operation(summary = "Save or update a product image.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody ProductImageDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return productImageService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a product image by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return productImageService.getById(id, language);
    }

    @Operation(summary = "Get all product images based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody ProductImageFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return productImageService.getAllItems(filterDTO, language);
    }
}
