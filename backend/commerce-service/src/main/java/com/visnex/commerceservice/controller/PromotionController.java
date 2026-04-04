package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.PromotionDTO;
import com.visnex.commerceservice.dto.input.PromotionFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Promotion Management", description = "Controller for managing promotions.")
@RestController
@RequestMapping("/v2/promotion")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @Operation(summary = "Save or update a promotion.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody PromotionDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return promotionService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a promotion by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return promotionService.getById(id, language);
    }

    @Operation(summary = "Get all promotions based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody PromotionFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return promotionService.getAllItems(filterDTO, language);
    }
}
