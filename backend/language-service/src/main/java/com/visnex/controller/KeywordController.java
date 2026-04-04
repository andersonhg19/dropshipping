package com.visnex.controller;

import com.visnex.dto.input.KeywordDTO;
import com.visnex.dto.output.ResultDTO;

import com.visnex.service.KeywordService;
import com.visnex.service.implementation.KeywordServiceImpl;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v2/keyword")
public class KeywordController {

    private final KeywordService keywordService;

    public KeywordController(KeywordServiceImpl keywordService) {
        this.keywordService = keywordService;
    }

    @GetMapping(value = "/allKeywords/{page}/{size}")
    public ResultDTO getKeywords(@PathVariable(name = "size") int size,
            @PathVariable(name = "page") int page) {
        return keywordService.getAllItems(size, page);
    }

    @PostMapping(value = "/addKeyword")
    public ResultDTO saveKeyword(@RequestBody KeywordDTO KeywordDTO) {
        return keywordService.saveAndUpdate(KeywordDTO);
    }

    @GetMapping(value = "/getByIdKeyword/{id}", produces = "application/json")
    public ResultDTO getOneKeywordById(@PathVariable String id) {
        return keywordService.getById(id);
    }
}