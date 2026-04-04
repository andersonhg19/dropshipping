package com.visnex.service.implementation;

import com.visnex.dto.input.KeywordDTO;
import com.visnex.dto.output.ResultDTO;
import com.visnex.entity.Keyword;
import com.visnex.repository.KeywordRepository;
import com.visnex.service.KeywordService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class KeywordServiceImpl implements KeywordService {

    private final KeywordRepository repository;

    public KeywordServiceImpl(KeywordRepository repository) {
        this.repository = repository;
    }

    @Override
    public ResultDTO saveAndUpdate(KeywordDTO keywordDTO) {
        Keyword keyword = new Keyword();
        if (keywordDTO.id() != null && !"".equals(keywordDTO.id().trim())) {
            Optional<Keyword> optionalKeyword = repository.findById(keywordDTO.id());
            if (optionalKeyword.isPresent()) {
                keyword = optionalKeyword.get();
                keyword.setKey(keywordDTO.key());
                keyword.setLastUpdate(LocalDateTime.now());
            } else {
                keyword.setId(keywordDTO.id());
                keyword.setKey(keywordDTO.key());
                keyword.setCreation(LocalDateTime.now());
                keyword.setLastUpdate(LocalDateTime.now());
            }
        } else {
            keyword.setId(UUID.randomUUID().toString());
            keyword.setKey(keywordDTO.key());
            keyword.setCreation(LocalDateTime.now());
            keyword.setLastUpdate(LocalDateTime.now());
        }
        keyword = repository.save(keyword);
        return new ResultDTO(keyword);
    }

    @Override
    public ResultDTO getById(String id) {
        return new ResultDTO(repository.findAllById(id));
    }

    @Override
    public ResultDTO getAllItems(int size, int page) {
        Page<Keyword> result = repository.findAll(PageRequest.of(page, size));
        return new ResultDTO(result.getContent());
    }

}
