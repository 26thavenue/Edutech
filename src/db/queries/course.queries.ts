import db from "../db"
import { eq, and } from "drizzle-orm";
import { ErrorMiddleware } from "../../middlewares/error.middleware"
import { userCourses, courses, chapters, users, userCoursesChapters } from "../schema";
import { type CourseReq } from "../../types/type";

export const createCourse = async(req:CourseReq) => {

    try {

        const course = await db.
                            insert(courses)
                            .values(req)
                            .returning()

        return course
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }


}

export const getAllCourses = async() => {
    
        try {
            
            const allCourses = await db.
                                select()
                                .from(courses)
                                .execute()
    
            return allCourses
            
        } catch (err) {
            console.error('Unexpected error:', err);
            return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
        }
}

export const getCourseById = async(id:string) => {
        
        try {
            
            const course = await db.
                                select()
                                .from(courses)
                                .where(eq(courses.id, id))
                                .execute()
    
            return course
            
        } catch (err) {
            console.error('Unexpected error:', err);
            return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
        }
}

export const updateCourseDetails = (req:CourseReq, id:string) => {
        
            try {
                
                const course = db.
                                update(courses)
                                .set(req)
                                .where(eq(courses.id, id))
                                .returning()
        
                return course
                
            } catch (err) {
                console.error('Unexpected error:', err);
                return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
            }
}

export const deleteCourse = (id:string) =>{
                
    try {
        
        const deletedCourses = db.delete(courses).where(eq(courses.id, id)).returning()

        return deletedCourses
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const getUserCourseCount = async(id:string) => {
    try {
        const courseCount = await db.
                            select()
                            .from(userCourses)
                            .where(eq(userCourses.courseId, id))
                            .execute()
        return courseCount.length
        
    } catch (err) {
       
    }
}

export const getAllAuthorCourses = async(author:string) => {
    try {
        const authorCourses = await db.
                            select()
                            .from(courses)
                            .where(eq(courses.author, author))
                            .execute()
        return authorCourses
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const getAllChaptersInCourse = async(courseId:string)=> {
    try {
        const course = await db.
                                select()
                                .from(courses)
                                .where(eq(courses.id, courseId))
                                .execute() 

        if(course.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Course does not exist', 400);
        }

        const chapterArr = await db.
                            select()
                            .from(chapters)
                            .where(eq(chapters.courseId, courseId))
                            .execute()

        return chapterArr
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }

}

export const markCourseCompleted = async(userId:string,  courseId:string) => {
     try {
        const isCourse = await db.
                        select()
                        .from(courses)
                        .where(eq(courses.id, courseId))
                        .execute()
        
        if(isCourse.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Course does not exist', 400);
        }

        const userChapters = await db.
                                    update(userCourses)
                                    .set({completed:true})
                                    .where(
                                        and( 
                                            eq(userCourses.userId, userId),
                                            eq(userCourses.courseId, courseId),
                                        ))
                                    .returning()

        
        return userChapters

        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const getChaptersCompletedInACourse = async(userId:string, courseId:string, chapterId:string) => {
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

        const completedLessons = await db.
                                    select().
                                    from(userCoursesChapters)
                                    .where(and( 
                                            eq(userCoursesChapters.userId, userId),
                                            eq(userCoursesChapters.courseId, courseId),
                                            eq(userCoursesChapters.chapterId, chapterId),
                                            eq(userCoursesChapters.completed, true)
                                        ))
                                    .execute()

        
        return completedLessons
        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
}

export const getCourseProgress = async(userId:string, courseId:string, chapterId:string, lessonId:string) => {



    try {

         const checkUser = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, userId))

        const checkCourse = await db
                            .select()
                            .from(courses)
                            .where(eq(courses.id, courseId))

        if(checkCourse.length <= 0  || checkUser.length <= 0){
            return new ErrorMiddleware('Bad Request', 'Resource does not exist', 400);
        }

        const completedChapters = await getChaptersCompletedInACourse(userId, courseId, chapterId)
        const totalChapters = await getAllChaptersInCourse(courseId)

        if ( completedChapters instanceof ErrorMiddleware ) {
            return completedChapters
        }

        if(totalChapters instanceof ErrorMiddleware){
            return totalChapters
        }

        if(completedChapters.length <= 0){
            return 0 ;
        }

        const chaptersPerc = ((completedChapters.length/totalChapters.length ) * 100).toFixed(2)

        if(chaptersPerc === '100.00'){
            await markCourseCompleted(userId,  courseId)
        }

         const lesson = await db.update(userCourses).set({progress: `${chaptersPerc}0%`}).where(
                        and( 
                            eq(userCourses.userId, userId),
                            eq(userCourses.courseId, courseId),
                        )
                    ).returning()

    return lesson.length

        
    } catch (err) {
        console.error('Unexpected error:', err);
        return new ErrorMiddleware('Internal Server Error', 'An unexpected error occurred', 500);
    }
   
}
