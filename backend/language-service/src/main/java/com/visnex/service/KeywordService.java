package com.visnex.service;

import com.visnex.dto.input.KeywordDTO;
import com.visnex.dto.output.ResultDTO;

public interface KeywordService {

    public abstract ResultDTO saveAndUpdate(KeywordDTO keywordDTO);

    public abstract ResultDTO getById(String id);

    public abstract ResultDTO getAllItems(int size, int page);
}
