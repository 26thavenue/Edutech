CREATE TABLE IF NOT EXISTS "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"author" text NOT NULL,
	"free" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"chapter_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_chapters_lessons" (
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"progress" text DEFAULT '0%' NOT NULL,
	CONSTRAINT "user_chapters_lessons_user_id_course_id_chapter_id_lesson_id_pk" PRIMARY KEY("user_id","course_id","chapter_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_courses" (
	"user_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"progress" text DEFAULT '0%' NOT NULL,
	CONSTRAINT "user_courses_user_id_org_id_pk" PRIMARY KEY("user_id","org_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_courses_chapters" (
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"progress" text DEFAULT '0%' NOT NULL,
	CONSTRAINT "user_courses_chapters_user_id_course_id_chapter_id_pk" PRIMARY KEY("user_id","course_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"phone" text,
	"password" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapters" ADD CONSTRAINT "chapters_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_chapters_lessons" ADD CONSTRAINT "user_chapters_lessons_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_chapters_lessons" ADD CONSTRAINT "user_chapters_lessons_user_id_course_id_chapter_id_user_courses_chapters_user_id_course_id_chapter_id_fk" FOREIGN KEY ("user_id","course_id","chapter_id") REFERENCES "public"."user_courses_chapters"("user_id","course_id","chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_courses" ADD CONSTRAINT "user_courses_org_id_courses_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_courses_chapters" ADD CONSTRAINT "user_courses_chapters_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_courses_chapters" ADD CONSTRAINT "user_courses_chapters_user_id_course_id_user_courses_user_id_org_id_fk" FOREIGN KEY ("user_id","course_id") REFERENCES "public"."user_courses"("user_id","org_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
