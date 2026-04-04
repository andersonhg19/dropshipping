package com.visnex.administrationservice.util;

import com.visnex.administrationservice.completion.PageTypeUserCompletionDTO;
import com.visnex.administrationservice.dto.output.ResultPageTypeUserDTO;
import com.visnex.administrationservice.entity.Pages;
import com.visnex.administrationservice.entity.TypeUser;
import com.visnex.administrationservice.repository.PagesRepository;
import com.visnex.administrationservice.repository.TypeUserRepository;
import com.visnex.administrationservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class CompletionUtils {

    private final PagesRepository pagesRepository;
    private final TypeUserRepository typeUserRepository;
    private final UserRepository userRepository;

    private final Map<Long, String> pageNpageCache   = new ConcurrentHashMap<>();
    private final Map<Long, String> pageNameCache    = new ConcurrentHashMap<>();
    private final Map<Long, Long>   pageModuleIdCache= new ConcurrentHashMap<>();
    private final Map<Long, String> pageModuleNameCache = new ConcurrentHashMap<>();

    private final Map<Long, String> typeUserNameCache= new ConcurrentHashMap<>();
    private final Map<Long, String> userFullNameCache= new ConcurrentHashMap<>();

    public void enrich(Object dto, String language) {
        if (dto instanceof ResultPageTypeUserDTO r) {
            enrichPageTypeUserDTO(r);
            return;
        }
        if (dto instanceof PageTypeUserCompletionDTO p) {
            enrichPageTypeUser(p);
        }
    }

    public void enrichList(List<?> list, String language) {
        if (list == null) return;
        list.forEach(d -> enrich(d, language));
    }

    private void enrichPageTypeUserDTO(ResultPageTypeUserDTO dto) {
        if (dto.getIdPage() == null) return;

        // npage
        if (dto.getNpage() == null || dto.getNpage().isBlank()) {
            String npage = pageNpageCache.computeIfAbsent(dto.getIdPage(), id ->
                    pagesRepository.findById(id).map(Pages::getNpage).orElse(null)
            );
            dto.setNpage(npage);
        }

        // (opcionales) si quieres robustecer:
        if (dto.getPageName() == null || dto.getPageName().isBlank()) {
            String pageName = pageNameCache.computeIfAbsent(dto.getIdPage(), id ->
                    pagesRepository.findById(id).map(Pages::getName).orElse(null)
            );
            dto.setPageName(pageName);
        }
    }


    private void enrichPageTypeUser(PageTypeUserCompletionDTO dto) {
        // 1) Pages → npage, pageName, module
        if (dto.getIdPage() != null) {
            Long idPage = dto.getIdPage();

            String npage = pageNpageCache.computeIfAbsent(idPage, id ->
                    pagesRepository.findById(id).map(Pages::getNpage).orElse(null)
            );
            if (dto.getNpage() == null) dto.setNpage(npage);

            String pageName = pageNameCache.computeIfAbsent(idPage, id ->
                    pagesRepository.findById(id).map(Pages::getName).orElse(null)
            );
            if (dto.getPageName() == null) dto.setPageName(pageName);

            Long idModule = pageModuleIdCache.computeIfAbsent(idPage, id ->
                    pagesRepository.findById(id).map(p -> p.getModule() != null ? p.getModule().getId() : null).orElse(null)
            );
            if (dto.getIdModule() == null) dto.setIdModule(idModule);

            String moduleName = pageModuleNameCache.computeIfAbsent(idPage, id ->
                    pagesRepository.findById(id).map(p -> p.getModule() != null ? p.getModule().getName() : null).orElse(null)
            );
            if (dto.getModuleName() == null) dto.setModuleName(moduleName);
        }

        // 2) TypeUser → name
        if (dto.getIdTypeUser() != null && (dto.getTypeUserName() == null || dto.getTypeUserName().isBlank())) {
            String name = typeUserNameCache.computeIfAbsent(dto.getIdTypeUser(), id ->
                    typeUserRepository.findById(id).map(TypeUser::getName).orElse(null)
            );
            dto.setTypeUserName(name);
        }

        // 3) ModifiedBy → full name
        if (dto.getIdModifiedBy() != null && (dto.getModifiedBy() == null || dto.getModifiedBy().isBlank())) {
            String fullName = userFullNameCache.computeIfAbsent(dto.getIdModifiedBy(), id ->
                    userRepository.findById(id).map(u -> (u.getName() + " " + u.getLastName()).trim()).orElse(null)
            );
            dto.setModifiedBy(fullName);
        }
    }
}
