import express,{type Request, type Response , type NextFunction} from 'express';
import {logger} from '../utils/util';

const loggerMiddleware = (req: Request, res:Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} ${req.ip}`);
  next();
};

export default loggerMiddleware;