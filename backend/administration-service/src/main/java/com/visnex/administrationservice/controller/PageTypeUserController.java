package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.PageTypeUserByTypeFilterDTO;
import com.visnex.administrationservice.dto.input.PageTypeUserFilterDTO;
import com.visnex.administrationservice.dto.input.PageTypeUserSaveDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.PageTypeUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "PageTypeUser Management", description = "Controller for managing PageTypeUser relationships.")
@RestController
@RequestMapping("/v2/page-type-user")
public class PageTypeUserController {

    private final PageTypeUserService pageTypeUserService;

    public PageTypeUserController(PageTypeUserService pageTypeUserService) {
        this.pageTypeUserService = pageTypeUserService;
    }

    @Operation(summary = "Get all PageTypeUser entries based on filter criteria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all PageTypeUser entries.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "No entries found matching the criteria.", content = @Content)
    })
    @PostMapping("/all")
    public ResultDTO getAll(@RequestBody PageTypeUserFilterDTO filter,
                            @RequestHeader(name = "lng") String language) throws Exception {
        return pageTypeUserService.getAllItems(filter, language);
    }

    @Operation(summary = "Create or update PageTypeUser entries for a TypeUser.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated entries.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "120", description = "Missing required fields.", content = @Content)
    })
    @PostMapping("/save")
    public ResultDTO save(@RequestBody PageTypeUserSaveDTO dto,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return pageTypeUserService.saveAndUpdate(dto, language);
    }

    @Operation(summary = "Get a PageTypeUser by ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the entry.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "102", description = "Entry with this ID does not exist.", content = @Content)
    })
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getById(@PathVariable long id,
                             @RequestHeader(name = "lng") String language) throws Exception {
        return pageTypeUserService.getById(id, language);
    }

    @Operation(summary = "Get pages assigned to the logged TypeUser (by userId).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved pages by TypeUser.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.", content = @Content),
            @ApiResponse(responseCode = "120", description = "User not found or pages not found.", content = @Content)
    })
    @PostMapping("/by-type-user")
    public ResultDTO getByTypeUser(@RequestBody PageTypeUserByTypeFilterDTO filter,
                                   @RequestHeader(name = "lng") String language) throws Exception {
        return pageTypeUserService.getByIdTypeUser(filter, language);
    }
}