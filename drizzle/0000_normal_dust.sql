CREATE TYPE "public"."oauth_provider" AS ENUM('google', 'email');--> statement-breakpoint
CREATE TABLE "citation_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"mode" varchar(20) NOT NULL,
	"input_text" text NOT NULL,
	"results" jsonb NOT NULL,
	"citation_count" integer DEFAULT 1 NOT NULL,
	"average_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"citation_history_id" uuid,
	"rating" integer NOT NULL,
	"comment" text,
	"citation_text" text,
	"expected_output" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token" varchar(500) NOT NULL,
	"user_agent" varchar(500),
	"ip_address" varchar(45),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" varchar(255),
	"oauth_provider" "oauth_provider",
	"oauth_id" varchar(255),
	"email_verified" boolean DEFAULT false NOT NULL,
	"format_preference" varchar(20) DEFAULT 'italics',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cache_key" varchar(500) NOT NULL,
	"result" jsonb NOT NULL,
	"provider" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "verification_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
ALTER TABLE "citation_history" ADD CONSTRAINT "citation_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_citation_history_id_citation_history_id_fk" FOREIGN KEY ("citation_history_id") REFERENCES "public"."citation_history"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;