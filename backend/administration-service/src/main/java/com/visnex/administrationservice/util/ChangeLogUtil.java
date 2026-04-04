package com.visnex.administrationservice.util;


import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Component
public class ChangeLogUtil<T> {

    public List<Map<String, Object>> compararEntidades(T oldEntity, T newEntity) {
        List<Map<String, Object>> changesList = new ArrayList<>();

        Class<?> classEntity = oldEntity.getClass();
        Field[] fields = classEntity.getDeclaredFields();

        for (Field field : fields) {
            field.setAccessible(true);

            try {
                Object oldValue = field.get(oldEntity);
                Object newValue = field.get(newEntity);

                if (oldValue != null && oldValue instanceof Long && ((Long) oldValue) == 0) {
                    Map<String, Object> change = new HashMap<>();
                    change.put("field", field.getName());
                    change.put("oldValue", newValue);
                    change.put("newValue", newValue);
                    changesList.add(change);
                } else if (oldValue != null && !oldValue.equals(newValue)) {
                    if (!field.getName().equals("lastUpdate")) {
                        Map<String, Object> change = new HashMap<>();
                        change.put("field", field.getName());
                        change.put("oldValue", oldValue);
                        change.put("newValue", newValue);
                        changesList.add(change);
                    }
                } else if (oldValue == null && newValue != null) {
                    if (!field.getName().equals("lastUpdate")) {
                        Map<String, Object> change = new HashMap<>();
                        change.put("field", field.getName());
                        change.put("oldValue", newValue);
                        change.put("newValue", newValue);
                        changesList.add(change);
                    }
                }
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }
        return changesList;
    }

}