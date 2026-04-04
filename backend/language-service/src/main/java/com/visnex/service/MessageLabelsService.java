
package com.visnex.service;

import com.visnex.dto.input.MessageLabelsDTO;
import com.visnex.dto.output.ResultDTO;

public interface MessageLabelsService {

    public abstract ResultDTO saveAndUpdate(MessageLabelsDTO messageLabelsDTO);

    public abstract ResultDTO getById(String id);

    public abstract ResultDTO getAllItems(int size, int page);
}