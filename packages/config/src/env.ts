import { z } from "zod";

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  GOOGLE_CLOUD_PROJECT: z.string().min(1),
  FIRESTORE_DATABASE_ID: z.string().default("(default)"),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional()
});

export type AppEnv = z.infer<typeof appEnvSchema>;

export const parseAppEnv = (source: Record<string, string | undefined>) => appEnvSchema.parse(source);
