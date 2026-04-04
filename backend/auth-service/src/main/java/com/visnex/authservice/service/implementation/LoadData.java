package com.visnex.authservice.service.implementation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.authservice.entity.Mail;
import com.visnex.authservice.repository.MailRepository;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class LoadData {

    private final MailRepository mailRepository;

    public LoadData(MailRepository mailRepository) {
        this.mailRepository = mailRepository;
    }

    public void seedData() {
        try {
            loadAndSaveEntities("dataSeeder/mailData.json", Mail.class, mailRepository);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private <T> void loadAndSaveEntities(String fileName, Class<T> entityClass, Object repository) throws IOException {
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream(fileName);

        if (inputStream == null) {
            throw new IOException("File not found: " + fileName);
        }

        ObjectMapper objectMapper = new ObjectMapper();
        List<T> entities = objectMapper.readValue(inputStream, objectMapper.getTypeFactory().constructCollectionType(List.class, entityClass));

        if (repository instanceof MailRepository && entityClass.equals(Mail.class)) {
            if (mailRepository.findAll().isEmpty()) {
                mailRepository.saveAll((List<Mail>) entities);
            }
        }
    }
}
