package com.visnex.administrationservice.security;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.administrationservice.config.AppConfig;
import com.visnex.administrationservice.dto.output.ResultDTO;

import jakarta.annotation.PostConstruct;

@Service
public class ConnectInternalApi {

    @Autowired
    private AppConfig appConfig;
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
    
    @Value("${administrationMicroserviceUrl:http://gateway-service:8820/ADMINISTRATION-SERVICE/vn-api/v2/}")
    String administrationMicroserviceUrl;
    
    private String gLanguage;
    private volatile boolean initialized = false;

    @Value("${notificationMicroserviceUrl:${notificationServiceUrl}/email/send}")
    String notificationMicroserviceUrl;


    @PostConstruct
    public void initialize() {
        if(appConfig==null) {
            this.appConfig = new AppConfig();
        }
        if(restTemplate==null) {
            this.restTemplate = new RestTemplate();
        }
        if(languageMicroserviceUrl==null) {
            this.languageMicroserviceUrl = "http://localhost:8888/LANGUAGE-SERVICE/vn-api/v2/message/getOneMessage/";
        }
        this.gLanguage = appConfig.getLanguage();
    }

    private String GenerateToken() {

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
                //Mensaje que no se lo puede tener en el servicio de Language porque no hay como consultar.
                System.out.println("Error: Server no found");
                return "";
            }
        }catch (HttpServerErrorException e) {
            //Mensaje que no se lo puede tener en el servicio de Language porque no hay como consultar.
            System.out.println("Server Error: " + e.getRawStatusCode() + " - " + e.getStatusText());
        } catch (Exception e) {
            //Mensaje que no se lo puede tener en el servicio de Language porque no hay como consultar.
            System.out.println("Error: " + e.getMessage());
        }
        return "";
    }

    public String getInternalBearerToken() {
        String t = GenerateToken();
        return (t == null) ? "" : t;
    }


    private static String parseTokenFromResponse(String responseBody) {
        return responseBody.substring(responseBody.indexOf("\"token\":\"") + 8, responseBody.indexOf("\",\"username\"")).replace("\"","");
    }

    public String chargeMessage(String key, String language) throws URISyntaxException, JsonProcessingException {
        if(language != null && !language.isEmpty())
            this.gLanguage = language;

        String url = languageMicroserviceUrl + key + "/" + gLanguage;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + GenerateToken());

        RequestEntity<Void> requestEntity = new RequestEntity<>(headers, HttpMethod.GET, new URI(url));
        ResponseEntity<String> responseEntity = restTemplate.exchange(requestEntity, String.class);
        String responseBody = responseEntity.getBody();
        System.out.println(responseBody);

        ObjectMapper objectMapper = new ObjectMapper();
        ResultDTO returnService = objectMapper.readValue(responseBody, ResultDTO.class);

        return returnService.getObject().toString();
    }

    public String chargeMessage(String key) {
        initialize();
        String url = languageMicroserviceUrl + key + "/" + gLanguage;
        return restTemplate.getForObject(url, String.class);
    }

    public ResultDTO sendEmail(String to, String subject, String body, boolean html) {
        return sendEmail(List.of(to), List.of(), List.of(), subject, body, html);
    }

    public ResultDTO sendEmail(List<String> to, List<String> cc, List<String> bcc,
                               String subject, String body, boolean html) {
        try {
            // 1) Token interno desde AUTH
            String token = GenerateToken();
            if (token == null || token.isBlank()) {
                return new ResultDTO(false, "No se pudo obtener token interno", 101);
            }

            // 2) Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + token);

            // 3) Payload (lo que espera notification-service)
            Map<String, Object> payload = new HashMap<>();
            payload.put("to", to);
            if (cc != null && !cc.isEmpty())  payload.put("cc", cc);
            if (bcc != null && !bcc.isEmpty()) payload.put("bcc", bcc);
            payload.put("subject", subject);
            payload.put("body", body);
            payload.put("html", html);

            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(payload);

            HttpEntity<String> requestEntity = new HttpEntity<>(json, headers);

            // 4) POST → notification-service (vía gateway)
            ResponseEntity<String> response = restTemplate.postForEntity(
                    new URI(notificationMicroserviceUrl), requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return new ResultDTO(true, "OK", 0);
            } else {
                return new ResultDTO(false, "Notification-service rechazó la solicitud", 102,
                        "status=" + response.getStatusCode());
            }

        } catch (HttpServerErrorException e) {
            return new ResultDTO(false, "Error del servidor en notification-service", 103,
                    e.getRawStatusCode() + " - " + e.getStatusText());
        } catch (Exception e) {
            return new ResultDTO(false, "Error al invocar notification-service", 103, e.getMessage());
        }
    }
    
    /**
     * Get User by ID from administration-service.
     * Since this is administration-service itself, we call the internal endpoint via gateway.
     * 
     * @param idUser user identifier
     * @param language language code
     * @return Optional containing the User map, or empty if not found
     */
    public Optional<Map<String, Object>> adminGetUser(Long idUser, String language) {
        try {
            if (idUser == null) return Optional.empty();
            if (language != null && !language.isBlank()) this.gLanguage = language;

            // Call internal endpoint via gateway to maintain consistency
            String url = administrationMicroserviceUrl + "user/get/" + idUser;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + GenerateToken());
            headers.set("lng", language != null ? language : this.gLanguage);
            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            ResultDTO result = new ObjectMapper().readValue(resp.getBody(), ResultDTO.class);
            if (result.isCorrect() && result.getObject() instanceof Map) {
                return Optional.of((Map<String, Object>) result.getObject());
            }
        } catch (Exception e) {
            System.out.println("adminGetUser error: " + e.getMessage());
        }
        return Optional.empty();
    }
}


