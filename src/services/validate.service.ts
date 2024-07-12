import { z } from 'zod';
import { type NextFunction, type Request, type Response } from 'express';
import { ZodSchema } from 'zod';

export const userSchema = z.object({
  firstName: z.string().min(1, 'Name must be at least a character long'),
  lastName: z.string().min(1, 'Name must be at least a character long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email or password'),
  password: z.string().min(6, 'Invalid email or password')
});

export const orgSchema =  z.object({
  name: z.string().min(6,'Name must be at least 6 character long'),
});

const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ errors });
    }
    
    return res.status(500).json({ 
      errors: [{ field: "unknown", message: "An unexpected error occurred" }]
    });
  }
};

export default validateRequest;