package com.visnex.administrationservice.controller;


import com.visnex.administrationservice.dto.input.PagesDTO;
import com.visnex.administrationservice.dto.input.PagesFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.PagesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Pages Management", description = "Controller for managing pages.")
@RestController
@RequestMapping("/v2/pages")
public class PagesController {

    private final PagesService pagesService;

    public PagesController(PagesService pagesService) { this.pagesService = pagesService; }

    @Operation(summary = "Get all pages based on filter criteria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all pages.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "No pages found matching the criteria.", content = @Content)
    })
    @PostMapping("/all")
    public ResultDTO getAllPages(@RequestBody PagesFilterDTO filter,
                                 @RequestHeader(name = "lng") String language) throws Exception {
        return pagesService.getAllItems(filter, language);
    }

    @Operation(summary = "Save or update a page.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated the page.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Required field missing or page not found.", content = @Content)
    })
    @PostMapping("/save")
    public ResultDTO savePage(@RequestBody PagesDTO dto,
                              @RequestHeader(name = "lng") String language) throws Exception {
        return pagesService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a page by ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the page.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Page with this ID does not exist.", content = @Content)
    })
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getPageById(@PathVariable long id,
                                 @RequestHeader(name = "lng") String language) throws Exception {
        return pagesService.getById(id, language);
    }
}