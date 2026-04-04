package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.PageDTO;
import com.visnex.administrationservice.dto.input.StyleFilterDTO;
import com.visnex.administrationservice.dto.input.StyleUpsertListDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.dto.output.ResultStyleDTO;
import com.visnex.administrationservice.service.StyleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Style Management", description = "Controller for managing styles.")
@RestController
@RequestMapping("/v2/filial-styles")
public class StyleController {

    private final StyleService service;

    public StyleController(StyleService service) { this.service = service; }

    @Operation(summary = "Get all styles based on filter criteria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all styles.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "No styles found matching the criteria.", content = @Content)
    })
    @PostMapping("/all")
    public ResultDTO getAll(@RequestBody StyleFilterDTO filter,
                            @RequestHeader(name = "lng") String language) {
        PageDTO<ResultStyleDTO> page = service.search(filter);
        return new ResultDTO(page);
    }

    @Operation(summary = "Save or update a style.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated the style.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Required field missing or style not found.", content = @Content)
    })
    @PostMapping("/save")
    public ResultDTO save(@RequestBody StyleUpsertListDTO dto,
                          @RequestHeader(name = "lng") String language) {
        var res = service.saveAndUpdate(dto);
        return new ResultDTO(res);
    }


    @Operation(summary = "Get a style by ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the style.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Style with this ID does not exist.", content = @Content)
    })
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable Long id,
                             @RequestHeader(name = "lng") String language) {
        ResultStyleDTO res = service.getById(id);
        return new ResultDTO(res);
    }

    @Operation(summary = "Activate/Deactivate style.")
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
            @ApiResponse(responseCode = "200", description = "Successfully retrieved style by lookup.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content)
    })
    @PostMapping("/lookup")
    public ResultDTO lookup(@RequestParam Long idCompany,
                            @RequestParam(required = false) Long idSubsidiary,
                            @RequestParam String name,
                            @RequestHeader(name = "lng") String language) {
        ResultStyleDTO res = service.lookup(idCompany, idSubsidiary, name);
        return new ResultDTO(res);
    }
}
