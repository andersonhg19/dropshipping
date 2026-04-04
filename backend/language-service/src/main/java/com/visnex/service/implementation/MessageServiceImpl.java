package com.visnex.service.implementation;

import com.visnex.dto.output.ResultDTO;
import com.visnex.entity.MessageLabels;
import com.visnex.repository.MessageLabelsRepository;
import com.visnex.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageLabelsRepository messageLabelsRepository;

    @Override
    public ResultDTO getMessageByKey(String key, String idLanguage) {
        Optional<MessageLabels> messageLabel = messageLabelsRepository.findByIdkeyAndIdlanguage(key, idLanguage);
        if (messageLabel.isPresent()) {
            return new ResultDTO(messageLabel.get().getLabel());
        } else {
            return new ResultDTO(false, "No found: <" + key + ">", 102, "<" + key + ">");
        }
    }

    @Override
    public ResultDTO getMessageListByKey(List<String> keys, String idLanguage) {
        List<MessageLabels> messageLabelsList = messageLabelsRepository.findByIdkeyInAndIdlanguage(keys, idLanguage);
        return new ResultDTO(messageLabelsList);
    }
}
