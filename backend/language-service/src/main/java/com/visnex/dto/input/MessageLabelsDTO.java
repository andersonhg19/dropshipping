package com.visnex.dto.input;

public record MessageLabelsDTO(String id,
        String idlanguage,
        String idkey,
        String label) {
    public static MessageLabelsDTO create(String id, String idlanguage, String idkey, String label) {
        return new MessageLabelsDTO(id, idlanguage, idkey, label);
    }
}