package com.visnex.commerceservice.controller;

import com.visnex.commerceservice.entity.Product;
import com.visnex.commerceservice.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v2/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Export products to CSV or Excel")
public class ExportController {

    private final ProductRepository productRepository;

    @PostMapping("/csv")
    @Operation(summary = "Export products to CSV")
    public void exportCsv(@RequestBody(required = false) java.util.Map<String, Object> filters,
                           @RequestHeader(name = "lng", defaultValue = "es") String language,
                           HttpServletResponse response) {
        try {
            response.setContentType("text/csv; charset=UTF-8");
            response.setHeader("Content-Disposition", "attachment; filename=visnex-products.csv");

            Long companyId = filters != null && filters.get("idCompany") != null ? Long.valueOf(filters.get("idCompany").toString()) : null;
            List<Product> products = companyId != null
                    ? productRepository.findAll().stream().filter(p -> companyId.equals(p.getCompanyId()) && Boolean.TRUE.equals(p.getActive())).toList()
                    : productRepository.findAll().stream().filter(p -> Boolean.TRUE.equals(p.getActive())).toList();

            PrintWriter writer = response.getWriter();
            writer.println("ID,Title,Description,Base Price,Selling Price,Cost Price,Margin,Currency,Status,Category ID,Supplier ID,Source,Tags");
            for (Product p : products) {
                writer.printf("%d,\"%s\",\"%s\",%s,%s,%s,%s,%s,%s,%s,%s,%s,\"%s\"%n",
                        p.getId(),
                        escape(p.getTitle()), escape(p.getDescription()),
                        p.getBasePrice(), p.getSellingPrice(), p.getCostPrice(), p.getMargin(),
                        p.getCurrency(), p.getStatus(), p.getIdCategory(), p.getIdSupplier(),
                        p.getSourceProvider(), escape(p.getTags()));
            }
            writer.flush();
        } catch (Exception e) {
            log.error("CSV export error: {}", e.getMessage());
        }
    }

    @PostMapping("/excel")
    @Operation(summary = "Export products to Excel")
    public void exportExcel(@RequestBody(required = false) java.util.Map<String, Object> filters,
                             @RequestHeader(name = "lng", defaultValue = "es") String language,
                             HttpServletResponse response) {
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=visnex-products.xlsx");

            Long companyId = filters != null && filters.get("idCompany") != null ? Long.valueOf(filters.get("idCompany").toString()) : null;
            List<Product> products = companyId != null
                    ? productRepository.findAll().stream().filter(p -> companyId.equals(p.getCompanyId()) && Boolean.TRUE.equals(p.getActive())).toList()
                    : productRepository.findAll().stream().filter(p -> Boolean.TRUE.equals(p.getActive())).toList();

            Workbook wb = new XSSFWorkbook();
            Sheet sheet = wb.createSheet("Products");

            String[] headers = {"ID", "Title", "Description", "Base Price", "Selling Price", "Cost Price", "Margin", "Currency", "Status", "Category", "Supplier", "Source", "Tags"};
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = wb.createCellStyle();
            Font font = wb.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Product p : products) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getTitle() != null ? p.getTitle() : "");
                row.createCell(2).setCellValue(p.getDescription() != null ? p.getDescription() : "");
                row.createCell(3).setCellValue(p.getBasePrice() != null ? p.getBasePrice().doubleValue() : 0);
                row.createCell(4).setCellValue(p.getSellingPrice() != null ? p.getSellingPrice().doubleValue() : 0);
                row.createCell(5).setCellValue(p.getCostPrice() != null ? p.getCostPrice().doubleValue() : 0);
                row.createCell(6).setCellValue(p.getMargin() != null ? p.getMargin().doubleValue() : 0);
                row.createCell(7).setCellValue(p.getCurrency() != null ? p.getCurrency() : "USD");
                row.createCell(8).setCellValue(p.getStatus() != null ? p.getStatus() : "");
                row.createCell(9).setCellValue(p.getIdCategory() != null ? p.getIdCategory() : 0);
                row.createCell(10).setCellValue(p.getIdSupplier() != null ? p.getIdSupplier() : 0);
                row.createCell(11).setCellValue(p.getSourceProvider() != null ? p.getSourceProvider() : "");
                row.createCell(12).setCellValue(p.getTags() != null ? p.getTags() : "");
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            wb.write(response.getOutputStream());
            wb.close();
        } catch (Exception e) {
            log.error("Excel export error: {}", e.getMessage());
        }
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\"", "\"\"").replace("\n", " ").replace("\r", "");
    }
}
