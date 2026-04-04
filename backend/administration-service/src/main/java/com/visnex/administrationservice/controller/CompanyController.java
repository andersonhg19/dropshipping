package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.CompanyDTO;
import com.visnex.administrationservice.dto.input.CompanyFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Company Management", description = "Controller for managing companies.")
@RestController
@RequestMapping("/v2/company")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @Operation(summary = "Get all companies based on filter criteria.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved all companies.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.",
                    content = @Content),
            @ApiResponse(responseCode = "102", description = "No companies found matching the criteria.",
                    content = @Content)
    })
    @PostMapping(value="/all")
    public ResultDTO getAllCompanies(@RequestBody CompanyFilterDTO companyFilterDTO,
                                     @RequestHeader(name = "lng") String language) throws Exception {
        return companyService.getAllItems(companyFilterDTO, language);
    }

    @Operation(summary = "Save or update a company.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully saved or updated the company.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.",
                    content = @Content),
            @ApiResponse(responseCode = "102", description = "Field is required: name or nit.",
                    content = @Content),
            @ApiResponse(responseCode = "120", description = "Company with this NIT already exists.",
                    content = @Content),
            @ApiResponse(responseCode = "102", description = "Company with this ID does not exist.",
                    content = @Content)
    })
    @PostMapping(value = "/save")
    public ResultDTO saveCompany(@RequestBody CompanyDTO companyDTO,
                                 @RequestHeader(name = "lng") String language) throws Exception {
        return companyService.saveAndUpdate(companyDTO, language);
    }

    @Operation(summary = "Get a company by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the company.",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ResultDTO.class))),
            @ApiResponse(responseCode = "403", description = "Invalid headers or body in the request.",
                    content = @Content),
            @ApiResponse(responseCode = "102", description = "Company with this ID does not exist.",
                    content = @Content)
    })
    @PostMapping(value="/get/{id}", produces = "application/json")
    public ResultDTO getOneCompanyById(@PathVariable long id,
                                       @RequestHeader(name = "lng") String language) throws Exception {
        return companyService.getById(id, language);
    }
}
