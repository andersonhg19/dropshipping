package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.PricingConfigDTO;
import com.visnex.commerceservice.dto.input.PricingConfigFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.PricingConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Pricing Config Management", description = "Controller for managing pricing configurations.")
@RestController
@RequestMapping("/v2/pricing-config")
public class PricingConfigController {

    private final PricingConfigService pricingConfigService;

    public PricingConfigController(PricingConfigService pricingConfigService) {
        this.pricingConfigService = pricingConfigService;
    }

    @Operation(summary = "Save or update a pricing config.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody PricingConfigDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return pricingConfigService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a pricing config by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return pricingConfigService.getById(id, language);
    }

    @Operation(summary = "Get all pricing configs based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody PricingConfigFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return pricingConfigService.getAllItems(filterDTO, language);
    }
}
