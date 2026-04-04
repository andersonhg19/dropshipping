package com.visnex.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "vn_lan_languages")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Language {

    @Id
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(unique = true, nullable = false)
    private String language;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creation;

    @Column(nullable = false, updatable = false)
    private LocalDateTime lastUpdate;

}
