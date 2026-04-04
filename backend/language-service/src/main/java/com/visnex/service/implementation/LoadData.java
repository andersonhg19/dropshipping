package com.visnex.service.implementation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visnex.entity.Keyword;
import com.visnex.entity.Language;
import com.visnex.entity.MessageLabels;
import com.visnex.repository.KeywordRepository;
import com.visnex.repository.LanguageRepository;
import com.visnex.repository.MessageLabelsRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LoadData {

    private final KeywordRepository keywordRepository;
    private final LanguageRepository languageRepository;
    private final MessageLabelsRepository messageLabelsRepository;

    public LoadData(KeywordRepository keywordRepository, LanguageRepository languageRepository,
                    MessageLabelsRepository messageLabelsRepository) {
        this.keywordRepository = keywordRepository;
        this.languageRepository = languageRepository;
        this.messageLabelsRepository = messageLabelsRepository;
    }

    public void seedData() {
        try {
            // Load and save Keywords entities from the "keywordData.json" file
            loadAndSaveEntities("dataSeeder/keywordData.json", Keyword.class, keywordRepository);

            // Load and save MessageLabels entities from the "messageLabelsData.json" file
            loadAndSaveEntities("dataSeeder/messageLabelsData.json", MessageLabels.class, messageLabelsRepository);

            // Load and save Language entities from the "languageData.json" file
            loadAndSaveEntities("dataSeeder/languageData.json", Language.class, languageRepository);

            System.out.println("Seed data loaded into the database.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Generic method to load and save entities.
     *
     * @param fileName
     * @param entityClass
     * @param repository
     * @param <T>
     * @throws IOException
     */
    @SuppressWarnings("unchecked")
    private <T> void loadAndSaveEntities(String fileName, Class<T> entityClass, Object repository) throws IOException {
        // Get the input stream from the classpath for the specified file
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream(fileName);

        if (inputStream == null) {
            throw new IOException("File not found: " + fileName);
        }

        // Use ObjectMapper to read the array directly from the JSON file
        ObjectMapper objectMapper = new ObjectMapper();
        List<T> entities = objectMapper.readValue(inputStream,
                objectMapper.getTypeFactory().constructCollectionType(List.class, entityClass));

        // Set creation and lastUpdate fields
        LocalDateTime now = LocalDateTime.now();

        for (T entity : entities) {
            if (entity instanceof Keyword) {
                Keyword keyword = (Keyword) entity;
                Optional<Keyword> existingKeyword = keywordRepository.findByKey(keyword.getKey());
                if (existingKeyword.isPresent()) {
                    Keyword existing = existingKeyword.get();
                    existing.setLastUpdate(now);
                    keywordRepository.save(existing);
                } else {
                    keyword.setCreation(now);
                    keyword.setLastUpdate(now);
                    keywordRepository.save(keyword);
                }
            } else if (entity instanceof Language) {
                Language language = (Language) entity;
                Optional<Language> existingLanguage = languageRepository.findByLanguage(language.getLanguage());
                if (existingLanguage.isPresent()) {
                    Language existing = existingLanguage.get();
                    existing.setLastUpdate(now);
                    languageRepository.save(existing);
                } else {
                    language.setCreation(now);
                    language.setLastUpdate(now);
                    languageRepository.save(language);
                }
            } else if (entity instanceof MessageLabels) {
                MessageLabels messageLabels = (MessageLabels) entity;
                Optional<MessageLabels> existingMessageLabels = messageLabelsRepository.findByIdkeyAndIdlanguage(messageLabels.getIdkey(), messageLabels.getIdlanguage());
                if (existingMessageLabels.isPresent()) {
                    MessageLabels existing = existingMessageLabels.get();
                    existing.setLastUpdate(now);
                    messageLabelsRepository.save(existing);
                } else {
                    messageLabels.setCreation(now);
                    messageLabels.setLastUpdate(now);
                    messageLabelsRepository.save(messageLabels);
                }
            }
        }
    }
}
