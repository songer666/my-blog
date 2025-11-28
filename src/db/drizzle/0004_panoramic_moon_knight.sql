ALTER TABLE "skill" ALTER COLUMN "icon" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "skill" ADD COLUMN "icon_mime_type" text;