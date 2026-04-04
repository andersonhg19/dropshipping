package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.input.SubsidiaryDTO;
import com.visnex.administrationservice.dto.input.SubsidiaryFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.dto.output.ResultSubsidiaryDTO;
import com.visnex.administrationservice.service.SubsidiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Subsidiary Management", description = "Controller for managing subsidiaries.")
@RestController
@RequestMapping("/v2/subsidiary")
public class SubsidiaryController {

    private final SubsidiaryService service;

    public SubsidiaryController(SubsidiaryService service) { this.service = service; }

    @Operation(summary = "Get all subsidiaries based on filter criteria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all subsidiaries.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "No subsidiaries found matching the criteria.", content = @Content)
    })
    @PostMapping("/all")
    public ResultDTO getAll(@RequestBody SubsidiaryFilterDTO filter,
                            @RequestHeader(name = "lng", required = false) String language) {
        PageDTO<ResultSubsidiaryDTO> page = service.getAllItems(filter);
        return new ResultDTO(page);
    }

    @Operation(summary = "Save or update a subsidiary.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated the subsidiary.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Required field missing or subsidiary not found.", content = @Content)
    })
    @PostMapping("/save")
    public ResultDTO save(@RequestBody SubsidiaryDTO dto,
                          @RequestHeader(name = "lng", required = false) String language) {
        ResultSubsidiaryDTO res = service.saveAndUpdate(dto);
        return new ResultDTO(res);
    }

    @Operation(summary = "Get a subsidiary by ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the subsidiary.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Subsidiary with this ID does not exist.", content = @Content)
    })
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable Long id,
                             @RequestHeader(name = "lng", required = false) String language) {
        ResultSubsidiaryDTO res = service.getById(id);
        return new ResultDTO(res);
    }

    @Operation(summary = "Activate/Deactivate subsidiary.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated successfully.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content)
    })
    @PostMapping("/active/{id}")
    public ResultDTO setActive(@PathVariable Long id,
                               @RequestParam boolean active,
                               @RequestHeader(name = "lng", required = false) String language) {
        service.setActive(id, active);
        return new ResultDTO(true, "Estado actualizado", 0);
    }

}
