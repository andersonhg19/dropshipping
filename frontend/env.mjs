import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    ANALYZE: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => value === 'true'),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_ID_COMPANY: z.string().regex(/^\d+$/),
    NEXT_PUBLIC_CACHE_SECRET: z.string().min(8).optional(),
    NEXT_PUBLIC_TIMEZONE: z.string().default('America/Bogota'),
    NEXT_PUBLIC_DECIMALS_NUMBER: z
      .string()
      .regex(/^\d+$/)
      .default('0')
      .transform((val) => parseInt(val, 10)),
  },
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ID_COMPANY: process.env.NEXT_PUBLIC_ID_COMPANY,
    NEXT_PUBLIC_CACHE_SECRET: process.env.NEXT_PUBLIC_CACHE_SECRET,
    NEXT_PUBLIC_TIMEZONE: process.env.NEXT_PUBLIC_TIMEZONE,
    NEXT_PUBLIC_DECIMALS_NUMBER: process.env.NEXT_PUBLIC_DECIMALS_NUMBER,

  },
});
