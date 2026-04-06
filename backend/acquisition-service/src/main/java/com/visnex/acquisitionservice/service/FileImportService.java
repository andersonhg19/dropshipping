package com.visnex.acquisitionservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.entity.ImportJob;
import com.visnex.acquisitionservice.entity.SourceProduct;
import com.visnex.acquisitionservice.repository.ImportJobRepository;
import com.visnex.acquisitionservice.repository.SourceProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileImportService {

    private final SourceProductRepository sourceProductRepository;
    private final ImportJobRepository importJobRepository;
    private final ObjectMapper objectMapper;

    public ResultDTO uploadAndParse(MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            String fileType = detectFileType(fileName);
            List<Map<String, String>> rows = parseFile(file.getInputStream(), fileType);

            if (rows.isEmpty()) {
                return new ResultDTO(false, "File is empty or could not be parsed", 102);
            }

            List<String> columns = new ArrayList<>(rows.get(0).keySet());
            List<Map<String, String>> preview = rows.subList(0, Math.min(5, rows.size()));

            return new ResultDTO(Map.of(
                    "columns", columns,
                    "rowCount", rows.size(),
                    "preview", preview,
                    "fileName", fileName != null ? fileName : "unknown",
                    "fileType", fileType
            ));
        } catch (Exception e) {
            log.error("Error parsing file: {}", e.getMessage());
            return new ResultDTO(false, "Error parsing file: " + e.getMessage(), 103);
        }
    }

    public ResultDTO preview(MultipartFile file, Map<String, String> fieldMapping) {
        try {
            String fileType = detectFileType(file.getOriginalFilename());
            List<Map<String, String>> rows = parseFile(file.getInputStream(), fileType);
            List<Map<String, String>> mapped = new ArrayList<>();

            for (int i = 0; i < Math.min(5, rows.size()); i++) {
                mapped.add(applyMapping(rows.get(i), fieldMapping));
            }

            return new ResultDTO(Map.of("mappedPreview", mapped, "totalRows", rows.size()));
        } catch (Exception e) {
            return new ResultDTO(false, "Error: " + e.getMessage(), 103);
        }
    }

    public ResultDTO executeImport(MultipartFile file, Map<String, String> fieldMapping,
                                   Long companyId, Long subsidiaryId, Long modifiedById, Long supplierId) {
        try {
            String fileName = file.getOriginalFilename();
            String fileType = detectFileType(fileName);
            List<Map<String, String>> rows = parseFile(file.getInputStream(), fileType);

            int success = 0, errors = 0;
            List<String> errorDetails = new ArrayList<>();

            for (int i = 0; i < rows.size(); i++) {
                try {
                    Map<String, String> mapped = applyMapping(rows.get(i), fieldMapping);
                    String title = mapped.getOrDefault("title", "").trim();
                    if (title.isEmpty()) { errors++; errorDetails.add("Row " + (i+1) + ": title required"); continue; }

                    SourceProduct sp = new SourceProduct();
                    sp.setCompanyId(companyId);
                    sp.setSubsidiaryId(subsidiaryId);
                    sp.setIdModifiedBy(modifiedById);
                    sp.setSourceProvider("FILE_IMPORT");
                    sp.setSourceId("FILE-" + (i + 1));
                    sp.setTitle(title);
                    sp.setDescription(mapped.getOrDefault("description", ""));
                    sp.setCategory(mapped.getOrDefault("category", ""));
                    sp.setSourceUrl(mapped.getOrDefault("sourceUrl", ""));
                    sp.setSupplierName(mapped.getOrDefault("supplierName", ""));
                    sp.setTags(mapped.getOrDefault("tags", ""));
                    sp.setImages(mapped.getOrDefault("images", ""));
                    sp.setImported(false);
                    sp.setFetchDate(LocalDateTime.now());
                    sp.setActive(true);

                    String priceStr = mapped.getOrDefault("price", "0");
                    try { sp.setPrice(new BigDecimal(priceStr.replaceAll("[^\\d.]", ""))); }
                    catch (NumberFormatException nfe) { sp.setPrice(BigDecimal.ZERO); }
                    sp.setCurrency(mapped.getOrDefault("currency", "USD"));

                    String sizes = mapped.getOrDefault("variant_sizes", "");
                    String colors = mapped.getOrDefault("variant_colors", "");
                    if (!sizes.isEmpty() || !colors.isEmpty()) {
                        Map<String, Object> attrs = new HashMap<>();
                        if (!sizes.isEmpty()) attrs.put("sizes", Arrays.asList(sizes.split("[|,;]")));
                        if (!colors.isEmpty()) attrs.put("colors", Arrays.asList(colors.split("[|,;]")));
                        sp.setAttributes(objectMapper.writeValueAsString(attrs));
                    }

                    sourceProductRepository.save(sp);
                    success++;
                } catch (Exception rowErr) { errors++; errorDetails.add("Row " + (i+1) + ": " + rowErr.getMessage()); }
            }

            ImportJob job = new ImportJob();
            job.setCompanyId(companyId); job.setSubsidiaryId(subsidiaryId); job.setIdModifiedBy(modifiedById);
            job.setFileName(fileName); job.setFileType(fileType); job.setStatus("COMPLETED");
            job.setTotalRows(rows.size()); job.setSuccessCount(success); job.setErrorCount(errors);
            job.setWarningCount(0); job.setIdSupplier(supplierId); job.setActive(true);
            try { job.setFieldMapping(objectMapper.writeValueAsString(fieldMapping)); } catch (Exception ignored) {}
            if (!errorDetails.isEmpty()) try { job.setErrors(objectMapper.writeValueAsString(errorDetails)); } catch (Exception ignored) {}
            importJobRepository.save(job);

            return new ResultDTO(Map.of("jobId", job.getId(), "totalRows", rows.size(), "success", success, "errors", errors, "status", "COMPLETED"));
        } catch (Exception e) {
            log.error("Import error: {}", e.getMessage());
            return new ResultDTO(false, "Import failed: " + e.getMessage(), 103);
        }
    }

    private List<Map<String, String>> parseFile(InputStream is, String fileType) throws Exception {
        return switch (fileType) {
            case "CSV" -> parseCsv(is);
            case "XLSX" -> parseExcel(is);
            case "JSON" -> parseJson(is);
            default -> throw new IllegalArgumentException("Unsupported: " + fileType);
        };
    }

    private List<Map<String, String>> parseCsv(InputStream is) throws Exception {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Reader reader = new InputStreamReader(is);
             CSVParser parser = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build().parse(reader)) {
            for (CSVRecord r : parser) { Map<String, String> row = new LinkedHashMap<>(); r.toMap().forEach((k,v) -> row.put(k.trim(), v != null ? v.trim() : "")); rows.add(row); }
        }
        return rows;
    }

    private List<Map<String, String>> parseExcel(InputStream is) throws Exception {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0); Row hdr = sheet.getRow(0); if (hdr == null) return rows;
            List<String> headers = new ArrayList<>(); for (Cell c : hdr) headers.add(getCellValue(c).trim());
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i); if (row == null) continue;
                Map<String, String> m = new LinkedHashMap<>();
                for (int j = 0; j < headers.size(); j++) { Cell c = row.getCell(j); m.put(headers.get(j), c != null ? getCellValue(c).trim() : ""); }
                rows.add(m);
            }
        }
        return rows;
    }

    private List<Map<String, String>> parseJson(InputStream is) throws Exception {
        List<Map<String, Object>> raw = objectMapper.readValue(is, new TypeReference<>() {});
        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, Object> item : raw) { Map<String, String> row = new LinkedHashMap<>(); item.forEach((k,v) -> row.put(k, v != null ? v.toString() : "")); rows.add(row); }
        return rows;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> { double d = cell.getNumericCellValue(); yield d == Math.floor(d) ? String.valueOf((long)d) : String.valueOf(d); }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private String detectFileType(String fileName) {
        if (fileName == null) return "CSV";
        String l = fileName.toLowerCase();
        if (l.endsWith(".xlsx") || l.endsWith(".xls")) return "XLSX";
        if (l.endsWith(".json")) return "JSON";
        return "CSV";
    }

    private Map<String, String> applyMapping(Map<String, String> src, Map<String, String> mapping) {
        Map<String, String> mapped = new LinkedHashMap<>();
        mapping.forEach((srcCol, tgtField) -> mapped.put(tgtField, src.getOrDefault(srcCol, "")));
        return mapped;
    }
}
