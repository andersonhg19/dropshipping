package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.dto.input.PublishChannelDTO;
import com.visnex.commerceservice.dto.input.PublishChannelFilterDTO;
import com.visnex.commerceservice.dto.output.ResultDTO;
import com.visnex.commerceservice.service.PublishChannelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Publish Channel Management", description = "Controller for managing publish channels.")
@RestController
@RequestMapping("/v2/publish-channel")
public class PublishChannelController {

    private final PublishChannelService publishChannelService;

    public PublishChannelController(PublishChannelService publishChannelService) {
        this.publishChannelService = publishChannelService;
    }

    @Operation(summary = "Save or update a publish channel.")
    @PostMapping(value = "/save", produces = "application/json")
    public ResultDTO save(@RequestBody PublishChannelDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return publishChannelService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a publish channel by ID.")
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return publishChannelService.getById(id, language);
    }

    @Operation(summary = "Get all publish channels based on filter criteria.")
    @PostMapping(value = "/all", produces = "application/json")
    public ResultDTO getAll(@RequestBody PublishChannelFilterDTO filterDTO,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return publishChannelService.getAllItems(filterDTO, language);
    }
}
