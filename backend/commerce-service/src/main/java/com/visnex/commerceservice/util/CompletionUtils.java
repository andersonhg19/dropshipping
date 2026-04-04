package com.visnex.commerceservice.util;

import com.visnex.commerceservice.dto.output.*;
import com.visnex.commerceservice.security.ConnectInternalApi;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CompletionUtils {

    private final ConnectInternalApi api;

    private final ConcurrentHashMap<Long, String> companyCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, String> subsidiaryCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, String> userCache = new ConcurrentHashMap<>();

    public CompletionUtils(ConnectInternalApi api) {
        this.api = api;
    }

    public void enrich(Object dto, String language) {
        if (dto == null) return;

        if (dto instanceof ResultProductDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultCategoryDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultProductImageDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultPricingConfigDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultPromotionDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultPublishChannelDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultProductPublishDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultEnrichmentConfigDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultPromptTemplateDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        }
    }

    public void enrichList(List<?> list, String language) {
        if (list == null || list.isEmpty()) return;
        list.forEach(dto -> enrich(dto, language));
    }

    private String resolveCompanyName(Long companyId, String language) {
        if (companyId == null) return null;
        return companyCache.computeIfAbsent(companyId, id -> {
            try {
                return api.adminGetCompanyName(id, language);
            } catch (Exception e) {
                return null;
            }
        });
    }

    private String resolveSubsidiaryName(Long subsidiaryId, String language) {
        if (subsidiaryId == null) return null;
        return subsidiaryCache.computeIfAbsent(subsidiaryId, id -> {
            try {
                return api.adminGetSubsidiaryName(id, language);
            } catch (Exception e) {
                return null;
            }
        });
    }

    private String resolveUserName(Long userId, String language) {
        if (userId == null) return null;
        return userCache.computeIfAbsent(userId, id -> {
            try {
                return api.adminGetUserName(id, language);
            } catch (Exception e) {
                return null;
            }
        });
    }
}
