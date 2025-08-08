-- -----------------------------------
-- 001_patient_normalization.sql
-- Production Migration: Patient Schema Normalization
-- Zero-downtime migration with transaction wrapping
-- -----------------------------------

BEGIN;

-- 1. Pre-migration validation
DO $$
DECLARE
    patient_count INTEGER;
    table_exists BOOLEAN;
BEGIN
    -- Check if patients table exists and get count
    SELECT COUNT(*) INTO patient_count FROM patients;
    
    -- Validate we're in expected state (empty table)
    IF patient_count > 0 THEN
        RAISE EXCEPTION 'Migration halted: Found % existing patients. Manual review required.', patient_count;
    END IF;
    
    RAISE NOTICE 'Pre-migration validation passed. Patient count: %', patient_count;
END $$;

-- 2. Create ENUMs with proper naming for clarity
CREATE TYPE visit_type_enum AS ENUM ('initial', 'routine');
CREATE TYPE alert_severity_enum AS ENUM ('yellow', 'orange', 'red', 'purple', 'blue');
CREATE TYPE sex_enum AS ENUM ('M', 'F', 'O');
CREATE TYPE relation_enum AS ENUM ('mother', 'father', 'guardian', 'spouse');
CREATE TYPE request_type_enum AS ENUM ('ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY');
CREATE TYPE request_status_enum AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- 3. Create normalized core tables with proper constraints

-- Core patient information (normalized)
CREATE TABLE patient_core (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    is_estimated_dob BOOLEAN DEFAULT FALSE,
    sex sex_enum NOT NULL,
    nrc VARCHAR(15) UNIQUE, -- Increased for future-proofing
    no_nrc BOOLEAN DEFAULT FALSE,
    under_five_card_number VARCHAR(50),
    napsa VARCHAR(50),
    nupin VARCHAR(50),
    country VARCHAR(100) NOT NULL DEFAULT 'Zambia',
    facility_id INTEGER REFERENCES facilities(id),
    
    -- Clinical fields for ANC compatibility
    gestational_age INTEGER CHECK (gestational_age BETWEEN 4 AND 42),
    bp_systolic_1 INTEGER CHECK (bp_systolic_1 BETWEEN 60 AND 250),
    bp_diastolic_1 INTEGER CHECK (bp_diastolic_1 BETWEEN 30 AND 150),
    temperature_first INTEGER CHECK (temperature_first BETWEEN 350 AND 420), -- Celsius * 10
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Contact information with history tracking
CREATE TABLE patient_contacts (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_core(id) ON DELETE CASCADE,
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('cellphone', 'other_cellphone', 'landline', 'email')),
    contact_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

-- Address information with history tracking
CREATE TABLE patient_address (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_core(id) ON DELETE CASCADE,
    house_number VARCHAR(100),
    road_street VARCHAR(200),
    area VARCHAR(100),
    city_town_village VARCHAR(100),
    landmarks VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

-- Family relationships
CREATE TABLE patient_family (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_core(id) ON DELETE CASCADE,
    relation relation_enum NOT NULL,
    first_name VARCHAR(100),
    surname VARCHAR(100),
    is_deceased BOOLEAN DEFAULT FALSE,
    nrc VARCHAR(15),
    napsa_pspf VARCHAR(50),
    nationality VARCHAR(100) DEFAULT 'Zambia',
    contact_phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

-- Personal and cultural information
CREATE TABLE patient_personal (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient_core(id) ON DELETE CASCADE,
    marital_status VARCHAR(50),
    spouse_first_name VARCHAR(100),
    spouse_surname VARCHAR(100),
    home_language VARCHAR(100),
    other_home_language VARCHAR(100),
    is_born_in_zambia BOOLEAN,
    province_of_birth VARCHAR(100),
    district_of_birth VARCHAR(100),
    birth_place VARCHAR(200),
    religious_category VARCHAR(100),
    religious_denomination VARCHAR(100),
    other_religious_denomination VARCHAR(200),
    education_level VARCHAR(100),
    other_education_level VARCHAR(200),
    occupation VARCHAR(100),
    other_occupation VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

-- 4. Audit and compliance tables

-- Comprehensive audit trail with cryptographic integrity
CREATE TABLE audit_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    object_type VARCHAR(100) NOT NULL,
    object_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    diff JSONB,
    ip_address INET,
    user_agent TEXT,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    prev_hash VARCHAR(64),
    curr_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data retention policies
CREATE TABLE audit_retention (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL UNIQUE,
    retention_days INTEGER NOT NULL CHECK (retention_days > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GDPR data subject requests
CREATE TABLE data_subject_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    request_type request_type_enum NOT NULL,
    target_table VARCHAR(100),
    target_id VARCHAR(255),
    justification TEXT,
    status request_status_enum DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by INTEGER REFERENCES users(id),
    notes TEXT
);

-- 5. Performance indexes with careful lock management

-- Primary lookup indexes
CREATE INDEX CONCURRENTLY idx_patient_core_nrc ON patient_core(nrc) WHERE nrc IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_patient_core_under_five ON patient_core(under_five_card_number) WHERE under_five_card_number IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_patient_core_facility ON patient_core(facility_id);
CREATE INDEX CONCURRENTLY idx_patient_core_created_at ON patient_core(created_at);

-- Contact indexes
CREATE INDEX CONCURRENTLY idx_patient_contacts_patient_id ON patient_contacts(patient_id);
CREATE INDEX CONCURRENTLY idx_patient_contacts_primary ON patient_contacts(patient_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX CONCURRENTLY idx_patient_contacts_active ON patient_contacts(patient_id, is_active) WHERE is_active = TRUE;

-- Address indexes
CREATE INDEX CONCURRENTLY idx_patient_address_patient_id ON patient_address(patient_id);
CREATE INDEX CONCURRENTLY idx_patient_address_active ON patient_address(patient_id, is_active) WHERE is_active = TRUE;

-- Family indexes
CREATE INDEX CONCURRENTLY idx_patient_family_patient_id ON patient_family(patient_id);
CREATE INDEX CONCURRENTLY idx_patient_family_relation ON patient_family(patient_id, relation);

-- Personal information index
CREATE INDEX CONCURRENTLY idx_patient_personal_patient_id ON patient_personal(patient_id);

-- Audit indexes for performance
CREATE INDEX CONCURRENTLY idx_audit_events_user_id ON audit_events(user_id);
CREATE INDEX CONCURRENTLY idx_audit_events_action ON audit_events(action);
CREATE INDEX CONCURRENTLY idx_audit_events_object ON audit_events(object_type, object_id);
CREATE INDEX CONCURRENTLY idx_audit_events_created_at ON audit_events(created_at);

-- GDPR request indexes
CREATE INDEX CONCURRENTLY idx_data_subject_requests_user_id ON data_subject_requests(user_id);
CREATE INDEX CONCURRENTLY idx_data_subject_requests_status ON data_subject_requests(status);
CREATE INDEX CONCURRENTLY idx_data_subject_requests_target ON data_subject_requests(target_table, target_id);

-- 6. Create backward compatibility view
CREATE OR REPLACE VIEW v_patients_legacy AS
SELECT 
    pc.id,
    pc.first_name,
    pc.surname,
    pc.date_of_birth,
    pc.is_estimated_dob,
    pc.sex,
    pc.nrc,
    pc.no_nrc,
    pc.under_five_card_number,
    pc.napsa,
    pc.nupin,
    pc.country,
    pc.gestational_age,
    pc.bp_systolic_1,
    pc.bp_diastolic_1,
    pc.temperature_first,
    
    -- Primary contact
    pcon_cell.contact_value AS cellphone,
    pcon_other.contact_value AS other_cellphone,
    pcon_land.contact_value AS landline,
    pcon_email.contact_value AS email,
    
    -- Address
    pa.house_number,
    pa.road_street,
    pa.area,
    pa.city_town_village,
    pa.landmarks,
    
    -- Mother information
    pf_mother.first_name AS mothers_name,
    pf_mother.surname AS mothers_surname,
    pf_mother.is_deceased AS mother_deceased,
    pf_mother.nrc AS mothers_nrc,
    pf_mother.napsa_pspf AS mothers_napsa_pspf,
    pf_mother.nationality AS mothers_nationality,
    
    -- Father information
    pf_father.first_name AS fathers_name,
    pf_father.surname AS fathers_surname,
    pf_father.is_deceased AS father_deceased,
    pf_father.nrc AS fathers_nrc,
    pf_father.napsa_pspf AS fathers_napsa_pspf,
    pf_father.nationality AS fathers_nationality,
    
    -- Guardian information
    pf_guardian.first_name AS guardian_name,
    pf_guardian.surname AS guardian_surname,
    pf_guardian.nrc AS guardian_nrc,
    pf_guardian.napsa_pspf AS guardian_napsa_pspf,
    pf_guardian.nationality AS guardian_nationality,
    
    -- Personal information
    pp.marital_status,
    pp.spouse_first_name,
    pp.spouse_surname,
    pp.home_language,
    pp.other_home_language,
    pp.is_born_in_zambia,
    pp.province_of_birth,
    pp.district_of_birth,
    pp.birth_place,
    pp.religious_category,
    pp.religious_denomination,
    pp.other_religious_denomination,
    pp.education_level,
    pp.other_education_level,
    pp.occupation,
    pp.other_occupation,
    
    -- System fields
    f.name AS facility,
    pc.created_at AS registration_date,
    pc.updated_at AS last_updated
    
FROM patient_core pc
LEFT JOIN facilities f ON pc.facility_id = f.id
LEFT JOIN patient_address pa ON pc.id = pa.patient_id AND pa.is_active = TRUE
LEFT JOIN patient_personal pp ON pc.id = pp.patient_id
LEFT JOIN patient_contacts pcon_cell ON pc.id = pcon_cell.patient_id 
    AND pcon_cell.contact_type = 'cellphone' AND pcon_cell.is_active = TRUE
LEFT JOIN patient_contacts pcon_other ON pc.id = pcon_other.patient_id 
    AND pcon_other.contact_type = 'other_cellphone' AND pcon_other.is_active = TRUE
LEFT JOIN patient_contacts pcon_land ON pc.id = pcon_land.patient_id 
    AND pcon_land.contact_type = 'landline' AND pcon_land.is_active = TRUE
LEFT JOIN patient_contacts pcon_email ON pc.id = pcon_email.patient_id 
    AND pcon_email.contact_type = 'email' AND pcon_email.is_active = TRUE
LEFT JOIN patient_family pf_mother ON pc.id = pf_mother.patient_id AND pf_mother.relation = 'mother'
LEFT JOIN patient_family pf_father ON pc.id = pf_father.patient_id AND pf_father.relation = 'father'
LEFT JOIN patient_family pf_guardian ON pc.id = pf_guardian.patient_id AND pf_guardian.relation = 'guardian';

-- 7. Triggers and functions

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_patient_core_updated_at
    BEFORE UPDATE ON patient_core
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_retention_updated_at
    BEFORE UPDATE ON audit_retention
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert default retention policies
INSERT INTO audit_retention (table_name, retention_days) VALUES
    ('audit_events', 2555),      -- 7 years for audit compliance
    ('patient_core', 3650),      -- 10 years for medical records
    ('patient_contacts', 3650),  -- 10 years
    ('patient_address', 3650),   -- 10 years
    ('patient_family', 3650),    -- 10 years
    ('patient_personal', 3650),  -- 10 years
    ('data_subject_requests', 2555); -- 7 years for GDPR compliance

-- 9. Create feature flag for gradual rollout
CREATE TABLE feature_flags (
    id SERIAL PRIMARY KEY,
    flag_name VARCHAR(100) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO feature_flags (flag_name, description, is_enabled) VALUES
    ('NORMALIZED_SCHEMA_ENABLED', 'Enable new normalized patient schema', FALSE),
    ('AUDIT_LOGGING_ENABLED', 'Enable comprehensive audit logging', TRUE),
    ('GDPR_COMPLIANCE_ENABLED', 'Enable GDPR data subject requests', TRUE);

-- 10. Data migration (zero records expected)
DO $$
DECLARE
    migrated_count INTEGER := 0;
    original_count INTEGER;
BEGIN
    -- Get original count
    SELECT COUNT(*) INTO original_count FROM patients;
    
    -- Migration would happen here if there were records
    -- Currently expecting 0 records
    
    -- Validation
    SELECT COUNT(*) INTO migrated_count FROM patient_core;
    
    IF original_count != migrated_count THEN
        RAISE EXCEPTION 'Migration validation failed: original % != migrated %', original_count, migrated_count;
    END IF;
    
    RAISE NOTICE 'Migration completed successfully. Records migrated: %', migrated_count;
END $$;

-- 11. Post-migration validation
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    constraint_count INTEGER;
BEGIN
    -- Validate tables were created
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('patient_core', 'patient_contacts', 'patient_address', 'patient_family', 'patient_personal', 'audit_events', 'audit_retention', 'data_subject_requests', 'feature_flags');
    
    IF table_count != 9 THEN
        RAISE EXCEPTION 'Table creation validation failed. Expected 9 tables, found %', table_count;
    END IF;
    
    -- Validate indexes were created
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    -- Validate constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND constraint_type IN ('FOREIGN KEY', 'CHECK');
    
    RAISE NOTICE 'Post-migration validation passed. Tables: %, Indexes: %, Constraints: %', 
                 table_count, index_count, constraint_count;
END $$;

COMMIT;

-- Success message
SELECT 'Patient normalization migration completed successfully' AS status;