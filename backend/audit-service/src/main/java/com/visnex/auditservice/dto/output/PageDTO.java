package com.visnex.auditservice.dto.output;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageDTO<T> {
    private int page;
    private int size;
    private int totalPages;
    private List<T> list;
}

