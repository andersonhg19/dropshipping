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
@Table(name = "vn_acq_source_config")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SourceConfig {

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

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 50)
    private String provider;

    @Column(name = "api_key", length = 500)
    private String apiKey;

    @Column(name = "api_secret", length = 500)
    private String apiSecret;

    @Column(name = "base_url", length = 500)
    private String baseUrl;

    @Column(name = "rate_limit")
    private Integer rateLimit;

    @Column(name = "last_sync")
    private LocalDateTime lastSync;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
