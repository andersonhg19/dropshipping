package com.visnex.administrationservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "vn_adm_company")
@Getter @Setter
@NoArgsConstructor  @AllArgsConstructor
@Builder  @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String nit;

    private String address;

    @Column(name = "legal_representative", length = 150)
    private String legalRepresentative;       // Persona que firma legalmente

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 150)
    private String image;                     // URL o ruta de logo

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "id_modified_by", nullable = true)
    private User modifiedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update", nullable = true)
    private LocalDateTime lastUpdate;
}
