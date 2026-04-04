package com.visnex.administrationservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.*;
import com.visnex.administrationservice.dto.output.ResultDTO;

import java.net.URISyntaxException;

public interface UserService {

    public abstract ResultDTO login(LoginDTO userFilterDTO, String language) throws URISyntaxException, JsonProcessingException;

    public abstract ResultDTO saveAndUpdate(UserDTO userDTO, String language) throws Exception;

//    public abstract ResultDTO resetPassword(ResetUserPasswordDTO resetUserPasswordDTO, String language) throws Exception;
    public abstract ResultDTO getById(long id, String language) throws Exception ;
    public abstract ResultDTO getAllItems(UserFilterDTO filterDTO, String language) throws URISyntaxException, JsonProcessingException;
}