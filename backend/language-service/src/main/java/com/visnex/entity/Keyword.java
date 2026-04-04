package com.visnex.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "vn_lan_keywords")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Keyword {

    @Id
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(name = "key", unique = true, nullable = false)
    private String key;

    @Column(name = "creation", nullable = false, updatable = false)
    private LocalDateTime creation;

    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
