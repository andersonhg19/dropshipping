package com.visnex.dto.input;

public record KeywordDTO(String id,
        String key) {
    public static KeywordDTO create(String id, String key) {
        return new KeywordDTO(id, key);
    }
}