CREATE TYPE "public"."annotation_status" AS ENUM('verified', 'partial_match', 'not_found', 'format_error', 'quote_mismatch', 'pending', 'error');--> statement-breakpoint
CREATE TYPE "public"."document_role" AS ENUM('journal_entry', 'source');--> statement-breakpoint
CREATE TYPE "public"."spading_status" AS ENUM('draft', 'processing', 'completed', 'error');--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"role" "document_role" NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text,
	"extracted_text" text NOT NULL,
	"page_mapping" jsonb,
	"page_count" integer,
	"case_name" text,
	"citation" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spading_annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"start_offset" integer NOT NULL,
	"end_offset" integer NOT NULL,
	"raw_citation_text" text NOT NULL,
	"parsed_citation" jsonb NOT NULL,
	"status" "annotation_status" DEFAULT 'pending' NOT NULL,
	"issues" jsonb,
	"score" integer,
	"verified_citation" text,
	"discrepancies" jsonb,
	"logic_trace" jsonb,
	"matched_document_id" uuid,
	"matched_page_number" integer,
	"matched_text_snippet" text,
	"quoted_text" text,
	"source_text" text,
	"quote_accurate" boolean,
	"editor_note" text,
	"resolved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spading_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(500) NOT NULL,
	"description" text,
	"status" "spading_status" DEFAULT 'draft' NOT NULL,
	"journal_document_id" uuid,
	"citation_count" integer,
	"verified_count" integer,
	"issue_count" integer,
	"progress" integer DEFAULT 0,
	"current_step" varchar(200),
	"error_message" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_spading_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."spading_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spading_annotations" ADD CONSTRAINT "spading_annotations_project_id_spading_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."spading_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spading_annotations" ADD CONSTRAINT "spading_annotations_matched_document_id_project_documents_id_fk" FOREIGN KEY ("matched_document_id") REFERENCES "public"."project_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spading_projects" ADD CONSTRAINT "spading_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;