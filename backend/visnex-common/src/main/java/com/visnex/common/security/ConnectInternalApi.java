package com.visnex.common.security;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.common.dto.ResultDTO;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ConnectInternalApi {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${languageMicroserviceUrl}")
    String languageMicroserviceUrl;

    @Value("${secretUser}")
    String secretUser;

    @Value("${secretKey}")
    String secretKey;

    @Value("${authUrl}")
    String authUrl;

    @Value("${administrationMicroserviceUrl:http://gateway-service:8841/ADMINISTRATION-SERVICE/vn-api/v2/}")
    String administrationMicroserviceUrl;

    @Value("${language:es}")
    private String gLanguage;

    @PostConstruct
    public void initialize() {
        if (restTemplate == null) {
            this.restTemplate = new RestTemplate();
        }
        if (languageMicroserviceUrl == null) {
            this.languageMicroserviceUrl = "http://localhost:8841/LANGUAGE-SERVICE/vn-api/v2/message/getOneMessage/";
        }
        if (gLanguage == null) {
            this.gLanguage = "es";
        }
    }

    private String generateToken() {
        try {
            String url = authUrl + "/internalLogin";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String requestBody = "{\"username\":\"" + secretUser + "\", \"password\":\"" + secretKey + "\"}";
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> responseEntity = restTemplate.postForEntity(url, requestEntity, String.class);

            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                String responseBody = responseEntity.getBody();
                return parseTokenFromResponse(responseBody);
            } else {
                log.error("Error: Server not found");
                return "";
            }
        } catch (HttpServerErrorException e) {
            log.error("Server error: {} - {}", e.getRawStatusCode(), e.getStatusText());
        } catch (Exception e) {
            log.error("Error generating internal token: {}", e.getMessage());
        }
        return "";
    }

    public String getInternalBearerToken() {
        String t = generateToken();
        return (t == null) ? "" : t;
    }

    private String parseTokenFromResponse(String responseBody) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);
            return root.path("token").asText("");
        } catch (Exception e) {
            log.error("Failed to parse token from response", e);
            return "";
        }
    }

    public String chargeMessage(String key, String language) throws URISyntaxException, JsonProcessingException {
        if (language != null && !language.isEmpty())
            this.gLanguage = language;

        String url = languageMicroserviceUrl + key + "/" + gLanguage;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + generateToken());

        RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, new URI(url));
        ResponseEntity<String> responseEntity = restTemplate.exchange(requestEntity, String.class);
        String responseBody = responseEntity.getBody();

        ObjectMapper objectMapper = new ObjectMapper();
        ResultDTO returnService = objectMapper.readValue(responseBody, ResultDTO.class);

        return returnService.getObject().toString();
    }

    public Optional<Map<String, Object>> adminGetCompany(Long idCompany, String language) {
        try {
            if (idCompany == null) return Optional.empty();
            if (language != null && !language.isBlank()) this.gLanguage = language;

            String url = administrationMicroserviceUrl + "company/get/" + idCompany;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + generateToken());
            headers.set("lng", language != null ? language : this.gLanguage);
            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            ResultDTO result = new ObjectMapper().readValue(resp.getBody(), ResultDTO.class);
            if (result.isCorrect() && result.getObject() instanceof Map) {
                return Optional.of((Map<String, Object>) result.getObject());
            }
        } catch (Exception e) {
            log.error("adminGetCompany error: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Map<String, Object>> adminGetSubsidiary(Long idSubsidiary, String language) {
        try {
            if (idSubsidiary == null) return Optional.empty();
            if (language != null && !language.isBlank()) this.gLanguage = language;

            String url = administrationMicroserviceUrl + "subsidiary/get/" + idSubsidiary;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + generateToken());
            headers.set("lng", language != null ? language : this.gLanguage);
            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            ResultDTO result = new ObjectMapper().readValue(resp.getBody(), ResultDTO.class);
            if (result.isCorrect() && result.getObject() instanceof Map) {
                return Optional.of((Map<String, Object>) result.getObject());
            }
        } catch (Exception e) {
            log.error("adminGetSubsidiary error: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public String adminGetCompanyName(Long id, String language) {
        return adminGetCompany(id, language).map(m -> (String) m.get("name")).orElse(null);
    }

    public String adminGetSubsidiaryName(Long id, String language) {
        return adminGetSubsidiary(id, language).map(m -> (String) m.get("name")).orElse(null);
    }

    public String adminGetUserName(Long id, String language) {
        return adminGetUser(id, language).map(m -> {
            String name = (String) m.get("name");
            String lastName = (String) m.get("lastName");
            return (name != null ? name : "") + (lastName != null ? " " + lastName : "");
        }).orElse(null);
    }

    public Optional<Map<String, Object>> adminGetUser(Long idUser, String language) {
        try {
            if (idUser == null) return Optional.empty();
            if (language != null && !language.isBlank()) this.gLanguage = language;

            String url = administrationMicroserviceUrl + "user/get/" + idUser;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + generateToken());
            headers.set("lng", language != null ? language : this.gLanguage);
            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            ResultDTO result = new ObjectMapper().readValue(resp.getBody(), ResultDTO.class);
            if (result.isCorrect() && result.getObject() instanceof Map) {
                return Optional.of((Map<String, Object>) result.getObject());
            }
        } catch (Exception e) {
            log.error("adminGetUser error: {}", e.getMessage());
        }
        return Optional.empty();
    }
}
