import { z } from 'zod';
import { QuoteSchema }  from '@/types'; // 👈 Import neighbor quote schema
import { type ICensusMember } from '@/types';

export const ProspectSchema = z.object({
  id: z.number(),
  grpnum: z.string(),
  name: z.string(),
  dba: z.string(),
  group_type: z.string(),
  agent_id: z.string(),
  addr1: z.string(), addr2: z.string(),
  city: z.string(), state_cd: z.string(), zip_cd: z.string(), county: z.string(),
  size_cd: z.string(),
  subs_estimate: z.number(),
  enroll_date: z.coerce.date().nullable(),
  enrolled_ts: z.coerce.date().nullable(),
  contact: z.string(), phone: z.string(), email: z.string(),
  census: z.array(z.custom<ICensusMember>()).optional(),
  last_quote: QuoteSchema.nullable(), last_quote_id: z.number().nullable(),
  crtusr: z.string(), crttms: z.coerce.date(), updusr: z.string(), updtms: z.coerce.date(),
}).strict();

// Automatically infer your exact Iprospect type signature from the schema
export type Iprospect = z.infer<typeof ProspectSchema>;
