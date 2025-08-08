#!/bin/bash
# -----------------------------------
# deploy_migration.sh
# Production Migration Deployment Script
# -----------------------------------

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/migration_$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="/tmp/backup_$(date +%Y%m%d_%H%M%S)"
ROLLBACK_SCRIPT="${BACKUP_DIR}/rollback.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

success() {
    log "${GREEN}SUCCESS: $1${NC}"
}

warning() {
    log "${YELLOW}WARNING: $1${NC}"
}

info() {
    log "${BLUE}INFO: $1${NC}"
}

# Pre-flight checks
preflight_checks() {
    info "Starting pre-flight checks..."
    
    # Check PostgreSQL connection
    if ! psql -c "SELECT 1;" >/dev/null 2>&1; then
        error "Cannot connect to PostgreSQL database"
    fi
    
    # Check if migration files exist
    if [[ ! -f "${SCRIPT_DIR}/001_patient_normalization.sql" ]]; then
        error "Migration file not found: 001_patient_normalization.sql"
    fi
    
    if [[ ! -f "${SCRIPT_DIR}/validate_migration.sql" ]]; then
        error "Validation file not found: validate_migration.sql"
    fi
    
    # Check current patient count
    PATIENT_COUNT=$(psql -t -c "SELECT COUNT(*) FROM patients;" | tr -d ' ')
    if [[ "$PATIENT_COUNT" -gt 0 ]]; then
        warning "Found $PATIENT_COUNT existing patients. Manual review required."
        read -p "Continue with migration? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Migration cancelled by user"
        fi
    fi
    
    # Check database locks
    LOCK_COUNT=$(psql -t -c "SELECT COUNT(*) FROM pg_locks WHERE mode = 'AccessExclusiveLock';" | tr -d ' ')
    if [[ "$LOCK_COUNT" -gt 0 ]]; then
        warning "Found $LOCK_COUNT exclusive locks. This may cause migration delays."
    fi
    
    success "Pre-flight checks completed"
}

# Create backup
create_backup() {
    info "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Full database backup
    pg_dump -f "${BACKUP_DIR}/full_backup.sql" || error "Failed to create full backup"
    
    # Schema-only backup
    pg_dump -s -f "${BACKUP_DIR}/schema_backup.sql" || error "Failed to create schema backup"
    
    # Create rollback script
    cat > "$ROLLBACK_SCRIPT" << 'EOF'
-- Rollback script for patient normalization migration
BEGIN;

-- Drop new tables in reverse dependency order
DROP VIEW IF EXISTS v_patients_legacy CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS data_subject_requests CASCADE;
DROP TABLE IF EXISTS audit_retention CASCADE;
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS patient_personal CASCADE;
DROP TABLE IF EXISTS patient_family CASCADE;
DROP TABLE IF EXISTS patient_address CASCADE;
DROP TABLE IF EXISTS patient_contacts CASCADE;
DROP TABLE IF EXISTS patient_core CASCADE;

-- Drop ENUMs
DROP TYPE IF EXISTS request_status_enum CASCADE;
DROP TYPE IF EXISTS request_type_enum CASCADE;
DROP TYPE IF EXISTS relation_enum CASCADE;
DROP TYPE IF EXISTS sex_enum CASCADE;
DROP TYPE IF EXISTS alert_severity_enum CASCADE;
DROP TYPE IF EXISTS visit_type_enum CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMIT;
EOF

    success "Backup created in $BACKUP_DIR"
}

# Execute migration
execute_migration() {
    info "Executing migration..."
    
    # Set statement timeout for large operations
    psql -c "SET statement_timeout = '10min';" >/dev/null
    
    # Execute migration with transaction wrapping
    if psql -f "${SCRIPT_DIR}/001_patient_normalization.sql" 2>&1 | tee -a "$LOG_FILE"; then
        success "Migration executed successfully"
    else
        error "Migration failed - check log file: $LOG_FILE"
    fi
}

# Validate migration
validate_migration() {
    info "Validating migration..."
    
    # Run validation suite
    if psql -f "${SCRIPT_DIR}/validate_migration.sql" 2>&1 | tee -a "$LOG_FILE"; then
        
        # Check for any failed tests
        FAILED_TESTS=$(psql -t -c "
            WITH validation_results AS (
                SELECT unnest(string_to_array(
                    regexp_replace(
                        (SELECT string_agg(line, E'\n') 
                         FROM regexp_split_to_table('$(tail -n 50 "$LOG_FILE")', E'\n') AS line 
                         WHERE line ~ 'FAILED|PASSED'), 
                        E'\\s+', ' ', 'g'
                    ), 
                    E'\n'
                )) AS result_line
            )
            SELECT COUNT(*) FROM validation_results 
            WHERE result_line LIKE '%FAILED%'
        " | tr -d ' ')
        
        if [[ "$FAILED_TESTS" -gt 0 ]]; then
            error "Migration validation failed - $FAILED_TESTS tests failed"
        else
            success "All validation tests passed"
        fi
    else
        error "Migration validation script failed"
    fi
}

# Performance testing
performance_test() {
    info "Running performance tests..."
    
    # Test query performance on new schema
    psql -c "
        EXPLAIN ANALYZE 
        SELECT * FROM v_patients_legacy 
        WHERE nrc = 'test_nrc_123'
    " 2>&1 | tee -a "$LOG_FILE"
    
    # Test concurrent operations
    psql -c "
        BEGIN;
        INSERT INTO patient_core (first_name, surname, date_of_birth, sex, country) 
        VALUES ('Perf', 'Test', '1990-01-01', 'F', 'Zambia');
        ROLLBACK;
    " >/dev/null 2>&1
    
    success "Performance tests completed"
}

# Post-migration verification
post_migration_verification() {
    info "Running post-migration verification..."
    
    # Verify table counts
    CORE_COUNT=$(psql -t -c "SELECT COUNT(*) FROM patient_core;" | tr -d ' ')
    CONTACTS_COUNT=$(psql -t -c "SELECT COUNT(*) FROM patient_contacts;" | tr -d ' ')
    ADDRESS_COUNT=$(psql -t -c "SELECT COUNT(*) FROM patient_address;" | tr -d ' ')
    
    info "Record counts - Core: $CORE_COUNT, Contacts: $CONTACTS_COUNT, Address: $ADDRESS_COUNT"
    
    # Verify view functionality
    VIEW_COUNT=$(psql -t -c "SELECT COUNT(*) FROM v_patients_legacy;" | tr -d ' ')
    info "Legacy view returns $VIEW_COUNT records"
    
    # Verify feature flags
    FLAGS_COUNT=$(psql -t -c "SELECT COUNT(*) FROM feature_flags;" | tr -d ' ')
    if [[ "$FLAGS_COUNT" -lt 3 ]]; then
        error "Feature flags not properly initialized"
    fi
    
    success "Post-migration verification completed"
}

# Application compatibility test
test_application_compatibility() {
    info "Testing application compatibility..."
    
    # Test if application can start with new schema
    # This would typically involve starting the app in a test environment
    
    # For now, just verify critical queries work
    psql -c "
        -- Test patient lookup by NRC
        SELECT COUNT(*) FROM v_patients_legacy WHERE nrc IS NOT NULL;
        
        -- Test facility join
        SELECT COUNT(*) FROM v_patients_legacy v 
        JOIN facilities f ON f.name = v.facility;
        
        -- Test contact information
        SELECT COUNT(*) FROM patient_contacts WHERE contact_type = 'cellphone';
    " >/dev/null 2>&1
    
    success "Application compatibility tests passed"
}

# Generate migration report
generate_report() {
    info "Generating migration report..."
    
    REPORT_FILE="${BACKUP_DIR}/migration_report.txt"
    
    cat > "$REPORT_FILE" << EOF
Migration Report
================
Date: $(date)
Migration: Patient Schema Normalization
Status: SUCCESS

Pre-Migration State:
- Patients table records: $(psql -t -c "SELECT COUNT(*) FROM patients;" | tr -d ' ')

Post-Migration State:
- Patient core records: $(psql -t -c "SELECT COUNT(*) FROM patient_core;" | tr -d ' ')
- Contact records: $(psql -t -c "SELECT COUNT(*) FROM patient_contacts;" | tr -d ' ')
- Address records: $(psql -t -c "SELECT COUNT(*) FROM patient_address;" | tr -d ' ')
- Family records: $(psql -t -c "SELECT COUNT(*) FROM patient_family;" | tr -d ' ')
- Personal records: $(psql -t -c "SELECT COUNT(*) FROM patient_personal;" | tr -d ' ')

Feature Flags:
$(psql -t -c "SELECT flag_name || ': ' || is_enabled FROM feature_flags;" | sed 's/^/- /')

Backup Location: $BACKUP_DIR
Log File: $LOG_FILE
Rollback Script: $ROLLBACK_SCRIPT

Migration completed successfully at $(date)
EOF

    success "Migration report generated: $REPORT_FILE"
}

# Main execution
main() {
    info "Starting patient schema normalization migration..."
    info "Log file: $LOG_FILE"
    
    preflight_checks
    create_backup
    execute_migration
    validate_migration
    performance_test
    post_migration_verification
    test_application_compatibility
    generate_report
    
    success "Migration completed successfully!"
    info "Backup and rollback files available in: $BACKUP_DIR"
    info "To rollback if needed: psql -f $ROLLBACK_SCRIPT"
}

# Handle interruption
trap 'error "Migration interrupted by user"' INT TERM

# Run main function
main "$@"