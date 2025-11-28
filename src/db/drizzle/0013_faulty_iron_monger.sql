CREATE TABLE "message_rate_limit" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"ip_address" varchar(255) NOT NULL,
	"user_agent" text,
	"last_sent_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
