package com.visnex.acquisitionservice.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.service.FileImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/v2/file-import")
@RequiredArgsConstructor
@Tag(name = "File Import", description = "Import products from CSV/Excel/JSON")
public class FileImportController {

    private final FileImportService fileImportService;
    private final ObjectMapper objectMapper;

    @PostMapping("/upload")
    @Operation(summary = "Upload file and detect columns")
    public ResultDTO upload(@RequestParam("file") MultipartFile file, @RequestHeader(name = "lng", defaultValue = "es") String language) {
        if (file.isEmpty()) return new ResultDTO(false, "File is empty", 102);
        return fileImportService.uploadAndParse(file);
    }

    @PostMapping("/preview")
    @Operation(summary = "Preview with field mapping")
    public ResultDTO preview(@RequestParam("file") MultipartFile file, @RequestParam("fieldMapping") String fieldMappingJson, @RequestHeader(name = "lng", defaultValue = "es") String language) {
        try {
            Map<String, String> mapping = objectMapper.readValue(fieldMappingJson, new TypeReference<>() {});
            return fileImportService.preview(file, mapping);
        } catch (Exception e) { return new ResultDTO(false, "Invalid fieldMapping: " + e.getMessage(), 103); }
    }

    @PostMapping("/execute")
    @Operation(summary = "Execute full import")
    public ResultDTO execute(@RequestParam("file") MultipartFile file, @RequestParam("fieldMapping") String fieldMappingJson, @RequestParam("idCompany") Long idCompany, @RequestParam(value = "idSubsidiary", required = false) Long idSubsidiary, @RequestParam(value = "idModifiedBy", required = false) Long idModifiedBy, @RequestParam(value = "idSupplier", required = false) Long idSupplier, @RequestHeader(name = "lng", defaultValue = "es") String language) {
        try {
            Map<String, String> mapping = objectMapper.readValue(fieldMappingJson, new TypeReference<>() {});
            return fileImportService.executeImport(file, mapping, idCompany, idSubsidiary, idModifiedBy, idSupplier);
        } catch (Exception e) { return new ResultDTO(false, "Import error: " + e.getMessage(), 103); }
    }
}
