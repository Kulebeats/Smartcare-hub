# ABAC Policy Documentation

## Policy Structure

Each policy defines access control rules with the following structure:

- `id`: Unique identifier for the policy
- `subject`: User role (Clinician, FacilityAdministrator, SystemAdministrator, Trainer)
- `resource_type`: Type of resource being accessed (patient, anc_record, prescription, etc.)
- `action`: Operation being performed (read, create, update, delete, *)
- `description`: Human-readable explanation of the policy
- `conditions`: Additional constraints for access

## Condition Types

- `match_facility_id`: Resource must belong to user's facility
- `match_facility_id_on_body`: Request body must specify user's facility
- `match_facility_id_via_patient`: Resource linked to patient in user's facility
- `role_restrictions`: Limited to specific roles for creation

## Access Patterns

### Clinicians
- Read/create/update patients in their facility
- Read/create/update ANC records for facility patients
- Create/read prescriptions and clinical alerts

### Facility Administrators
- Full patient management within facility
- All clinical records access for facility
- User management (create Clinicians/Trainers)

### System Administrators
- Unrestricted access to all resources

### Trainers
- Read-only access to patients and ANC records in facility