package com.visnex.acquisitionservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.acquisitionservice.entity.*;
import com.visnex.acquisitionservice.enums.Message;
import com.visnex.acquisitionservice.exception.ValidationException;
import com.visnex.acquisitionservice.repository.*;
import com.visnex.acquisitionservice.security.ConnectInternalApi;
import org.springframework.stereotype.Service;

import java.net.URISyntaxException;

@Service
public class ValidationUtils {

    private final SupplierRepository supplierRepo;
    private final SourceConfigRepository sourceConfigRepo;
    private final SourceProductRepository sourceProductRepo;
    private final ImportJobRepository importJobRepo;
    private final ImportTemplateRepository importTemplateRepo;
    private final ConnectInternalApi api;

    public ValidationUtils(SupplierRepository supplierRepo,
                           SourceConfigRepository sourceConfigRepo,
                           SourceProductRepository sourceProductRepo,
                           ImportJobRepository importJobRepo,
                           ImportTemplateRepository importTemplateRepo,
                           ConnectInternalApi api) {
        this.supplierRepo = supplierRepo;
        this.sourceConfigRepo = sourceConfigRepo;
        this.sourceProductRepo = sourceProductRepo;
        this.importJobRepo = importJobRepo;
        this.importTemplateRepo = importTemplateRepo;
        this.api = api;
    }

    /* =========================
       VALIDACIONES
       ========================= */

    public Supplier requireSupplier(Long id, String language) {
        requirePositive(id, "idSupplier", language);
        return supplierRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.supplierNotFound.toString(), language, id)));
    }

    public SourceConfig requireSourceConfig(Long id, String language) {
        requirePositive(id, "idSourceConfig", language);
        return sourceConfigRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.sourceConfigNotFound.toString(), language, id)));
    }

    public SourceProduct requireSourceProduct(Long id, String language) {
        requirePositive(id, "idSourceProduct", language);
        return sourceProductRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.sourceProductNotFound.toString(), language, id)));
    }

    public ImportJob requireImportJob(Long id, String language) {
        requirePositive(id, "idImportJob", language);
        return importJobRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.importJobNotFound.toString(), language, id)));
    }

    public ImportTemplate requireImportTemplate(Long id, String language) {
        requirePositive(id, "idImportTemplate", language);
        return importTemplateRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.importTemplateNotFound.toString(), language, id)));
    }

    /* =========================
       UTILIDADES COMUNES
       ========================= */

    private void requirePositive(Long id, String fieldName, String language) {
        if (id == null || id <= 0) {
            throw new ValidationException(
                msg(Message.Msj.return_field_is_required.toString(), language) + " " + fieldName
            );
        }
    }

    private String msg(String key, String language) {
        try {
            return api.chargeMessage(key, language);
        } catch (URISyntaxException | JsonProcessingException e) {
            throw new ValidationException("Error cargando mensajes (" + key + "): " + e.getMessage());
        }
    }

    private String fmt(String key, String language, Object... args) {
        return String.format(msg(key, language), args);
    }
}
