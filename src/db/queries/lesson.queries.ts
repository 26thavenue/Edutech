import db from "../db"
import { eq , and} from "drizzle-orm";
import { ErrorMiddleware } from "../../middlewares/error.middleware"
import {chapters , courses,users, lessons, userChaptersLessons} from "../schema";
import {  type LessonReq} from "../../types/type";

export const createLessons = async(req:LessonReq) => {

    try {

        const chapter =  await db.
                                select()
                                .from(chapters)
                                .where(eq(chapters.id, req.chapterId))
                                .execute()
        
        if(chapter.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Lesson does not exist', 400);
        }

        const lesson = await db.
                            insert(lessons)
                            .values(req)
                            .returning()

        return lesson
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }


}


export const getLessonById = async(id:string) => {
        
        try {
            
            const lesson = await db.
                                select()
                                .from(lessons)
                                .where(eq(lessons.id, id))
                                .execute()
    
            return lesson
            
        } catch (err) {
            console.error('Unexpected error:', err);
            return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
        }
}

export const updateLessonDetails = async(req:LessonReq, id:string) => {
        
    try {
        const isLesson = await db.
                        select()
                        .from(lessons)
                        .where(eq(lessons.id, id))
                        .execute()
        
        if(isLesson.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Lesson does not exist', 400);
        }
            
        
        const lesson = await db.
                        update(lessons)
                        .set(req)
                        .where(eq(lessons.id, id))
                        .returning()

        return lesson
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const deleteLesson = async(id:string) =>{
                
    try {

        const isLesson = await db.
                        select()
                        .from(lessons)
                        .where(eq(lessons.id, id))
                        .execute()
        
        if(isLesson.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Lesson does not exist', 400);
        }
        
        const deletedLesson = await db.delete(lessons).where(eq(lessons.id, id)).returning()

        return deletedLesson
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const markLessonAsComplete = async(lessonId:string, userId:string, chapterId:string, courseId:string) => {
            
    try {
         const checkUser = await db
                            .select()
                            .from(users)
                            .where(eq(users.id, userId))

        const checkCourse = await db
                            .select()
                            .from(courses)
                            .where(eq(courses.id, courseId))

        const checkChapter = await db.select().from(chapters).where(eq(chapters.id, chapterId))

        if(checkCourse.length <= 0 || checkChapter.length <= 0 || checkUser.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Resource does not exist', 400);
        }
        const isLesson = await db.
                        select()
                        .from(lessons)
                        .where(eq(lessons.id, lessonId))
                        .execute()
        
        if(isLesson.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Lesson does not exist', 400);
        }

        const userLessons = await db.
                                    update(userChaptersLessons)
                                    .set({completed:true})
                                    .where(and( 
                                            eq(userChaptersLessons.userId, userId),
                                            eq(userChaptersLessons.courseId, courseId),
                                            eq(userChaptersLessons.chapterId, chapterId),
                                            eq(userChaptersLessons.lessonId, lessonId)
                                        ))
                                    .returning()

        
        return userLessons


       
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}