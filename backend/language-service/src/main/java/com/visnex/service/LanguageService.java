package com.visnex.service;

import com.visnex.dto.input.LanguageDTO;
import com.visnex.dto.output.ResultDTO;

public interface LanguageService {

    public abstract ResultDTO saveAndUpdate(LanguageDTO languageDTO);

    public abstract ResultDTO getById(String id);

    public abstract ResultDTO getAllItems(int size, int page);
}