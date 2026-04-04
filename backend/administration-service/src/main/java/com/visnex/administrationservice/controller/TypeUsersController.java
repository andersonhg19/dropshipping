package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.TypeUserDTO;
import com.visnex.administrationservice.dto.input.TypeUserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.TypeUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Type User Management", description = "Controller for managing type users.")
@RestController
@RequestMapping("/v2/type-user")
public class TypeUsersController  {

    private final TypeUserService typeUserService;

    public TypeUsersController(TypeUserService typeUserService) {
        this.typeUserService = typeUserService;
    }

    @Operation(summary = "Get all type users based on filter criteria.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved type users.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.",
                    content = @Content),
            @ApiResponse(responseCode = "102", description = "No type users found matching the criteria.",
                    content = @Content),
            @ApiResponse(responseCode = "103", description = "Process error occurred.",
                    content = @Content)
    })
    @PostMapping(value="/all")
    public ResultDTO getAllTypeUsers(@RequestBody TypeUserFilterDTO typeUserFilterDTO,
                                     @RequestHeader(name = "lng") String language) throws Exception {
        return typeUserService.getAllItems(typeUserFilterDTO,language);
    }

    @Operation(summary = "Save or update type user details.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated the type user.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.",
                    content = @Content),
            @ApiResponse(responseCode = "120", description = "Required fields are missing or invalid.",
                    content = @Content),
            @ApiResponse(responseCode = "102", description = "Entity not found.",
                    content = @Content),
            @ApiResponse(responseCode = "103", description = "Process error occurred.",
                    content = @Content)
    })
    @PostMapping(value = "/save")
    public ResultDTO saveTypeUser(@RequestBody TypeUserDTO typeUserDTO,
                                  @RequestHeader(name = "lng") String language) throws Exception {
        return typeUserService.saveAndUpdate(typeUserDTO, language);
    }

    @Operation(summary = "Get specific type user by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the type user.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.",
                    content = @Content),
            @ApiResponse(responseCode = "102", description = "Type user not found.",
                    content = @Content),
            @ApiResponse(responseCode = "103", description = "Process error occurred.",
                    content = @Content)
    })
    @PostMapping(value="/get/{id}", produces = "application/json")
    public ResultDTO getOneTypeUserById(@PathVariable long id,
                                        @RequestHeader(name = "lng") String language) throws Exception {
        return typeUserService.getById(id, language);
    }
}
