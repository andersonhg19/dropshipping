package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.ModuleDTO;
import com.visnex.administrationservice.dto.input.ModuleFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.ModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Module Management", description = "Controller for managing modules.")
@RestController
@RequestMapping("/v2/module")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) { this.moduleService = moduleService; }

    @Operation(summary = "Get all modules based on filter criteria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all modules.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "No modules found matching the criteria.", content = @Content)
    })
    @PostMapping("/all")
    public ResultDTO getAllModules(@RequestBody ModuleFilterDTO filter,
                                   @RequestHeader(name = "lng") String language) throws Exception {
        return moduleService.getAllItems(filter, language);
    }

    @Operation(summary = "Save or update a module.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated the module.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Required field missing or module not found.", content = @Content)
    })
    @PostMapping("/save")
    public ResultDTO saveModule(@RequestBody ModuleDTO dto,
                                @RequestHeader(name = "lng") String language) throws Exception {
        return moduleService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a module by ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the module.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Module with this ID does not exist.", content = @Content)
    })
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getModuleById(@PathVariable long id,
                                   @RequestHeader(name = "lng") String language) throws Exception {
        return moduleService.getById(id, language);
    }
}