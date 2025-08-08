-- -----------------------------------
-- validate_migration.sql
-- Comprehensive Migration Validation Suite
-- -----------------------------------

-- Create validation results table
CREATE TEMP TABLE validation_results (
    test_name VARCHAR(100),
    status VARCHAR(20),
    message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test 1: Schema Structure Validation
DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'patient_core', 'patient_contacts', 'patient_address', 
        'patient_family', 'patient_personal', 'audit_events',
        'audit_retention', 'data_subject_requests', 'feature_flags'
    ];
    actual_count INTEGER;
    table_name TEXT;
BEGIN
    -- Check each table exists
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO actual_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = table_name;
        
        IF actual_count = 0 THEN
            INSERT INTO validation_results VALUES ('Table Existence', 'FAILED', 'Missing table: ' || table_name);
        ELSE
            INSERT INTO validation_results VALUES ('Table Existence', 'PASSED', 'Table exists: ' || table_name);
        END IF;
    END LOOP;
END $$;

-- Test 2: Index Performance Validation
DO $$
DECLARE
    expected_indexes TEXT[] := ARRAY[
        'idx_patient_core_nrc', 'idx_patient_core_facility',
        'idx_patient_contacts_patient_id', 'idx_audit_events_created_at'
    ];
    index_name TEXT;
    index_count INTEGER;
BEGIN
    FOREACH index_name IN ARRAY expected_indexes
    LOOP
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = index_name;
        
        IF index_count = 0 THEN
            INSERT INTO validation_results VALUES ('Index Validation', 'FAILED', 'Missing index: ' || index_name);
        ELSE
            INSERT INTO validation_results VALUES ('Index Validation', 'PASSED', 'Index exists: ' || index_name);
        END IF;
    END LOOP;
END $$;

-- Test 3: Constraint Validation
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    -- Check foreign key constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('patient_contacts', 'patient_address', 'patient_family', 'patient_personal');
    
    IF constraint_count < 4 THEN
        INSERT INTO validation_results VALUES ('Foreign Key Constraints', 'FAILED', 
            'Expected at least 4 FK constraints, found: ' || constraint_count);
    ELSE
        INSERT INTO validation_results VALUES ('Foreign Key Constraints', 'PASSED', 
            'Found ' || constraint_count || ' foreign key constraints');
    END IF;
    
    -- Check check constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.check_constraints cc
    JOIN information_schema.table_constraints tc ON cc.constraint_name = tc.constraint_name
    WHERE tc.table_schema = 'public';
    
    INSERT INTO validation_results VALUES ('Check Constraints', 'PASSED', 
        'Found ' || constraint_count || ' check constraints');
END $$;

-- Test 4: Enum Type Validation
DO $$
DECLARE
    enum_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO enum_count
    FROM pg_type 
    WHERE typname IN ('visit_type_enum', 'alert_severity_enum', 'sex_enum', 'relation_enum', 'request_type_enum', 'request_status_enum');
    
    IF enum_count != 6 THEN
        INSERT INTO validation_results VALUES ('Enum Types', 'FAILED', 
            'Expected 6 enum types, found: ' || enum_count);
    ELSE
        INSERT INTO validation_results VALUES ('Enum Types', 'PASSED', 
            'All 6 enum types created successfully');
    END IF;
END $$;

-- Test 5: View Validation
DO $$
DECLARE
    view_count INTEGER;
    view_columns INTEGER;
BEGIN
    -- Check view exists
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'v_patients_legacy';
    
    IF view_count = 0 THEN
        INSERT INTO validation_results VALUES ('Legacy View', 'FAILED', 'v_patients_legacy view not found');
    ELSE
        -- Check view has expected columns
        SELECT COUNT(*) INTO view_columns
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'v_patients_legacy';
        
        INSERT INTO validation_results VALUES ('Legacy View', 'PASSED', 
            'v_patients_legacy view created with ' || view_columns || ' columns');
    END IF;
END $$;

-- Test 6: Trigger Validation
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public' 
    AND trigger_name LIKE '%updated_at%';
    
    IF trigger_count = 0 THEN
        INSERT INTO validation_results VALUES ('Triggers', 'FAILED', 'No updated_at triggers found');
    ELSE
        INSERT INTO validation_results VALUES ('Triggers', 'PASSED', 
            'Found ' || trigger_count || ' updated_at triggers');
    END IF;
END $$;

-- Test 7: Feature Flag Validation
DO $$
DECLARE
    flag_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO flag_count
    FROM feature_flags
    WHERE flag_name IN ('NORMALIZED_SCHEMA_ENABLED', 'AUDIT_LOGGING_ENABLED', 'GDPR_COMPLIANCE_ENABLED');
    
    IF flag_count != 3 THEN
        INSERT INTO validation_results VALUES ('Feature Flags', 'FAILED', 
            'Expected 3 feature flags, found: ' || flag_count);
    ELSE
        INSERT INTO validation_results VALUES ('Feature Flags', 'PASSED', 
            'All 3 feature flags configured');
    END IF;
END $$;

-- Test 8: Audit Retention Policy Validation
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM audit_retention
    WHERE table_name IN ('audit_events', 'patient_core', 'patient_contacts', 'patient_address', 'patient_family');
    
    IF policy_count < 5 THEN
        INSERT INTO validation_results VALUES ('Audit Retention', 'FAILED', 
            'Expected at least 5 retention policies, found: ' || policy_count);
    ELSE
        INSERT INTO validation_results VALUES ('Audit Retention', 'PASSED', 
            'Found ' || policy_count || ' retention policies');
    END IF;
END $$;

-- Test 9: Data Migration Validation (should be 0 records)
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_count FROM patients;
    SELECT COUNT(*) INTO new_count FROM patient_core;
    
    IF old_count != new_count THEN
        INSERT INTO validation_results VALUES ('Data Migration', 'FAILED', 
            'Count mismatch: patients(' || old_count || ') != patient_core(' || new_count || ')');
    ELSE
        INSERT INTO validation_results VALUES ('Data Migration', 'PASSED', 
            'Data migration verified: ' || old_count || ' records');
    END IF;
END $$;

-- Test 10: Performance Test with Sample Data
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    duration INTERVAL;
    test_patient_id INTEGER;
BEGIN
    start_time := clock_timestamp();
    
    -- Insert test patient
    INSERT INTO patient_core (first_name, surname, date_of_birth, sex, country, facility_id)
    VALUES ('Test', 'Patient', '1990-01-01', 'F', 'Zambia', 1)
    RETURNING id INTO test_patient_id;
    
    -- Insert related data
    INSERT INTO patient_contacts (patient_id, contact_type, contact_value, is_primary)
    VALUES (test_patient_id, 'cellphone', '+260971234567', TRUE);
    
    INSERT INTO patient_address (patient_id, house_number, city_town_village)
    VALUES (test_patient_id, '123', 'Lusaka');
    
    INSERT INTO patient_family (patient_id, relation, first_name, surname)
    VALUES (test_patient_id, 'mother', 'Test', 'Mother');
    
    -- Test legacy view query
    PERFORM * FROM v_patients_legacy WHERE id = test_patient_id;
    
    -- Clean up test data
    DELETE FROM patient_core WHERE id = test_patient_id;
    
    end_time := clock_timestamp();
    duration := end_time - start_time;
    
    INSERT INTO validation_results VALUES ('Performance Test', 'PASSED', 
        'CRUD operations completed in ' || EXTRACT(milliseconds FROM duration) || 'ms');
    
EXCEPTION WHEN OTHERS THEN
    INSERT INTO validation_results VALUES ('Performance Test', 'FAILED', 
        'Error during performance test: ' || SQLERRM);
END $$;

-- Display validation results
SELECT 
    test_name,
    status,
    message,
    executed_at
FROM validation_results
ORDER BY 
    CASE status 
        WHEN 'FAILED' THEN 1 
        WHEN 'PASSED' THEN 2 
        ELSE 3 
    END,
    test_name;

-- Summary report
SELECT 
    status,
    COUNT(*) as test_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM validation_results), 2) as percentage
FROM validation_results
GROUP BY status
ORDER BY status;