package com.visnex.authservice.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vn_auth_mail")
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Mail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("idMail")
    private long idMail;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String description;
}
