package com.visnex.acquisitionservice.util;

import com.visnex.acquisitionservice.dto.output.*;
import com.visnex.acquisitionservice.security.ConnectInternalApi;
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

        Long companyId = null;
        Long subsidiaryId = null;
        Long modifiedById = null;

        if (dto instanceof ResultSupplierDTO d) {
            companyId = d.getCompanyId(); subsidiaryId = d.getSubsidiaryId(); modifiedById = d.getIdModifiedBy();
            d.setCompanyName(resolveCompanyName(companyId, language));
            d.setSubsidiaryName(resolveSubsidiaryName(subsidiaryId, language));
            d.setModifiedBy(resolveUserName(modifiedById, language));
        } else if (dto instanceof ResultSourceConfigDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultSourceProductDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultImportJobDTO d) {
            d.setCompanyName(resolveCompanyName(d.getCompanyId(), language));
            d.setSubsidiaryName(resolveSubsidiaryName(d.getSubsidiaryId(), language));
            d.setModifiedBy(resolveUserName(d.getIdModifiedBy(), language));
        } else if (dto instanceof ResultImportTemplateDTO d) {
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
