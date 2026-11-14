import { z } from 'zod';

export const APIResponseSchema = z.object({
  meta: z.object({
    times: z.object({ start: z.date(), end: z.date().nullable(), ms: z.number().nullable(), }),
    client: z.object({ ip: z.string(), userid: z.string(), browser: z.string(), }),
    endpoint: z.object({ url: z.string(), method: z.string(), status: z.object({ code: z.number(), descr: z.string(), }), }),
    host: z.object({ ip: z.string(), hostname: z.string(), })
  }),
  resp: z.any(), // Them main payload data, which can be any type (object, array, string, etc.)
  issue: z.object({
    message: z.string().optional(),
    level: z.literal('INFO', 'ERROR').optional(),
    stack: z.array(z.string()).optional(), }),
});

// Automatically infer your exact Iprospect type signature from the schema
export type IAPIResponse = z.infer<typeof APIResponseSchema>;
