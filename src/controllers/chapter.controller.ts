import { type Request, type Response } from "express";
import * as userService from "../db/queries/user.queries"
import * as courseService from "../db/queries/course.queries"
import * as chapterService from "../db/queries/chapter.queries"
import { ErrorMiddleware } from "../middlewares/error.middleware"
 
export const getChapterById = async() => {}

export const deleteChapter = async() => {}

export const updateChapter = async() => {}

export const createChapter = async() => {}  

export const markChapterCompleted = async() => {}

export const getChapterProgress = async() => {}

export const getAllLessonsInAChapter = async() => {}

export const getCompletedLesons = async() => {}

