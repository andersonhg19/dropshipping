package com.visnex.administrationservice.controller;

import com.visnex.administrationservice.dto.input.CompanyDTO;
import com.visnex.administrationservice.dto.input.CompanyFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.service.CompanyService;
import com.visnex.administrationservice.service.UtilsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jdk.jshell.execution.Util;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Utils Management", description = "Controller for managing ustils.")
@RestController
@RequestMapping("/v2/utils")
public class UtilsController {

    private final UtilsService service;


    public UtilsController(UtilsService service) {
        this.service = service;
    }


    @PostMapping(value = "/type-documents", produces = "application/json")
    public ResultDTO dteOptionLis(@RequestHeader(name = "lng") String language) throws Exception {
        return service.typeDocument( language);
    }
}
