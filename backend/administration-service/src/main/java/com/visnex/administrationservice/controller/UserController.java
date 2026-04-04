package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.*;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User Management", description = "Controller for managing users.")
@RestController
@RequestMapping("/v2/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get all users based on filter criteria.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved users.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "102", description = "No users found matching the criteria.",
                    content = @Content),
            @ApiResponse(responseCode = "103", description = "Process error occurred.",
                    content = @Content)
    })
    @PostMapping(value = "/all")
    public ResultDTO getUsers(@RequestBody UserFilterDTO userFilterDTO,
                              @RequestHeader(name = "lng") String language) throws Exception {
        return userService.getAllItems(userFilterDTO,language);
    }


    @Operation(summary = "User login.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully logged in.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "100", description = "User not found.",
                    content = @Content),
            @ApiResponse(responseCode = "101", description = "Incorrect password.",
                    content = @Content),
            @ApiResponse(responseCode = "103", description = "Process error occurred.",
                    content = @Content)
    })
    @PostMapping(value = "/login")
    public ResultDTO login(@RequestBody LoginDTO loginDTO,
                           @RequestHeader(name = "lng") String language) throws Exception {
        return userService.login(loginDTO, language);
    }

    @Operation(summary = "Save or update user details.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated the user.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "102", description = "User already exists or mandatory field missing.",
                    content = @Content),
            @ApiResponse(responseCode = "103", description = "Process error occurred.",
                    content = @Content)
    })
    @PostMapping(value = "/save")
    public ResultDTO save(@RequestBody UserDTO userDTO,
                          @RequestHeader(name = "lng") String language) throws Exception {
        return userService.saveAndUpdate(userDTO, language);
    }

    @Operation(summary = "Get specific user by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the user.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "102", description = "User not found.",
                    content = @Content),
            @ApiResponse(responseCode = "103", description = "Process error occurred.",
                    content = @Content)
    })
    @PostMapping(value = "/get/{id}", produces = "application/json")
    public ResultDTO getOneByIdUser(@PathVariable long id,
                                    @RequestHeader(name = "lng") String language) throws Exception {
        return userService.getById(id, language);
    }
}
