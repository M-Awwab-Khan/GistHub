CREATE TABLE "snippet_collaborators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snippet_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"added_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "snippet_collaborators" ADD CONSTRAINT "snippet_collaborators_snippet_id_snippets_id_fk" FOREIGN KEY ("snippet_id") REFERENCES "public"."snippets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "snippet_collaborators_snippet_id_idx" ON "snippet_collaborators" USING btree ("snippet_id");--> statement-breakpoint
CREATE INDEX "snippet_collaborators_user_id_idx" ON "snippet_collaborators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "snippet_collaborators_unique_idx" ON "snippet_collaborators" USING btree ("snippet_id","user_id");