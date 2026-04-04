package com.visnex.commerceservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.visnex.commerceservice.entity.*;
import com.visnex.commerceservice.enums.Message;
import com.visnex.commerceservice.exception.ValidationException;
import com.visnex.commerceservice.repository.*;
import com.visnex.commerceservice.security.ConnectInternalApi;
import org.springframework.stereotype.Service;

import java.net.URISyntaxException;

@Service
public class ValidationUtils {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final ProductImageRepository productImageRepo;
    private final PricingConfigRepository pricingConfigRepo;
    private final PromotionRepository promotionRepo;
    private final PublishChannelRepository publishChannelRepo;
    private final ProductPublishRepository productPublishRepo;
    private final EnrichmentConfigRepository enrichmentConfigRepo;
    private final PromptTemplateRepository promptTemplateRepo;
    private final ConnectInternalApi api;

    public ValidationUtils(ProductRepository productRepo,
                           CategoryRepository categoryRepo,
                           ProductImageRepository productImageRepo,
                           PricingConfigRepository pricingConfigRepo,
                           PromotionRepository promotionRepo,
                           PublishChannelRepository publishChannelRepo,
                           ProductPublishRepository productPublishRepo,
                           EnrichmentConfigRepository enrichmentConfigRepo,
                           PromptTemplateRepository promptTemplateRepo,
                           ConnectInternalApi api) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.productImageRepo = productImageRepo;
        this.pricingConfigRepo = pricingConfigRepo;
        this.promotionRepo = promotionRepo;
        this.publishChannelRepo = publishChannelRepo;
        this.productPublishRepo = productPublishRepo;
        this.enrichmentConfigRepo = enrichmentConfigRepo;
        this.promptTemplateRepo = promptTemplateRepo;
        this.api = api;
    }

    /* =========================
       VALIDACIONES
       ========================= */

    public Product requireProduct(Long id, String language) {
        requirePositive(id, "idProduct", language);
        return productRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.productNotFound.toString(), language, id)));
    }

    public Category requireCategory(Long id, String language) {
        requirePositive(id, "idCategory", language);
        return categoryRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.categoryNotFound.toString(), language, id)));
    }

    public ProductImage requireProductImage(Long id, String language) {
        requirePositive(id, "idProductImage", language);
        return productImageRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.productImageNotFound.toString(), language, id)));
    }

    public PricingConfig requirePricingConfig(Long id, String language) {
        requirePositive(id, "idPricingConfig", language);
        return pricingConfigRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.pricingConfigNotFound.toString(), language, id)));
    }

    public Promotion requirePromotion(Long id, String language) {
        requirePositive(id, "idPromotion", language);
        return promotionRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.promotionNotFound.toString(), language, id)));
    }

    public PublishChannel requirePublishChannel(Long id, String language) {
        requirePositive(id, "idPublishChannel", language);
        return publishChannelRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.publishChannelNotFound.toString(), language, id)));
    }

    public ProductPublish requireProductPublish(Long id, String language) {
        requirePositive(id, "idProductPublish", language);
        return productPublishRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.productPublishNotFound.toString(), language, id)));
    }

    public EnrichmentConfig requireEnrichmentConfig(Long id, String language) {
        requirePositive(id, "idEnrichmentConfig", language);
        return enrichmentConfigRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.enrichmentConfigNotFound.toString(), language, id)));
    }

    public PromptTemplate requirePromptTemplate(Long id, String language) {
        requirePositive(id, "idPromptTemplate", language);
        return promptTemplateRepo.findById(id).orElseThrow(() ->
            new ValidationException(fmt(Message.Msj.promptTemplateNotFound.toString(), language, id)));
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
