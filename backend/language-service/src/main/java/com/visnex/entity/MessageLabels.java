package com.visnex.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "vn_lan_message_labels")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class MessageLabels {

    @Id
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(name = "idlanguage", nullable = false)
    private String idlanguage;

    @Column(name = "idkey", nullable = false)
    private String idkey;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "creation", nullable = false, updatable = false)
    private LocalDateTime creation;

    @Column(name = "last_update", nullable = false)
    private LocalDateTime lastUpdate;
}
