package com.visnex.acquisitionservice.service.implementation;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.acquisitionservice.dto.output.ResultDTO;
import com.visnex.acquisitionservice.dto.output.ResultImportJobDTO;
import com.visnex.acquisitionservice.entity.ImportJob;
import com.visnex.acquisitionservice.entity.SourceProduct;
import com.visnex.acquisitionservice.enums.Message;
import com.visnex.acquisitionservice.mapper.ImportJobMapper;
import com.visnex.acquisitionservice.repository.ImportJobRepository;
import com.visnex.acquisitionservice.repository.SourceProductRepository;
import com.visnex.acquisitionservice.security.ConnectInternalApi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileImportService {

    private final SourceProductRepository sourceProductRepository;
    private final ImportJobRepository importJobRepository;
    private final ImportJobMapper importJobMapper;
    private final ConnectInternalApi connectInternalApi;
    private final ObjectMapper objectMapper;

    private static final String DEFAULT_LANG = "es";

    private String lang(String language) {
        return (language == null || language.isBlank()) ? DEFAULT_LANG : language;
    }

    private String m(String key, String lng) {
        try {
            return connectInternalApi.chargeMessage(key, lng);
        } catch (URISyntaxException | JsonProcessingException e) {
            return key;
        }
    }

    // ──────────────────────────────────────────────────────────
    //  FILE TYPE DETECTION
    // ──────────────────────────────────────────────────────────

    public String detectFileType(String fileName) {
        if (fileName == null || !fileName.contains(".")) return null;
        String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return switch (ext) {
            case "csv" -> "CSV";
            case "xlsx" -> "XLSX";
            case "json" -> "JSON";
            default -> null;
        };
    }

    // ──────────────────────────────────────────────────────────
    //  PARSERS
    // ──────────────────────────────────────────────────────────

    public List<Map<String, String>> parseFile(MultipartFile file) throws IOException {
        String fileType = detectFileType(file.getOriginalFilename());
        if (fileType == null) {
            throw new IllegalArgumentException("Unsupported file type. Allowed: CSV, XLSX, JSON");
        }
        return switch (fileType) {
            case "CSV" -> parseCsv(file.getInputStream());
            case "XLSX" -> parseExcel(file.getInputStream());
            case "JSON" -> parseJson(file.getInputStream());
            default -> throw new IllegalArgumentException("Unsupported file type: " + fileType);
        };
    }

    public List<Map<String, String>> parseCsv(InputStream inputStream) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build();

        try (CSVParser parser = new CSVParser(new InputStreamReader(inputStream, StandardCharsets.UTF_8), format)) {
            List<String> headers = parser.getHeaderNames();
            if (headers.isEmpty()) {
                throw new IllegalArgumentException("CSV file has no header row");
            }
            for (CSVRecord record : parser) {
                Map<String, String> row = new LinkedHashMap<>();
                for (String header : headers) {
                    row.put(header, record.get(header));
                }
                rows.add(row);
            }
        }
        return rows;
    }

    public List<Map<String, String>> parseExcel(InputStream inputStream) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        DataFormatter dataFormatter = new DataFormatter();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() < 2) {
                throw new IllegalArgumentException("Excel file is empty or has no data rows");
            }

            // Read header row
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new IllegalArgumentException("Excel file has no header row");
            }

            List<String> headers = new ArrayList<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                String headerValue = (cell != null) ? dataFormatter.formatCellValue(cell).trim() : "Column" + i;
                headers.add(headerValue.isEmpty() ? "Column" + i : headerValue);
            }

            // Read data rows
            for (int rowIdx = 1; rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null) continue;

                // Skip completely empty rows
                boolean hasData = false;
                Map<String, String> rowMap = new LinkedHashMap<>();
                for (int colIdx = 0; colIdx < headers.size(); colIdx++) {
                    Cell cell = row.getCell(colIdx);
                    String value = (cell != null) ? dataFormatter.formatCellValue(cell).trim() : "";
                    if (!value.isEmpty()) hasData = true;
                    rowMap.put(headers.get(colIdx), value);
                }
                if (hasData) {
                    rows.add(rowMap);
                }
            }
        }
        return rows;
    }

    public List<Map<String, String>> parseJson(InputStream inputStream) throws IOException {
        List<Map<String, Object>> rawList = objectMapper.readValue(
                inputStream, new TypeReference<List<Map<String, Object>>>() {});

        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, Object> rawRow : rawList) {
            Map<String, String> row = new LinkedHashMap<>();
            for (Map.Entry<String, Object> entry : rawRow.entrySet()) {
                row.put(entry.getKey(), entry.getValue() != null ? String.valueOf(entry.getValue()) : "");
            }
            rows.add(row);
        }
        return rows;
    }

    // ──────────────────────────────────────────────────────────
    //  COLUMN DETECTION
    // ──────────────────────────────────────────────────────────

    public List<String> detectColumns(List<Map<String, String>> rows) {
        if (rows == null || rows.isEmpty()) return Collections.emptyList();
        return new ArrayList<>(rows.get(0).keySet());
    }

    // ──────────────────────────────────────────────────────────
    //  UPLOAD (parse + return metadata)
    // ──────────────────────────────────────────────────────────

    public ResultDTO upload(MultipartFile file, String language) {
        final String lng = lang(language);
        try {
            if (file == null || file.isEmpty()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " file", 103);
            }

            String fileType = detectFileType(file.getOriginalFilename());
            if (fileType == null) {
                return new ResultDTO(false, "Unsupported file type. Allowed: CSV, XLSX, JSON", 103);
            }

            List<Map<String, String>> rows = parseFile(file);
            List<String> columns = detectColumns(rows);

            // Preview first 3 rows
            List<Map<String, String>> preview = rows.stream().limit(3).collect(Collectors.toList());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("fileName", file.getOriginalFilename());
            result.put("fileType", fileType);
            result.put("columns", columns);
            result.put("rowCount", rows.size());
            result.put("preview", preview);

            return new ResultDTO(result);

        } catch (IllegalArgumentException e) {
            return new ResultDTO(false, e.getMessage(), 103);
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage(), e);
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

    // ──────────────────────────────────────────────────────────
    //  PREVIEW (parse + apply mapping to first 5 rows)
    // ──────────────────────────────────────────────────────────

    public ResultDTO preview(MultipartFile file, String fieldMappingJson, String language) {
        final String lng = lang(language);
        try {
            if (file == null || file.isEmpty()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " file", 103);
            }
            if (fieldMappingJson == null || fieldMappingJson.isBlank()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " fieldMapping", 103);
            }

            Map<String, String> fieldMapping = objectMapper.readValue(
                    fieldMappingJson, new TypeReference<Map<String, String>>() {});

            List<Map<String, String>> rows = parseFile(file);
            List<Map<String, String>> previewRows = rows.stream().limit(5).collect(Collectors.toList());

            List<Map<String, String>> mappedPreview = new ArrayList<>();
            for (Map<String, String> row : previewRows) {
                mappedPreview.add(applyMapping(row, fieldMapping));
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("rowCount", rows.size());
            result.put("previewCount", mappedPreview.size());
            result.put("mappedRows", mappedPreview);

            return new ResultDTO(result);

        } catch (IllegalArgumentException e) {
            return new ResultDTO(false, e.getMessage(), 103);
        } catch (Exception e) {
            log.error("Error previewing file: {}", e.getMessage(), e);
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

    // ──────────────────────────────────────────────────────────
    //  EXECUTE IMPORT
    // ──────────────────────────────────────────────────────────

    public ResultDTO executeImport(MultipartFile file, String fieldMappingJson,
                                   Long companyId, Long subsidiaryId, Long modifiedById,
                                   Long supplierId, String language) {
        final String lng = lang(language);
        try {
            if (file == null || file.isEmpty()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " file", 103);
            }
            if (companyId == null) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " companyId", 103);
            }
            if (fieldMappingJson == null || fieldMappingJson.isBlank()) {
                return new ResultDTO(false, m(Message.Msj.return_field_is_required.toString(), lng) + " fieldMapping", 103);
            }

            Map<String, String> fieldMapping = objectMapper.readValue(
                    fieldMappingJson, new TypeReference<Map<String, String>>() {});

            String fileType = detectFileType(file.getOriginalFilename());
            List<Map<String, String>> rows = parseFile(file);

            // Create ImportJob record
            ImportJob job = ImportJob.builder()
                    .companyId(companyId)
                    .subsidiaryId(subsidiaryId)
                    .idModifiedBy(modifiedById)
                    .fileName(file.getOriginalFilename())
                    .fileType(fileType)
                    .fieldMapping(fieldMappingJson)
                    .status("PROCESSING")
                    .totalRows(rows.size())
                    .successCount(0)
                    .errorCount(0)
                    .warningCount(0)
                    .idSupplier(supplierId)
                    .active(true)
                    .build();
            job = importJobRepository.save(job);

            int successCount = 0;
            int errorCount = 0;
            List<String> errors = new ArrayList<>();

            for (int i = 0; i < rows.size(); i++) {
                try {
                    Map<String, String> mapped = applyMapping(rows.get(i), fieldMapping);
                    SourceProduct product = buildSourceProduct(mapped, companyId, subsidiaryId, modifiedById, supplierId);

                    // Validate required field: title
                    if (product.getTitle() == null || product.getTitle().isBlank()) {
                        errorCount++;
                        errors.add("Row " + (i + 2) + ": title is required");
                        continue;
                    }

                    sourceProductRepository.save(product);
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                    errors.add("Row " + (i + 2) + ": " + e.getMessage());
                    if (errors.size() > 500) {
                        errors.add("... (truncated, too many errors)");
                        break;
                    }
                }
            }

            // Update ImportJob
            job.setSuccessCount(successCount);
            job.setErrorCount(errorCount);
            job.setStatus(errorCount == 0 ? "COMPLETED" : (successCount == 0 ? "FAILED" : "COMPLETED_WITH_ERRORS"));
            if (!errors.isEmpty()) {
                job.setErrors(objectMapper.writeValueAsString(errors));
            }
            job = importJobRepository.save(job);

            ResultImportJobDTO result = importJobMapper.toDTO(job);
            return new ResultDTO(result);

        } catch (IllegalArgumentException e) {
            return new ResultDTO(false, e.getMessage(), 103);
        } catch (Exception e) {
            log.error("Error executing import: {}", e.getMessage(), e);
            return new ResultDTO(false, m(Message.Msj.return_process_error.toString(), lng), 103, e.getMessage());
        }
    }

    // ──────────────────────────────────────────────────────────
    //  MAPPING HELPERS
    // ──────────────────────────────────────────────────────────

    /**
     * Applies field mapping to convert a source row (CSV/Excel column names)
     * into a map with target field names.
     *
     * @param sourceRow    the parsed row with original column names as keys
     * @param fieldMapping map of sourceColumn -> targetField
     * @return map with target field names as keys
     */
    private Map<String, String> applyMapping(Map<String, String> sourceRow, Map<String, String> fieldMapping) {
        Map<String, String> mapped = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : fieldMapping.entrySet()) {
            String sourceColumn = entry.getKey();
            String targetField = entry.getValue();
            String value = sourceRow.getOrDefault(sourceColumn, "");
            mapped.put(targetField, value);
        }
        return mapped;
    }

    /**
     * Builds a SourceProduct entity from a mapped row.
     * Target fields: title, description, price, currency, category, images,
     * sourceUrl, supplierName, tags, variant_sizes, variant_colors
     */
    private SourceProduct buildSourceProduct(Map<String, String> mapped,
                                             Long companyId, Long subsidiaryId,
                                             Long modifiedById, Long supplierId) {
        SourceProduct product = new SourceProduct();
        product.setCompanyId(companyId);
        product.setSubsidiaryId(subsidiaryId);
        product.setIdModifiedBy(modifiedById);
        product.setSourceProvider("FILE_IMPORT");
        product.setActive(true);
        product.setImported(false);
        product.setFetchDate(LocalDateTime.now());

        // Direct field mappings
        product.setTitle(getVal(mapped, "title"));
        product.setDescription(getVal(mapped, "description"));
        product.setCurrency(getVal(mapped, "currency", "USD"));
        product.setCategory(getVal(mapped, "category"));
        product.setSourceUrl(getVal(mapped, "sourceUrl"));
        product.setTags(getVal(mapped, "tags"));

        // Supplier: use mapped supplierName, or set from supplierId context
        String supplierName = getVal(mapped, "supplierName");
        if (supplierName != null && !supplierName.isBlank()) {
            product.setSupplierName(supplierName);
        }

        // Price
        String priceStr = getVal(mapped, "price");
        if (priceStr != null && !priceStr.isBlank()) {
            try {
                String cleaned = priceStr.replaceAll("[^\\d.,\\-]", "").replace(",", ".");
                product.setPrice(new BigDecimal(cleaned));
            } catch (NumberFormatException e) {
                log.warn("Invalid price value '{}', skipping", priceStr);
            }
        }

        // Images: expect comma-separated URLs, store as JSON array
        String images = getVal(mapped, "images");
        if (images != null && !images.isBlank()) {
            try {
                String[] urls = images.split(",");
                List<String> trimmed = new ArrayList<>();
                for (String url : urls) {
                    if (!url.trim().isEmpty()) trimmed.add(url.trim());
                }
                product.setImages(objectMapper.writeValueAsString(trimmed));
            } catch (JsonProcessingException e) {
                product.setImages(images);
            }
        }

        // Variants: build from variant_sizes and variant_colors
        String sizes = getVal(mapped, "variant_sizes");
        String colors = getVal(mapped, "variant_colors");
        if ((sizes != null && !sizes.isBlank()) || (colors != null && !colors.isBlank())) {
            try {
                Map<String, Object> variants = new HashMap<>();
                if (sizes != null && !sizes.isBlank()) {
                    List<String> sizeList = new ArrayList<>();
                    for (String s : sizes.split(",")) {
                        if (!s.trim().isEmpty()) sizeList.add(s.trim());
                    }
                    variants.put("sizes", sizeList);
                }
                if (colors != null && !colors.isBlank()) {
                    List<String> colorList = new ArrayList<>();
                    for (String c : colors.split(",")) {
                        if (!c.trim().isEmpty()) colorList.add(c.trim());
                    }
                    variants.put("colors", colorList);
                }
                product.setVariants(objectMapper.writeValueAsString(variants));
            } catch (JsonProcessingException e) {
                log.warn("Error serializing variants, skipping");
            }
        }

        return product;
    }

    private String getVal(Map<String, String> map, String key) {
        String val = map.get(key);
        return (val != null && !val.isBlank()) ? val.trim() : null;
    }

    private String getVal(Map<String, String> map, String key, String defaultValue) {
        String val = getVal(map, key);
        return val != null ? val : defaultValue;
    }
}
