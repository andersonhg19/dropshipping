package com.visnex.dto.output;

import lombok.*;

@Builder
@NoArgsConstructor
@Getter
@Setter
public class ResultDTO {

    private boolean isCorrect;

    private String message;

    private int errorCode;

    private Object object;

    // Constructor
    public ResultDTO(boolean isCorrect, String message, int errorCode, Object object) {
        this.isCorrect = isCorrect;
        this.message = message;
        this.errorCode = errorCode;
        this.object = object;
    }

    public ResultDTO(Object object) {
        this.isCorrect = true;
        this.message = "OK";
        this.errorCode = 0;
        this.object = object;
    }

    public ResultDTO(boolean isCorrect, String message, int errorCode) {
        this.isCorrect = isCorrect;
        this.message = message;
        this.errorCode = errorCode;
        this.object = null;
    }

    @Override
    public String toString() {
        return "Result{" +
                "isCorrect=" + isCorrect +
                ", message='" + message + '\'' +
                ", errorCode=" + errorCode +
                ", object=" + object +
                '}';
    }
}
