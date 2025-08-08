#!/bin/bash
# -----------------------------------
# check_code_references.sh
# Code Analysis for Patient Table References
# -----------------------------------

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}INFO: $1${NC}"
}

warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

error() {
    echo -e "${RED}ERROR: $1${NC}"
}

success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

info "Analyzing codebase for patient table references..."

# Find all references to 'patients' table
echo "=== Direct 'patients' table references ==="
grep -r "FROM patients" --include="*.ts" --include="*.js" --include="*.sql" . | head -20 || true
grep -r "INSERT INTO patients" --include="*.ts" --include="*.js" --include="*.sql" . | head -20 || true
grep -r "UPDATE patients" --include="*.ts" --include="*.js" --include="*.sql" . | head -20 || true
grep -r "DELETE FROM patients" --include="*.ts" --include="*.js" --include="*.sql" . | head -20 || true

echo -e "\n=== Schema references ==="
grep -r "export.*patients.*=" --include="*.ts" . | head -20 || true

echo -e "\n=== Storage layer references ==="
grep -r "patients" server/storage.ts | head -20 || true

echo -e "\n=== Route references ==="
grep -r "patients" server/routes.ts | head -20 || true

echo -e "\n=== Client references ==="
grep -r "patients" --include="*.tsx" client/ | head -20 || true

echo -e "\n=== Critical files requiring updates ==="
FILES_TO_UPDATE=(
    "shared/schema.ts"
    "server/storage.ts" 
    "server/routes.ts"
    "api/types-library.ts"
)

for file in "${FILES_TO_UPDATE[@]}"; do
    if [[ -f "$file" ]]; then
        PATIENT_REFS=$(grep -c "patients" "$file" 2>/dev/null || echo "0")
        if [[ "$PATIENT_REFS" -gt 0 ]]; then
            warning "$file contains $PATIENT_REFS patient references - needs update"
        else
            success "$file - no patient references found"
        fi
    else
        info "$file - file not found"
    fi
done

echo -e "\n=== Summary ==="
TOTAL_REFS=$(grep -r "patients" --include="*.ts" --include="*.js" . | wc -l || echo "0")
info "Total patient references found: $TOTAL_REFS"

if [[ "$TOTAL_REFS" -gt 0 ]]; then
    warning "Code updates required before migration"
    echo "Recommended actions:"
    echo "1. Update shared/schema.ts to use new normalized tables"
    echo "2. Update server/storage.ts interface methods"
    echo "3. Update server/routes.ts endpoints"
    echo "4. Test with v_patients_legacy view for backward compatibility"
else
    success "No patient table references found in TypeScript/JavaScript files"
fi