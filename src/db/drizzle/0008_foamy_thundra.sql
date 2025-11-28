CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"image" text,
	"github_url" text,
	"demo_url" text,
	"visible" boolean DEFAULT false NOT NULL,
	"key_words" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_slug_unique" UNIQUE("slug")
);
