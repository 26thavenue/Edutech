import db from "../db"
import { eq, and } from "drizzle-orm";
import { ErrorMiddleware } from "../../middlewares/error.middleware"
import {chapters , users,courses, lessons, userChaptersLessons, userCoursesChapters} from "../schema";
import { type ChapterReq } from "../../types/type";

export const createChapter = async(req:ChapterReq) => {

    try {

        const course =  await db.
                                select()
                                .from(courses)
                                .where(eq(courses.id, req.courseId))
                                .execute()
        
        if(course.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Chapter does not exist', 400);
        }

        const chapter = await db.
                            insert(chapters)
                            .values(req)
                            .returning()

        return chapter
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }


}


export const getChapterById = async(id:string) => {
        
        try {
            
            const chapter = await db.
                                select()
                                .from(chapters)
                                .where(eq(chapters.id, id))
                                .execute()
            if(chapter.length <= 0){
                return new ErrorMiddleware('Bad Request', 'Chapter does not exist', 400);
            }

    
            return chapter
            
        } catch (err) {
            console.error('Unexpected error:', err);
            return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
        }
}

export const updateChapterDetails =async (req:ChapterReq, id:string) => {
        
    try {
        const isChapterArr = await db.
                            select()
                            .from(chapters)
                            .where(eq(chapters.id, id))
                            .execute()
                            
        if(isChapterArr.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Chapter does not exist', 400);
        }
        
        const chapter = await db.
                        update(chapters)
                        .set(req)
                        .where(eq(chapters.id, id))
                        .returning()

        return chapter
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const deleteChapter = async(id:string) =>{
                
    try {
        const isChapterArr = await db.
                            select()
                            .from(chapters)
                            .where(eq(chapters.id, id))
                            .execute()

        if(isChapterArr.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Chapter does not exist', 400);
        }
        
        const deletedChapter = await db.delete(chapters).where(eq(chapters.id, id)).returning()

        return deletedChapter
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const getAllLessonsInAChapter = async(chapterId:string)=> {
    try {
        const chapter = await db.
                                select()
                                .from(chapters)
                                .where(eq(chapters.id, chapterId))
                                .execute() 

        if(chapter.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Chapter does not exist', 400);
        }

        const lessonArr = await db.
                            select()
                            .from(lessons)
                            .where(eq(lessons.chapterId, chapterId))
                            .execute()

        return lessonArr
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }

}

export const markChapterCompleted = async(userId:string, chapterId:string, courseId:string) => {
    try {
        const isChapter = await db.
                        select()
                        .from(chapters)
                        .where(eq(chapters.id, chapterId))
                        .execute()
        
        if(isChapter.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Chapter does not exist', 400);
        }

        const userChapters = await db.
                                    update(userCoursesChapters)
                                    .set({completed:true})
                                    .where(
                                        and( 
                                            eq(userCoursesChapters.userId, userId),
                                            eq(userCoursesChapters.courseId, courseId),
                                            eq(userCoursesChapters.chapterId, chapterId)
                                        ))
                                    .returning()

        
        return userChapters


       
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const getLessonsCompletedInAChapter = async(userId:string, courseId:string, chapterId:string, lessonId:string) =>{
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

        const completedLessons = await db.
                                    select().
                                    from(userChaptersLessons)
                                    .where(and( 
                                            eq(userChaptersLessons.userId, userId),
                                            eq(userChaptersLessons.courseId, courseId),
                                            eq(userChaptersLessons.chapterId, chapterId),
                                            eq(userChaptersLessons.lessonId, lessonId),
                                            eq(userChaptersLessons.completed, true)
                                        ))
                                    .execute()

        
        return completedLessons


       
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const increaseChapterProgress = async(userId:string, courseId:string, chapterId:string, lessonId:string) =>{
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

    const completedLessons = await getLessonsCompletedInAChapter(userId, courseId, chapterId, lessonId)
    const totalLessons = await getAllLessonsInAChapter(chapterId)

    if ( completedLessons instanceof ErrorMiddleware ) {
        return completedLessons
    }

    if(totalLessons instanceof ErrorMiddleware){
        return totalLessons
    }

    if(completedLessons.length <= 0){
        return 0 ;
    }

    const lessonsPerc = ((completedLessons.length/totalLessons.length ) * 100).toFixed(2)

    if(lessonsPerc === '100.00'){
        await markChapterCompleted(userId, chapterId, courseId)
    }

    const lesson = await db.update(userCoursesChapters).set({progress: `${lessonsPerc}0%`}).where(
        and( 
            eq(userCoursesChapters.userId, userId),
            eq(userCoursesChapters.courseId, courseId),
            eq(userCoursesChapters.chapterId, chapterId)
        )
    ).returning()

    return lesson.length
}