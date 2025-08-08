-- Add mothers_surname column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'mothers_surname'
    ) THEN
        ALTER TABLE patients ADD COLUMN mothers_surname text;
    END IF;
END $$;

-- Make mothers_name and mothers_surname NOT NULL, with a default value for any existing records
UPDATE patients SET mothers_name = 'Required Field' WHERE mothers_name IS NULL;

-- Update any null mothers_surname values
UPDATE patients SET mothers_surname = 'Required Field' WHERE mothers_surname IS NULL;

-- Apply NOT NULL constraint
ALTER TABLE patients ALTER COLUMN mothers_name SET NOT NULL;
ALTER TABLE patients ALTER COLUMN mothers_surname SET NOT NULL;