package com.visnex.dto.input;

import java.util.List;

public record LanguagePageDTO(
                int page,
                int size,
                int totalPage,
                List<LanguageDTO> languageDTOList) {
}
