package com.visnex.administrationservice.service.implementation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.administrationservice.dto.input.*;
import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.dto.output.ResultUserDTO;
import com.visnex.administrationservice.entity.Company;
import com.visnex.administrationservice.entity.Subsidiary;
import com.visnex.administrationservice.entity.TypeUser;
import com.visnex.administrationservice.entity.User;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.exception.ValidationException;
import com.visnex.administrationservice.mapper.UserMapper;
import com.visnex.administrationservice.repository.CustomUserRepository;
import com.visnex.administrationservice.repository.TypeUserRepository;
import com.visnex.administrationservice.repository.UserRepository;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.UserService;
import com.visnex.administrationservice.util.ChangeLogUtil;
import com.visnex.administrationservice.util.EntityChangeEvent;
import com.visnex.administrationservice.util.ValidationUtils;
import com.visnex.administrationservice.util.securityUtil;
import org.modelmapper.ModelMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final TypeUserRepository typeUserRepository;
    private final CustomUserRepository customUserRepository;
    private final ConnectInternalApi connectInternalApi;
    private final ModelMapper modelMapper;
    private final UserMapper userMapper; // usado en custom repo y getById
    private final ValidationUtils validation;


    @Autowired private ApplicationEventPublisher eventPublisher;
    @Autowired private ChangeLogUtil<User> changeLogUtil;

    @org.springframework.beans.factory.annotation.Value("${temporalPassword}")
    private String temporalPassword;

    private static final String DEFAULT_LANG = "es";
    private String lang(String language) { return (language == null || language.isBlank()) ? DEFAULT_LANG : language; }

    public UserServiceImpl(UserRepository repository,
                           TypeUserRepository typeUserRepository,
                           CustomUserRepository customUserRepository,
                           ConnectInternalApi connectInternalApi,
                           ModelMapper modelMapper,
                           UserMapper userMapper,
                           ValidationUtils validation) {
        this.repository = repository;
        this.typeUserRepository = typeUserRepository;
        this.customUserRepository = customUserRepository;
        this.connectInternalApi = (connectInternalApi == null) ? new ConnectInternalApi() : connectInternalApi;
        this.modelMapper = modelMapper;
        this.userMapper = userMapper;
        this.validation = validation;
    }

    @Override
    public ResultDTO login(LoginDTO loginDTO, String language) throws URISyntaxException, JsonProcessingException {
        try {
            if (loginDTO == null || loginDTO.getEmail() == null || loginDTO.getEmail().isBlank()) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_field_is_required.toString(), lang(language)) + " email",
                        1);
            }

            List<User> listUser = repository.findByEmail(loginDTO.getEmail().trim());
            if (listUser.isEmpty()) {
                return new ResultDTO(false,
                        String.format(connectInternalApi.chargeMessage(Message.Msj.userNotFount.toString(), lang(language)), " User"),
                        100);
            }

            User user = listUser.get(0);
            try {
                String reqPass  = securityUtil.decrypt(loginDTO.getPassword());
                String userPass = securityUtil.decrypt(user.getPassword());
                if (!Objects.equals(reqPass, userPass)) {
                    return new ResultDTO(false,
                            connectInternalApi.chargeMessage(Message.Msj.passwordIsIncorrect.toString(), lang(language)),
                            101);
                }
            } catch (Exception err) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.passwordIsIncorrect.toString(), lang(language)),
                        101);
            }

            if (Boolean.FALSE.equals(user.getActive())) {
                return new ResultDTO(false,
                        connectInternalApi.chargeMessage(Message.Msj.return_exist.toString(), lang(language)),
                        100);
            }

            user.setPassword(""); // no exponer password
            ResultUserDTO resultDTO = modelMapper.map(user, ResultUserDTO.class);
            return new ResultDTO(resultDTO);

        } catch (Exception err) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_error.toString(), lang(language)),
                    1);
        }
    }

    @Override
    public ResultDTO saveAndUpdate(UserDTO dto, String language) throws Exception {
        final String lng = lang(language);
        try {
            // ... (validaciones iguales)

            // ---- Cargar referencias con ValidationUtils (igual)
            final Company company       = validation.requireCompany(dto.getIdCompany(), lng);
            final Subsidiary subsidiary  = validation.requireSubsidiary(dto.getIdSubsidiary(), lng);
            final TypeUser typeUser     = validation.requireTypeUser(dto.getIdTypeUser(), lng);
            final User modifier         = validation.requireUser(dto.getIdModifiedBy(), lng);

            // ---- Unicidad por email (igual)
            Collection<User> byEmail = repository.findByEmail(dto.getEmail().trim());

            User entity;
            User old = new User();

            boolean usedTemporal = false; // <-- para saber si debemos enviar la clave temporal en el correo

            if (dto.getId() != null && dto.getId() > 0) {
                entity = validation.requireUser(dto.getId(), lng);
                for (User u : byEmail) {
                    if (!u.getId().equals(dto.getId())) {
                        return new ResultDTO(false,
                                connectInternalApi.chargeMessage(Message.Msj.return_exist.toString(), lng), 102);
                    }
                }
                BeanUtils.copyProperties(entity, old);
                entity.setLastUpdate(LocalDateTime.now());
                entity.setModifiedBy(modifier);

                // si viene password en el dto, la respetamos; si no, se mantiene la actual
                if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                    String p = dto.getPassword();
                    // Heurística simple: si no trae el punto (formato "hex.iv"), la cifro aquí
                    if (!p.contains(".")) {
                        try { p = securityUtil.encrypt(p); } catch (Exception ignore) {}
                    }
                    entity.setPassword(p);
                }

            } else {
                // ---- Creación
                if (!byEmail.isEmpty()) {
                    return new ResultDTO(false,
                            connectInternalApi.chargeMessage(Message.Msj.return_exist.toString(), lng), 102);
                }
                entity = new User();
                entity.setCreation(LocalDateTime.now());
                entity.setModifiedBy(modifier);

                // ✅ SIEMPRE usar la temporal cifrada de application.properties
                entity.setPassword(temporalPassword);
                usedTemporal = true;
            }

            // ---- Set de relaciones y campos
            entity.setCompany(company);
            entity.setSubsidiary(subsidiary);
            entity.setTypeUser(typeUser);

            entity.setName(dto.getName().trim());
            entity.setLastName(dto.getLastName() != null ? dto.getLastName().trim() : null);
            entity.setEmail(dto.getEmail().trim());
            entity.setDni(dto.getDni() != null ? dto.getDni().trim() : null);
            entity.setCellphone(dto.getCellphone() != null ? dto.getCellphone().trim() : null);

            // default de admin = false si viene null
            entity.setAdmin(dto.getAdmin() != null ? dto.getAdmin() : false);
            entity.setActive(dto.getActive());
            entity.setModifiedBy(modifier);

            // ---- Persistir
            User saved = repository.save(entity);
            saved.setPassword("");

            // ---- Correo
            try {
                String subject = "Bienvenido a HQ CRM";
                StringBuilder body = new StringBuilder();
                body.append("<p>Hola ").append(saved.getName()).append(",</p>")
                        .append("<p>Tu usuario ha sido creado correctamente.</p>");
                if (usedTemporal) {
                    // desencriptamos la temporal para mostrarla al usuario en claro
                    String tempPlain = plainTemporalPassword();
                    body.append("<p>Tu contraseña temporal es: <b>")
                            .append(tempPlain)
                            .append("</b></p>")
                            .append("<p>Por seguridad, cámbiala en tu primer ingreso.</p>");
                } else {
                    body.append("<p>Si olvidaste tu contraseña, puedes usar la opción de recuperación.</p>");
                }

                var emailResult = connectInternalApi.sendEmail(saved.getEmail(), subject, body.toString(), true);
                if (!emailResult.isCorrect()) {
                    System.out.println("WARN sendEmail (alta usuario): " + emailResult.getMessage());
                }
            } catch (Exception ex) {
                System.out.println("WARN sendEmail (alta usuario) ex: " + ex.getMessage());
            }

            // ---- Auditoría (igual)
            if (changeLogUtil != null && eventPublisher != null) {
                List<Map<String, Object>> changes = changeLogUtil.compararEntidades(old, entity);
                eventPublisher.publishEvent(new EntityChangeEvent(entity, changes, modifier.getId()));
            }

            ResultUserDTO resultDTO = modelMapper.map(saved, ResultUserDTO.class);
            return new ResultDTO(resultDTO);

        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }


//    @Override
//    public ResultDTO resetPassword(ResetUserPasswordDTO dto, String language) throws Exception {
//        final String lng = lang(language);
//        try {
//            User user = validation.requireUser(dto.getId(), lng);
//
//            if (dto.getPassword() == null || dto.getPassword().isBlank()) {
//                return new ResultDTO(false,
//                        connectInternalApi.chargeMessage(Message.Msj.passwordIsIncorrect.toString(), lng),
//                        1);
//            }
//
//            try {
//                String oldReq = securityUtil.decrypt(dto.getOldPassword());
//                String oldDb  = securityUtil.decrypt(user.getPassword());
//                if (!Objects.equals(oldReq, oldDb)) {
//                    return new ResultDTO(false,
//                            connectInternalApi.chargeMessage(Message.Msj.passwordIsIncorrect.toString(), lng),
//                            101);
//                }
//            } catch (Exception err) {
//                return new ResultDTO(false,
//                        connectInternalApi.chargeMessage(Message.Msj.passwordIsIncorrect.toString(), lng),
//                        101);
//            }
//
//            user.setPassword(dto.getPassword());
//            User resultUser = repository.save(user);
//            resultUser.setPassword("");
//            try {
//                String subject = "Tu contraseña fue actualizada";
//                String body = String.format(
//                        "<p>Hola %s,</p>" +
//                                "<p>Tu contraseña se actualizó correctamente.</p>",
//                        resultUser.getName()
//                );
//                var emailResult = connectInternalApi.sendEmail(resultUser.getEmail(), subject, body, true);
//                if (!emailResult.isCorrect()) {
//                    System.out.println("WARN sendEmail (reset password): " + emailResult.getMessage());
//                }
//            } catch (Exception ex) {
//                System.out.println("WARN sendEmail (reset password) ex: " + ex.getMessage());
//            }
//
//            ResultUserDTO resultDTO = modelMapper.map(resultUser, ResultUserDTO.class);
//            return new ResultDTO(resultDTO);
//
//        } catch (ValidationException vex) {
//            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
//        } catch (Exception e) {
//            return new ResultDTO(false,
//                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
//                    103, e.getMessage());
//        }
//    }

    @Override
    public ResultDTO getById(long id, String language) throws Exception {
        final String lng = lang(language);
        try {
            User entity = validation.requireUser(id, lng);
            ResultUserDTO dto = userMapper.toDTO(entity);
            return new ResultDTO(dto);
        } catch (ValidationException vex) {
            return new ResultDTO(false, vex.getMessage(), 102, vex.getClass().getSimpleName());
        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }

    @Override
    public ResultDTO getAllItems(UserFilterDTO filterDTO, String language)
            throws URISyntaxException, JsonProcessingException {
        final String lng = lang(language);
        try {
            int page = (filterDTO.getPage() == null || filterDTO.getPage() < 0) ? 0 : filterDTO.getPage();
            int size = (filterDTO.getSize() == null || filterDTO.getSize() <= 0) ? 20 : filterDTO.getSize();
            size = Math.min(size, 200);

            Page<ResultUserDTO> list = customUserRepository.findAllWithCriteria(
                    filterDTO, PageRequest.of(page, size));

            if (list == null || list.getContent().isEmpty()) {
                return new ResultDTO(new PageDTO<ResultUserDTO>(page, size, 0, Collections.emptyList()));
            }
            return new ResultDTO(new PageDTO<ResultUserDTO>(list.getNumber(), list.getSize(), list.getTotalPages(), list.getContent()));

        } catch (Exception e) {
            return new ResultDTO(false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), lng),
                    103, e.getMessage());
        }
    }

    private String plainTemporalPassword() {
        try {
            String p = securityUtil.decrypt(temporalPassword);
            return p.isBlank() || "error in decrypt".equalsIgnoreCase(p) ? "********" : p;
        } catch (Exception e) {
            return "********";
        }
    }
}
