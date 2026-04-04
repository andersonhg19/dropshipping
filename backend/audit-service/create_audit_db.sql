-- Script para crear la base de datos de auditoría
CREATE DATABASE audit_db;

-- Conectar a la base de datos audit_db
\c audit_db;

-- La tabla se creará automáticamente con JPA, pero aquí está la estructura esperada:
-- CREATE TABLE hq_audit_log (
--     id BIGSERIAL PRIMARY KEY,
--     company_id BIGINT NOT NULL,
--     subsidiary_id BIGINT,
--     actor_user_id BIGINT NOT NULL,
--     actor_username VARCHAR(100),
--     entity_type VARCHAR(100) NOT NULL,
--     entity_id BIGINT NOT NULL,
--     action VARCHAR(50) NOT NULL,
--     changes TEXT,
--     module VARCHAR(80) NOT NULL,
--     ip_address VARCHAR(45),
--     timestamp TIMESTAMP NOT NULL
-- );

-- Índices (se crearán automáticamente con JPA, pero aquí están para referencia):
-- CREATE INDEX idx_audit_company ON hq_audit_log(company_id);
-- CREATE INDEX idx_audit_subsidiary ON hq_audit_log(subsidiary_id);
-- CREATE INDEX idx_audit_user ON hq_audit_log(actor_user_id);
-- CREATE INDEX idx_audit_entity ON hq_audit_log(entity_type, entity_id);
-- CREATE INDEX idx_audit_timestamp ON hq_audit_log(timestamp);
-- CREATE INDEX idx_audit_module ON hq_audit_log(module);

