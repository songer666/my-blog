CREATE TABLE "code_repository" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"keywords" text[],
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mdx_content" text,
	"item_count" integer DEFAULT 0 NOT NULL,
	"total_size" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "code_repository_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "image_gallery" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"keywords" text[],
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"total_size" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "image_gallery_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "music_album" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"keywords" text[],
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"total_size" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "music_album_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "video_collection" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"keywords" text[],
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"total_size" integer DEFAULT 0 NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_collection_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP TABLE "code_demo" CASCADE;--> statement-breakpoint
DROP TABLE "code_file" CASCADE;--> statement-breakpoint
DROP TABLE "image_resource" CASCADE;--> statement-breakpoint
DROP TABLE "music_resource" CASCADE;--> statement-breakpoint
DROP TABLE "resource_category" CASCADE;--> statement-breakpoint
DROP TABLE "video_resource" CASCADE;--> statement-breakpoint
DROP TYPE "public"."resource_type";