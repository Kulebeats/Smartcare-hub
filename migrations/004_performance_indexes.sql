-- Performance & Scalability Database Indexes (Replit Optimized)
-- Memory-conscious indexing for improved query performance

-- Index for active clinical alerts with patient focus
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_alerts_active_patient_created
  ON clinical_alerts(patient_id, created_at DESC)
  WHERE NOT is_acknowledged;

-- Partial index for recent ANC records (last year only)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_anc_recent_patient_date
  ON anc_records(patient_id, visit_date DESC)
  WHERE visit_date > (CURRENT_DATE - INTERVAL '1 year');

-- Index for patient search by facility
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_facility_surname
  ON patients(facility, surname)
  WHERE surname IS NOT NULL;

-- Index for patient lookup by phone numbers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_phone_lookup
  ON patients(cellphone_number)
  WHERE cellphone_number IS NOT NULL;

-- Index for clinical decision rules by module
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clinical_rules_module_active
  ON clinical_decision_rules(module_code, is_active, alert_severity)
  WHERE is_active = true;

-- Index for facility lookup by code and name
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_facilities_code_name
  ON facilities(code, name);

-- Index for user authentication
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_active
  ON users(username)
  WHERE active = true;

-- Index for ART records by patient
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_art_records_patient_date
  ON art_records(patient_id, visit_date DESC);

-- Index for pharmacovigilance reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pv_reports_patient_date
  ON pharmacovigilance_reports(patient_id, report_date DESC);

-- Analyze tables after index creation
ANALYZE clinical_alerts;
ANALYZE anc_records;
ANALYZE patients;
ANALYZE clinical_decision_rules;
ANALYZE facilities;
ANALYZE users;
ANALYZE art_records;
ANALYZE pharmacovigilance_reports;