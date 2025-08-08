CREATE TABLE "art_follow_ups" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"visit_date" timestamp NOT NULL,
	"complaints" text,
	"tb_symptoms" text,
	"physical_exam" text,
	"diagnosis" text,
	"treatment_plan" text,
	"next_visit" date
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"province" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"type" varchar(100),
	"level" varchar(50),
	"ownership" varchar(100),
	"status" varchar(50) DEFAULT 'ACTIVE',
	"latitude" varchar(20),
	"longitude" varchar(20),
	"contact" varchar(100),
	"email" varchar(100),
	CONSTRAINT "facilities_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"surname" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"is_estimated_dob" boolean DEFAULT false,
	"sex" text NOT NULL,
	"nrc" text,
	"no_nrc" boolean DEFAULT false,
	"under_five_card_number" text,
	"napsa" text,
	"nupin" text,
	"country" text NOT NULL,
	"cellphone" text NOT NULL,
	"other_cellphone" text,
	"landline" text,
	"email" text,
	"house_number" text,
	"road_street" text,
	"area" text,
	"city_town_village" text,
	"landmarks" text,
	"mothers_name" text NOT NULL,
	"mothers_surname" text NOT NULL,
	"fathers_name" text,
	"fathers_surname" text,
	"guardian_name" text,
	"guardian_relationship" text,
	"marital_status" text,
	"birth_place" text,
	"education_level" text,
	"occupation" text,
	"facility" text NOT NULL,
	"registration_date" timestamp DEFAULT now(),
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"drug_name" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"duration" integer NOT NULL,
	"duration_unit" text NOT NULL,
	"quantity" integer NOT NULL,
	"prescribed_date" timestamp NOT NULL,
	"facility" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'Clinician' NOT NULL,
	"facility" text,
	"facility_code" text,
	"is_admin" boolean DEFAULT false,
	"email" text,
	"full_name" text,
	"active" boolean DEFAULT true,
	"last_login" timestamp,
	"phone_number" text,
	"permissions" json DEFAULT '[]'::json,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
