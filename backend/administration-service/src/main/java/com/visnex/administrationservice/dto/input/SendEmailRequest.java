package com.visnex.administrationservice.dto.input;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class SendEmailRequest {
  @NotEmpty private List<@Email String> to;
  private List<@Email String> cc;
  private List<@Email String> bcc;
  @NotBlank private String subject;
  @NotBlank private String body;
  private boolean html = true;
}
