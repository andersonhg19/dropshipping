package com.visnex.acquisitionservice.dto.output;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Result DTO used for returning responses from the API.")
public class ResultDTO {

    @Schema(description = "Indicates if the result is correct.", example = "true")
    @JsonProperty("correct")
    private boolean isCorrect;

    @Schema(description = "Message describing the result.", example = "Operation successful.")
    @JsonProperty("message")
    private String message;

    @Schema(description = "Error code associated with the result.", example = "0")
    @JsonProperty("errorCode")
    private int errorCode;

    @Schema(description = "Object containing the result data.", example = "{}")
    @JsonProperty("object")
    private Object object;

    public ResultDTO() {
    }

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
        return "ResultDTO{" +
                "isCorrect=" + isCorrect +
                ", message='" + message + '\'' +
                ", errorCode=" + errorCode +
                ", object=" + object +
                '}';
    }
}
