package com.visnex.administrationservice.enums;

public class Message {
    public enum Msj {
        return_exist,
        return_update,
        return_error,
        return_field_is_required,
        return_not_exist_the_entity_with_id,
        return_instruction_is_not_recognized,
        return_the_x_sent_as_a_parameter_in_the_x_field_is_not_recognized,
        return_process_error,
        entityNotFound,
        passwordIsIncorrect,
        pageNotFound,
        thisNitExists,
        fatherIsInvalid,
        countryNotFount,
        userNotFount,
        notHaveCreationPermissions,//No tiene permisos de creación.
        notExistTheEntityWithParameters,
        moduleNotFound,
        thisNameExists,
        typeUserNotFound,
        companyNotFound, bodyRequired
    }
}
