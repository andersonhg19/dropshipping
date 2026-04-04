package com.visnex.administrationservice.util;

import org.springframework.context.ApplicationEvent;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public class EntityChangeEvent extends ApplicationEvent {

    private final List<Map<String, Object>> changes;
    private final Long actorUserId; // usuario que ejecutó la acción

    public EntityChangeEvent(Object entity, List<Map<String, Object>> changes, Long actorUserId) {
        super(entity);
        this.changes = (changes == null) ? List.of() : Collections.unmodifiableList(changes);
        this.actorUserId = actorUserId;
    }

    @SuppressWarnings("unchecked")
    public <T> T getEntity() {
        return (T) getSource();
    }

    public List<Map<String, Object>> getChanges() {
        return changes;
    }

    public Long getActorUserId() {
        return actorUserId;
    }
}
