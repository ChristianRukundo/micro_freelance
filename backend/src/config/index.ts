import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.preprocess(Number, z.number().int().positive().default(5000)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_EXPIRATION: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRATION: z.string().default('7d'),

  FRONTEND_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),

  OTP_EXPIRY_MINUTES: z.preprocess(Number, z.number().int().positive().default(10)),

  EMAIL_HOST: z.string().default('smtp.ethereal.email'),
  EMAIL_PORT: z.preprocess(Number, z.number().int().positive().default(587)),
  EMAIL_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(false)),
  EMAIL_USER: z.string().email('EMAIL_USER must be a valid email address'),
  EMAIL_PASS: z.string(),

  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  STRIPE_CONNECT_RETURN_URL: z.string().url('STRIPE_CONNECT_RETURN_URL must be a valid URL'),

  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required'),

  PLATFORM_COMMISSION_PERCENTAGE: z.preprocess(Number, z.number().min(0).max(100).default(10)),
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

try {
  config = envSchema.parse(process.env);
} catch (error: any) {
  console.error('Environment variable validation failed:', error.errors);
  process.exit(1);
}

export default config;