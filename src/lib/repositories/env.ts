import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const createEnvRepository = () => {
  const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
      DATABASE_URL: z.string().url(),
      PORT: z.coerce.number().int().positive(),
      NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
      RABBITMQ_HOST: z.string(),
      RABBITMQ_PORT: z.coerce.number().int().positive(),
      RABBITMQ_USERNAME: z.string(),
      RABBITMQ_PASSWORD: z.string(),
      LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
      RABBITMQ_HOST: process.env.RABBITMQ_HOST,
      RABBITMQ_PORT: process.env.RABBITMQ_PORT,
      RABBITMQ_USERNAME: process.env.RABBITMQ_USERNAME,
      RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
      LOG_LEVEL: process.env.LOG_LEVEL,
      // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    /**
     * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
     * `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
  });

  return env;
};

export type EnvRepository = ReturnType<typeof createEnvRepository>;
