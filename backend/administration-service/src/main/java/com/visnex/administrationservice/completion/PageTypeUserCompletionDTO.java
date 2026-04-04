package com.visnex.administrationservice.completion;

public interface PageTypeUserCompletionDTO {
    Long   getIdPage();
    void   setNpage(String npage);
    String getNpage();

    String getPageName();
    void   setPageName(String name);

    Long   getIdModule();
    void   setIdModule(Long idModule);
    String getModuleName();
    void   setModuleName(String moduleName);

    Long   getIdTypeUser();
    String getTypeUserName();
    void   setTypeUserName(String name);

    Long   getIdModifiedBy();
    String getModifiedBy();
    void   setModifiedBy(String name);
}
