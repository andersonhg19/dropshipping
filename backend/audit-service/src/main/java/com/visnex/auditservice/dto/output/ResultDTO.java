package com.visnex.auditservice.dto.output;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResultDTO {
    private boolean correct;
    private String message;
    private int code;
    private Object object;
    
    public ResultDTO(Object object) {
        this.correct = true;
        this.message = "Ok";
        this.code = 0;
        this.object = object;
    }
    
    public ResultDTO(boolean correct, String message, int code) {
        this.correct = correct;
        this.message = message;
        this.code = code;
    }
    
    public ResultDTO(boolean correct, String message, int code, Object object) {
        this.correct = correct;
        this.message = message;
        this.code = code;
        this.object = object;
    }
}

