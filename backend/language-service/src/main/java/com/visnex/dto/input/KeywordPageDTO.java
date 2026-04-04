package com.visnex.dto.input;

import com.visnex.entity.Keyword;

import java.util.List;

public record KeywordPageDTO(
                int page,
                int size,
                int totalPage,
                List<Keyword> keywordDTOList) {
}
