import { type Request, type Response } from "express";
import * as userService from "../db/queries/user.queries"
import * as courseService from "../db/queries/course.queries"
import * as chapterService from "../db/queries/chapter.queries"
import { ErrorMiddleware } from "../middlewares/error.middleware"

export const createLesson = async(req:Request, res:Response) => {}

export const getLessonById = async(req:Request, res:Response) => {}

export const deleteLesson = async(req:Request, res:Response) =>{}

export const updateLesson = async(req:Request, res:Response) => {}

export const markLessonCompleted = async(req:Request, res:Response) => {}
