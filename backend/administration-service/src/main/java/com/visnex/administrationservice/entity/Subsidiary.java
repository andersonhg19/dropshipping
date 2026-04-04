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
import jakarta.persistence.UniqueConstraint;

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
@Table(
        name = "vn_adm_subsidiary",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_company_nit_name",
                        columnNames = {"id_company", "nit", "name"}
                )
        }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder @EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Subsidiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_company", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "id_modified_by", nullable = true)
    private User modifiedBy;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String nit;

    @Column(length = 200)
    private String address;

    @Column(name = "legal_representative", length = 150)
    private String legalRepresentative;

    @Column(name= "contact_person", length = 100)
    private String contactPerson;

    @Column(length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 1000)
    private String image;

    @Column(length=10)
    private Integer decimalsNumber;

    @Column(name="rounding_type", length=50)
    private String roundingType;

    @Column(nullable = false,columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
