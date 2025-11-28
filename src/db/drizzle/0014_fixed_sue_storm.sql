CREATE TYPE "public"."resource_type" AS ENUM('image', 'music', 'video', 'code');--> statement-breakpoint
CREATE TABLE "code_demo" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category_id" text,
	"mdx_content" text,
	"tags" text[],
	"is_public" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_file" (
	"id" text PRIMARY KEY NOT NULL,
	"demo_id" text NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_resource" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category_id" text,
	"r2_key" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"thumbnail_key" varchar(500),
	"alt" varchar(255),
	"tags" text[],
	"is_public" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_resource" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category_id" text,
	"r2_key" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"artist" varchar(255),
	"album" varchar(255),
	"duration" integer,
	"bitrate" integer,
	"sample_rate" integer,
	"cover_key" varchar(500),
	"lyrics" text,
	"tags" text[],
	"is_public" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"resource_type" "resource_type" NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_resource" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category_id" text,
	"r2_key" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"duration" integer,
	"width" integer,
	"height" integer,
	"resolution" varchar(50),
	"fps" integer,
	"bitrate" integer,
	"codec" varchar(50),
	"cover_key" varchar(500),
	"tags" text[],
	"is_public" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
