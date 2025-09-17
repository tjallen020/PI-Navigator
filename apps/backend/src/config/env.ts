import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  PORT: z.string().default('4000'),
  NODE_ENV: z.string().default('development'),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT ?? '4000',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
});
