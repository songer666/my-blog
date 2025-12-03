CREATE TABLE "post_view" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"ip" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_view_post_id_ip_unique" UNIQUE("post_id","ip")
);
--> statement-breakpoint
ALTER TABLE "post_view" ADD CONSTRAINT "post_view_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;