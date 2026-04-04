package com.visnex.authservice.mapper;

import com.visnex.authservice.dto.UserDTO;
import com.visnex.authservice.entity.User;

public interface UserMapper {
    UserDTO toDTO(User user);

    User toEntity(UserDTO userDTO);
}