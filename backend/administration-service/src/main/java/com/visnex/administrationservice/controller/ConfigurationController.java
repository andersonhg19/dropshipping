package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.ConfigurationFilterDTO;
import com.visnex.administrationservice.dto.input.ConfigurationUpsertListDTO;
import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.output.ResultConfigurationDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.ConfigurationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Configuration Management", description = "Controller for managing configurations.")
@RestController
@RequestMapping("/v2/filial-configurations")
public class ConfigurationController {

    private final ConfigurationService service;

    public ConfigurationController(ConfigurationService service) { this.service = service; }

    @Operation(summary = "Get all configurations based on filter criteria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all configurations.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "No configurations found matching the criteria.", content = @Content)
    })
    @PostMapping("/all")
    public ResultDTO getAll(@RequestBody ConfigurationFilterDTO filter,
                            @RequestHeader(name = "lng") String language) {
        PageDTO<ResultConfigurationDTO> page = service.search(filter);
        return new ResultDTO(page);
    }

    @Operation(summary = "Save or update a configuration.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated the configuration.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Required field missing or configuration not found.", content = @Content)
    })
    @PostMapping("/save")
    public ResultDTO save(@RequestBody ConfigurationUpsertListDTO dto,
                          @RequestHeader(name = "lng") String language) {
        var res = service.saveAndUpdate(dto); // devuelve ResultConfigurationUpsertListDTO
        return new ResultDTO(res);
    }

    @Operation(summary = "Get a configuration by ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the configuration.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Configuration with this ID does not exist.", content = @Content)
    })
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable Long id,
                             @RequestHeader(name = "lng") String language) {
        ResultConfigurationDTO res = service.getById(id);
        return new ResultDTO(res);
    }

    @Operation(summary = "Activate/Deactivate configuration.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated successfully.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content)
    })
    @PostMapping("/active/{id}")
    public ResultDTO setActive(@PathVariable Long id,
                               @RequestParam boolean active,
                               @RequestHeader(name = "lng") String language) {
        service.setActive(id, active);
        return new ResultDTO(true, "Estado actualizado", 0);
    }

    @Operation(summary = "Lookup by (company, [subsidiary], name).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved configuration by lookup.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content)
    })
    @PostMapping("/lookup")
    public ResultDTO lookup(@RequestParam Long idCompany,
                            @RequestParam(required = false) Long idSubsidiary,
                            @RequestParam String name,
                            @RequestHeader(name = "lng") String language) {
        ResultConfigurationDTO res = service.lookup(idCompany, idSubsidiary, name);
        return new ResultDTO(res);
    }
}
