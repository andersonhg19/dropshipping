package com.visnex.acquisitionservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vn_acq_import_job")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ImportJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "subsidiary_id")
    private Long subsidiaryId;

    @Column(name = "id_modified_by")
    private Long idModifiedBy;

    @Column(name = "file_name", length = 300)
    private String fileName;

    @Column(name = "file_type", length = 10)
    private String fileType;

    @Column(name = "field_mapping", columnDefinition = "TEXT")
    private String fieldMapping;

    @Column(length = 20)
    private String status;

    @Column(name = "total_rows")
    private Integer totalRows;

    @Column(name = "success_count")
    private Integer successCount;

    @Column(name = "error_count")
    private Integer errorCount;

    @Column(name = "warning_count")
    private Integer warningCount;

    @Column(columnDefinition = "TEXT")
    private String errors;

    @Column(name = "id_supplier")
    private Long idSupplier;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
