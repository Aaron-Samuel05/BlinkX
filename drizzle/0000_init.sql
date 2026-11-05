CREATE TYPE "public"."booking_kind" AS ENUM('content_day', 'ugc');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('scheduled', 'advance_paid', 'balance_pending', 'paid', 'closed');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "booking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"from_status" "booking_status",
	"to_status" "booking_status" NOT NULL,
	"admin_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "booking_kind" NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"business" text,
	"client_type" text,
	"location" text,
	"package_id" text,
	"package_label" text,
	"price" integer,
	"advance" integer,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"scheduled_date" date NOT NULL,
	"time_slot" text NOT NULL,
	"status" "booking_status" DEFAULT 'scheduled' NOT NULL,
	"position" double precision DEFAULT 0 NOT NULL,
	"notes" text,
	"next_follow_up" date,
	"google_event_id" text,
	"sync_error" text,
	"source" text DEFAULT 'website' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_connection" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"google_email" text NOT NULL,
	"calendar_id" text DEFAULT 'primary' NOT NULL,
	"refresh_token_enc" text NOT NULL,
	"access_token" text,
	"access_token_expires_at" timestamp with time zone,
	"connected_by" uuid,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"admin_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_connection" ADD CONSTRAINT "google_connection_connected_by_admins_id_fk" FOREIGN KEY ("connected_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_events_booking_idx" ON "booking_events" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_content_slot_uq" ON "bookings" USING btree ("scheduled_date","time_slot") WHERE "bookings"."kind" = 'content_day';--> statement-breakpoint
CREATE INDEX "bookings_status_position_idx" ON "bookings" USING btree ("status","position");--> statement-breakpoint
CREATE INDEX "bookings_date_idx" ON "bookings" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "sessions_admin_idx" ON "sessions" USING btree ("admin_id");