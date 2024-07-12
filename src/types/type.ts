import {courses, users, chapters, userCourses,lessons} from '../db/schema';

import { type InferSelectModel , type InferInsertModel} from 'drizzle-orm';

export type UserReq = InferInsertModel<typeof users>;

export type User = InferSelectModel<typeof users>

export type CourseReq = InferInsertModel<typeof courses>

export type Course = InferSelectModel<typeof courses>

export type ChapterReq = InferInsertModel<typeof chapters>

export type Chapter = InferSelectModel<typeof chapters>

export type UserCourseReq = InferInsertModel<typeof userCourses>

export type UserCourse = InferSelectModel<typeof userCourses>

export type LessonReq = InferInsertModel<typeof lessons>

export type Lesson = InferSelectModel<typeof lessons>


export type LoginReq = {
    email: string;
    password: string;
}

