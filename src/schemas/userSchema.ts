import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(20,'Name must not be greater than 20 characters'),
  email: z.string().email('Invalid email address'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be male or female' }),
  }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
