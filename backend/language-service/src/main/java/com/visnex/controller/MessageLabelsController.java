package com.visnex.controller;

import com.visnex.dto.input.MessageLabelsDTO;
import com.visnex.dto.output.ResultDTO;

import com.visnex.service.MessageLabelsService;
import com.visnex.service.implementation.MessageLabelsServiceImpl;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v2/messagelabels")
public class MessageLabelsController {

    private final MessageLabelsService messageLabelsService;

    public MessageLabelsController(MessageLabelsServiceImpl messageLabelsService) {
        this.messageLabelsService = messageLabelsService;

    }

    @GetMapping(value = "/allMessageLabels/{page}/{size}")
    public ResultDTO getMessageLabels(@PathVariable(name = "size") int size,
            @PathVariable(name = "page") int page) {
        return messageLabelsService.getAllItems(size, page);
    }

    @PostMapping(value = "/addMessageLabels")
    public ResultDTO saveMessageLabel(@RequestBody MessageLabelsDTO messageLabelsDTO) {
        return messageLabelsService.saveAndUpdate(messageLabelsDTO);
    }

    @GetMapping(value = "/getByIdMessageLabels/{id}", produces = "application/json")
    public ResultDTO getOneMessageLabelsById(@PathVariable String id) {
        return messageLabelsService.getById(id);
    }
}