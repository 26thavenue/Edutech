import {Router} from "express"
import * as lessonController from "../controllers/lesson.controller"
import {authMiddleware} from "../middlewares/auth.middleware"
import {adminMiddleware} from "../middlewares/admin.middleware"
const router = Router()