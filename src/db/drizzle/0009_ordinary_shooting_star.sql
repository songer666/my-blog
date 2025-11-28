CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"github_id" text NOT NULL,
	"github_username" text NOT NULL,
	"github_avatar" text,
	"github_email" text,
	"github_url" text NOT NULL,
	"post_id" text,
	"parent_id" text,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_parent_id_message_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;