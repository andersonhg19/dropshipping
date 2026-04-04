package com.visnex.controller;

import com.visnex.dto.output.ResultDTO;
import com.visnex.service.implementation.LoadData;

import com.visnex.service.implementation.MessageServiceImpl;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v2/message")
public class MessageController {

    private final MessageServiceImpl messageService;
    private final LoadData loadData;

    public MessageController(LoadData loadData, MessageServiceImpl messageService) {
        this.loadData = loadData;
        this.messageService = messageService;
    }

    // Endpoint to trigger the seed data loading
    @GetMapping("/seedData")
    public ResultDTO runSeedData() {
        loadData.seedData();
        return new ResultDTO("Seed data execution initiated.");
    }

    @GetMapping(value = "/getOneMessage/{key}/{language}")
    public ResultDTO getOneMessage(@PathVariable String key, @PathVariable String language) {
        return messageService.getMessageByKey(key, language);
    }

    @GetMapping(value = "/getListMessage")
    public ResultDTO getListMessage(
            @RequestParam List<String> keys,
            @RequestParam String language) {
        return messageService.getMessageListByKey(keys, language);
    }

}