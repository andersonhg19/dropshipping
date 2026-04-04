package com.visnex.authservice.service;

import com.visnex.authservice.dto.UserSaveDTO;
import com.visnex.authservice.dto.output.ResultDTO;
import com.visnex.authservice.entity.Role;
import com.visnex.authservice.entity.User;

import java.util.List;

public interface UserService {
    ResultDTO saveUser(UserSaveDTO userSaveDTO);

    User save(User user);

    User findUserByUsername(String username);

    Role addRole(Role role);

    User addRoleToUser(String username, String roleName);

    User removeRoleToUser(String username, String roleName);

    void deleteUserById(Long id);

    List<User> getAllUsers();
}
