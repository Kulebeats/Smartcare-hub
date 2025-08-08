ALTER TABLE "patients" ADD COLUMN "mother_deceased" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "mothers_nrc" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "mothers_napsa_pspf" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "mothers_nationality" text DEFAULT 'Zambia';--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "father_deceased" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "fathers_nrc" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "fathers_napsa_pspf" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "fathers_nationality" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "guardian_surname" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "guardian_nrc" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "guardian_napsa_pspf" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "guardian_nationality" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "spouse_first_name" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "spouse_surname" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "home_language" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "other_home_language" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "is_born_in_zambia" boolean;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "province_of_birth" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "district_of_birth" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "religious_category" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "religious_denomination" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "other_religious_denomination" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "other_education_level" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "other_occupation" text;