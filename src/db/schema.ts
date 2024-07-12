import { pgTable, text,boolean, timestamp, uuid, primaryKey, foreignKey } from 'drizzle-orm/pg-core';
import { relations} from 'drizzle-orm';


enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}


// INDIVIDUAL TABLES

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('firstName').notNull(),
  lastName: text('lastName').notNull(),
  phone: text('phone'),
  password: text('password').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  role : text('role').notNull().default(UserRole.USER),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  author: text('author').notNull(),
  free: boolean('free').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  chapterId: uuid('chapter_id').notNull().references(() => chapters.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})





// JOINT TABLES

export const userCourses = pgTable('user_courses',{
  userId: uuid('user_id').notNull().references(() => users.id),
  courseId: uuid('org_id').notNull().references(() => courses.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completed: boolean('completed').notNull().default(false),
  progress: text('progress').notNull().default('0%'),
},
(t)=>({
    pk:primaryKey({columns:[t.userId, t.courseId]})
})
);

export const userCoursesChapters = pgTable('user_courses_chapters', {
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').notNull(),
  chapterId: uuid('chapter_id').notNull().references(() => chapters.id),
  completed: boolean('completed').notNull().default(false),
  progress: text('progress').notNull().default('0%'),
},
(t) => ({
  pk: primaryKey({columns: [t.userId, t.courseId, t.chapterId]}),
  userCourseFk: foreignKey({
    columns: [t.userId, t.courseId],
    foreignColumns: [userCourses.userId, userCourses.courseId],
    
  }).onDelete('cascade'),
}));

export const userChaptersLessons = pgTable('user_chapters_lessons', {
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').notNull(),
  chapterId: uuid('chapter_id').notNull(),
  lessonId: uuid('lesson_id').notNull().references(() => lessons.id),
  completed: boolean('completed').notNull().default(false),
},
(t) => ({
  pk: primaryKey({columns: [t.userId, t.courseId, t.chapterId, t.lessonId]}),
  userCourseChapterFk: foreignKey({
    columns: [t.userId, t.courseId, t.chapterId],
    foreignColumns: [userCoursesChapters.userId, userCoursesChapters.courseId, userCoursesChapters.chapterId],
  }).onDelete('cascade'),
}));




// RELATIONS

export const usersRelations = relations(users, ({ many }) => ({
  userCourses: many(userCourses),
}));


export const coursesRelations = relations(courses, ({ many }) => ({
  users: many(userCourses),
}));


export const chaptersRelations = relations(chapters, ({ many }) => ({
  userCoursesChapters: many(userCoursesChapters),
}));

export const userCoursesRelations = relations(userCourses, ({ one }) => ({
  user: one(users, {
    fields: [userCourses.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [userCourses.courseId],
    references: [courses.id],
  }),
}));

export const userCoursesChaptersRelations = relations(userCoursesChapters, ({ one }) => ({
  userCourse: one(userCourses, {
    fields: [userCoursesChapters.userId, userCoursesChapters.courseId],
    references: [userCourses.userId, userCourses.courseId],
  }),
  chapter: one(chapters, {
    fields: [userCoursesChapters.chapterId],
    references: [chapters.id],
  }),
}));



export const userChaptersLessonsRelations = relations(userChaptersLessons, ({ one }) => ({
  userCourseChapter: one(userCoursesChapters, {
    fields: [userChaptersLessons.userId, userChaptersLessons.courseId, userChaptersLessons.chapterId],
    references: [userCoursesChapters.userId, userCoursesChapters.courseId, userCoursesChapters.chapterId],
  }),
  lesson: one(lessons, {
    fields: [userChaptersLessons.lessonId],
    references: [lessons.id],
  }),
}));







