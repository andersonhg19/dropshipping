package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.CategoryDTO;
import com.visnex.commerceservice.dto.input.CategoryFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Category Management", description = "Controller for managing categories.")
@RestController
@RequestMapping("/v2/category")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(summary = "Save or update a category.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody CategoryDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return categoryService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a category by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return categoryService.getById(id, language);
    }

    @Operation(summary = "Get all categories based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody CategoryFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return categoryService.getAllItems(filterDTO, language);
    }
}
