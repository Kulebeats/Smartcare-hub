-- Add indexes for patient search capabilities

-- Index for first_name and surname search (using trigram indexing for partial matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for name search (first_name, surname)
CREATE INDEX idx_patients_first_name ON patients USING gin (first_name gin_trgm_ops);
CREATE INDEX idx_patients_surname ON patients USING gin (surname gin_trgm_ops);

-- Index for sex (which has low cardinality but is often used in filters)
CREATE INDEX idx_patients_sex ON patients (sex);

-- Index for cellphone number search
CREATE INDEX idx_patients_cellphone ON patients USING gin (cellphone gin_trgm_ops);
CREATE INDEX idx_patients_other_cellphone ON patients USING gin (other_cellphone gin_trgm_ops);

-- Index for NRC search
CREATE INDEX idx_patients_nrc ON patients USING gin (nrc gin_trgm_ops);

-- Index for NUPIN search
CREATE INDEX idx_patients_nupin ON patients USING gin (nupin gin_trgm_ops);

-- Index for facility (commonly used in queries)
CREATE INDEX idx_patients_facility ON patients (facility);

-- Add combined index for name and sex (common search pattern)
CREATE INDEX idx_patients_name_sex ON patients (first_name, surname, sex);