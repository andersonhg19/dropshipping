package com.visnex.administrationservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.LoginDTO;
import com.visnex.administrationservice.dto.input.UserDTO;
import com.visnex.administrationservice.dto.input.UserFilterDTO;
import com.visnex.administrationservice.dto.output.ResultDTO;

import java.net.URISyntaxException;

public interface UtilsService {

    public ResultDTO typeDocument(String language) throws Exception;
}