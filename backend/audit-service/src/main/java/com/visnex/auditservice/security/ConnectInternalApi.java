package com.visnex.auditservice.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.Optional;

@Service
public class ConnectInternalApi {
    
    private RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${languageMicroserviceUrl}")
    String languageMicroserviceUrl;
    
    @Value("${secretUser}")
    String secretUser;
    
    @Value("${secretKey}")
    String secretKey;
    
    @Value("${authUrl}")
    String authUrl;
    
    @Value("${administrationMicroserviceUrl}")
    String administrationMicroserviceUrl;
    
    private String gLanguage;
    
    @PostConstruct
    public void initialize() {
        if (restTemplate == null) {
            this.restTemplate = new RestTemplate();
        }
        this.gLanguage = "es";
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
            }
        } catch (Exception e) {
            System.err.println("Failed to generate token: " + e.getMessage());
        }
        return "";
    }
    
    private static String parseTokenFromResponse(String responseBody) {
        if (responseBody == null || !responseBody.contains("\"token\"")) {
            return "";
        }
        try {
            int start = responseBody.indexOf("\"token\":\"") + 9;
            int end = responseBody.indexOf("\"", start);
            if (end > start) {
                return responseBody.substring(start, end);
            }
        } catch (Exception e) {
            // Ignore
        }
        return "";
    }
    
    public String chargeMessage(String key, String language) {
        try {
            String url = languageMicroserviceUrl + key;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + generateToken());
            HttpEntity<String> request = new HttpEntity<>(headers);
            
            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            return resp.getBody() != null ? resp.getBody() : key;
        } catch (Exception e) {
            return key;
        }
    }
    
    public Optional<Map<String, Object>> adminGetCompany(Long companyId, String language) {
        try {
            String url = administrationMicroserviceUrl + "company/get/" + companyId;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + generateToken());
            headers.set("lng", language != null ? language : "es");
            HttpEntity<String> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            if (resp.getBody() != null && resp.getBody().containsKey("object")) {
                Object obj = resp.getBody().get("object");
                if (obj instanceof Map) {
                    return Optional.of((Map<String, Object>) obj);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to get company " + companyId + ": " + e.getMessage());
        }
        return Optional.empty();
    }
    
    public Optional<Map<String, Object>> adminGetSubsidiary(Long subsidiaryId, String language) {
        try {
            String url = administrationMicroserviceUrl + "subsidiary/get/" + subsidiaryId;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + generateToken());
            headers.set("lng", language != null ? language : "es");
            HttpEntity<String> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            if (resp.getBody() != null && resp.getBody().containsKey("object")) {
                Object obj = resp.getBody().get("object");
                if (obj instanceof Map) {
                    return Optional.of((Map<String, Object>) obj);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to get subsidiary " + subsidiaryId + ": " + e.getMessage());
        }
        return Optional.empty();
    }
    
    public Optional<Map<String, Object>> adminGetUser(Long userId, String language) {
        try {
            String url = administrationMicroserviceUrl + "user/get/" + userId;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + generateToken());
            headers.set("lng", language != null ? language : "es");
            HttpEntity<String> request = new HttpEntity<>(headers);
            
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            if (resp.getBody() != null && resp.getBody().containsKey("object")) {
                Object obj = resp.getBody().get("object");
                if (obj instanceof Map) {
                    return Optional.of((Map<String, Object>) obj);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to get user " + userId + ": " + e.getMessage());
        }
        return Optional.empty();
    }
}

