package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.ProductDTO;
import com.visnex.commerceservice.dto.input.ProductFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Product Management", description = "Controller for managing products.")
@RestController
@RequestMapping("/v2/product")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @Operation(summary = "Save or update a product.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody ProductDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return productService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a product by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return productService.getById(id, language);
    }

    @Operation(summary = "Get all products based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody ProductFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return productService.getAllItems(filterDTO, language);
    }
}
