package com.visnex.common.dto;

import java.util.List;

public record PageDTO<T>(
        int page,
        int size,
        int totalPage,
        List<T> list) { }
