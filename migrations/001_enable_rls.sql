-- Enable Row-Level Security for healthcare data isolation
-- This migration sets up RLS policies to ensure facility-based data isolation

-- Enable RLS on patient_core table
ALTER TABLE patient_core ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_core FORCE ROW LEVEL SECURITY;

-- Create facility isolation policy for patient_core
CREATE POLICY patient_facility_isolation ON patient_core
  FOR ALL -- Apply to SELECT, INSERT, UPDATE, DELETE
  USING (facility_id = current_setting('app.facility_id', true)::int)
  WITH CHECK (facility_id = current_setting('app.facility_id', true)::int);

-- Enable RLS on anc_records table
ALTER TABLE anc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE anc_records FORCE ROW LEVEL SECURITY;

-- Create facility isolation policy for anc_records (via patient relationship)
CREATE POLICY anc_facility_isolation ON anc_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patient_core pc
      WHERE pc.id = patient_id AND pc.facility_id = current_setting('app.facility_id', true)::int
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_core pc
      WHERE pc.id = patient_id AND pc.facility_id = current_setting('app.facility_id', true)::int
    )
  );

-- Enable RLS on prescriptions table
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions FORCE ROW LEVEL SECURITY;

-- Create facility isolation policy for prescriptions
CREATE POLICY prescription_facility_isolation ON prescriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patient_core pc
      WHERE pc.id = patient_id AND pc.facility_id = current_setting('app.facility_id', true)::int
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_core pc
      WHERE pc.id = patient_id AND pc.facility_id = current_setting('app.facility_id', true)::int
    )
  );

-- Enable RLS on clinical_alerts table
ALTER TABLE clinical_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_alerts FORCE ROW LEVEL SECURITY;

-- Create facility isolation policy for clinical_alerts
CREATE POLICY clinical_alert_facility_isolation ON clinical_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patient_core pc
      WHERE pc.id = patient_id AND pc.facility_id = current_setting('app.facility_id', true)::int
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_core pc
      WHERE pc.id = patient_id AND pc.facility_id = current_setting('app.facility_id', true)::int
    )
  );

-- Enable RLS on users table for facility-based user management
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- Create facility isolation policy for users
CREATE POLICY user_facility_isolation ON users
  FOR ALL
  USING (
    facility = current_setting('app.facility_id', true) OR
    -- System administrators can see all users
    current_setting('app.user_role', true) = 'SystemAdministrator'
  )
  WITH CHECK (
    facility = current_setting('app.facility_id', true) OR
    -- System administrators can create users in any facility
    current_setting('app.user_role', true) = 'SystemAdministrator'
  );

-- Create indexes to support RLS performance
CREATE INDEX IF NOT EXISTS idx_patient_core_facility_id ON patient_core(facility_id);
CREATE INDEX IF NOT EXISTS idx_anc_records_patient_id ON anc_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_alerts_patient_id ON clinical_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_users_facility ON users(facility);

-- Grant necessary permissions for RLS to work with application user
-- Note: These permissions should be set by database administrator
-- GRANT SELECT, INSERT, UPDATE, DELETE ON patient_core TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON anc_records TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON prescriptions TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON clinical_alerts TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_user;