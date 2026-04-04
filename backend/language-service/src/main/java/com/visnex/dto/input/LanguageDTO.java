package com.visnex.dto.input;

public record LanguageDTO(String id,
        String language) {
    public static LanguageDTO create(String id, String language) {
        return new LanguageDTO(id, language);
    }
}