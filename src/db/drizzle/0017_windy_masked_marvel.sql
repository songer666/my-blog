ALTER TABLE "post" ADD COLUMN "related_code_repository_id" text;--> statement-breakpoint
ALTER TABLE "code_repository" ADD COLUMN "demo_images" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "code_repository" ADD COLUMN "related_post_id" text;--> statement-breakpoint
ALTER TABLE "code_repository" DROP COLUMN "mdx_content";