package com.visnex.administrationservice.enums;

import lombok.Getter;

public class TypeDocument {
    public enum List {

        //RC ("RC",  11, "Registro civil",                    "Civil registry"),
        //TI ("TI",  12, "Tarjeta de identidad",              "Identity card (minor)"),
        CC("CC", 13, "Cédula de ciudadanía", "Citizenship ID"),
        //TE ("TE",  21, "Tarjeta de extranjería",            "Foreigner ID card"),
        CE("CE", 22, "Cédula de extranjería", "Foreigner ID"),
        NIT("NIT", 31, "Número de Identificación Tributaria", "Tax Identification Number"),
        PAS("PAS", 41, "Pasaporte", "Passport"),
        //DIFE("DIFE",42, "Documento de identificación extranjero","Foreign identification"),
        PEP("PEP", 44, "Permiso Especial de Permanencia", "Special Stay Permit"),
        //PPT("PPT", 47, "Permiso por Protección Temporal",   "Temporary Protection Permit"),
        //NIT_EXT("NIT_EXT", 50, "NIT de otro país",          "Foreign Tax ID"),
        OTRO("OTR", 0, "Otro", "Other");

        @Getter
        private final String code;
        @Getter
        private final int dianCode;
        private final String nameEs;
        private final String nameEn;

        List(String code, int dianCode, String nameEs, String nameEn) {
            this.code = code;
            this.dianCode = dianCode;
            this.nameEs = nameEs;
            this.nameEn = nameEn;
        }

        public String getName(String language) {
            return language != null && language.equalsIgnoreCase("es") ? nameEs : nameEn;
        }

    }
}
