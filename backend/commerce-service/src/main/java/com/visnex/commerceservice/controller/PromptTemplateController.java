package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.PromptTemplateDTO;
import com.visnex.commerceservice.dto.input.PromptTemplateFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.PromptTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Prompt Template Management", description = "Controller for managing AI prompt templates.")
@RestController
@RequestMapping("/v2/prompt-template")
public class PromptTemplateController {

    private final PromptTemplateService promptTemplateService;

    public PromptTemplateController(PromptTemplateService promptTemplateService) {
        this.promptTemplateService = promptTemplateService;
    }

    @Operation(summary = "Save or update a prompt template.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@Valid @RequestBody PromptTemplateDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return promptTemplateService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a prompt template by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return promptTemplateService.getById(id, language);
    }

    @Operation(summary = "Get all prompt templates based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody PromptTemplateFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return promptTemplateService.getAllItems(filterDTO, language);
    }
}
