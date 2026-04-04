package com.visnex.administrationservice.dto.input;

import java.util.List;

public record PageDTO<T>(
        int page,
        int size,
        int totalPage,
        List<T> list) { }
