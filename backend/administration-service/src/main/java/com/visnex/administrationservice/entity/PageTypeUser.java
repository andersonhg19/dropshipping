package com.visnex.administrationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "vn_adm_page_type_user",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_page_role",
                columnNames = {"id_page", "id_type_user"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PageTypeUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_page", nullable = false)
    private Pages page;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_type_user", nullable = false)
    private TypeUser typeUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_modified_by", nullable = false)
    private User modifiedBy;                       // autor del último cambio

    @Column(nullable = false) private Boolean canCreate;
    @Column(nullable = false) private Boolean canUpdate;
    @Column(nullable = false) private Boolean canRead;
    @Column(nullable = false) private Boolean canDelete;

    @Column(nullable = false,columnDefinition = "boolean default true")
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @UpdateTimestamp
    @Column(name = "last_update", nullable = false)
    private LocalDateTime lastUpdate;
}
