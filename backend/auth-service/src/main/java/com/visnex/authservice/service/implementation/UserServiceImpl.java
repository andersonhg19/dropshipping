package com.visnex.authservice.service.implementation;

import com.visnex.authservice.config.EmailSender;
import com.visnex.authservice.dto.UserSaveDTO;
import com.visnex.authservice.entity.Mail;
import com.visnex.authservice.repository.MailRepository;
import com.visnex.authservice.utils.securityUtil;
import com.visnex.authservice.dto.output.ResultDTO;
import com.visnex.authservice.dto.UserDTO;
import com.visnex.authservice.entity.Role;
import com.visnex.authservice.entity.User;
import com.visnex.authservice.mapper.UserMapper;
import com.visnex.authservice.repository.RoleRepository;
import com.visnex.authservice.repository.UserRepository;
import com.visnex.authservice.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Transactional
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MailRepository mailRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailSender emailSender;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder, EmailSender emailSender,
                           UserMapper userMapper, MailRepository mailRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.mailRepository = mailRepository;
        this.emailSender = emailSender;
    }

    @Override
    public ResultDTO saveUser(UserSaveDTO userDTO) {
        try {
            Optional<User> result = userRepository.findByEmail(userDTO.getEmail());
            if (result.isPresent()) {
                return new ResultDTO(false, "Ya existe un usuario con este Correo.", 1);
            }
            User resultUser = userRepository.findByUsername(userDTO.getUsername());
            if (resultUser != null) {
                return new ResultDTO(false, "Ya existe un usuario con este nombre de usuario.", 1);
            }

            User user = new User();
            long idTable = 1;
            Optional<User> number = userRepository.findFirstByOrderByIdDesc();
            if (number.isPresent()) {
                User largestUser = number.get();
                idTable = largestUser.getId() + 1;
            }
            user.setId(idTable);
            user.setUsername(userDTO.getUsername());
            user.setEmail(userDTO.getEmail());

            String newPassword = "";
            String uuid = UUID.randomUUID().toString();
            newPassword = uuid.substring(0, 16);
            String tmp2 = securityUtil.encrypt(newPassword);
            String tmp = passwordEncoder.encode(newPassword);
            user.setPassword(tmp);
            user.setEnabled(true);
            Optional<Mail> structure = mailRepository.findFirstByIdMail(1);

            String userMail = user.getEmail();
            String subject = structure.get().getDescription();
            String body = String.format(structure.get().getBody(), user.getUsername(), newPassword);
            emailSender.sendMail(userMail, subject, body);

            List<Role> roles = new ArrayList<>();
            for (Long item : userDTO.getRoles()) {
                Optional<Role> role = roleRepository.findById(item);
                role.ifPresent(roles::add);
            }
            user.setRoles(roles);
            User resuEntity = userRepository.save(user);
            UserDTO resultDTO = userMapper.toDTO(resuEntity);
            resultDTO.setPassword(tmp2);
            return new ResultDTO(resultDTO);
        } catch (Exception e) {
            return new ResultDTO(false, "error", 102);
        }
    }

    @Override
    public User save(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Role addRole(Role role) {
        return roleRepository.save(role);
    }

    @Override
    public User addRoleToUser(String username, String roleName) {
        User user = userRepository.findByUsername(username);
        Optional<Role> role = roleRepository.findByName(roleName);
        if (user == null || role.isEmpty()) {
            return null;
        }
        List<Role> roleList = user.getRoles();
        role.ifPresent(roleList::add);
        user.setRoles(roleList);
        return userRepository.save(user);
    }

    @Override
    public User removeRoleToUser(String username, String roleName) {
        User user = userRepository.findByUsername(username);
        Optional<Role> role = roleRepository.findByName(roleName);
        if (user == null || role.isEmpty()) {
            return null;
        }
        List<Role> roleList = user.getRoles();
        role.ifPresent(roleList::remove);
        user.setRoles(roleList);
        return userRepository.save(user);
    }

    @Override
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
