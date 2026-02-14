CREATE TABLE IF NOT EXISTS "case_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"case_name" text,
	"citation" text,
	"extracted_text" text NOT NULL,
	"page_mapping" jsonb,
	"file_size" integer NOT NULL,
	"page_count" integer,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
