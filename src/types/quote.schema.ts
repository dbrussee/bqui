import { z } from 'zod';

// 1. Define the complete validation layout schema
export const QuoteSchema = z.object({
  id: z.number(),
  descr: z.string(),
  rlob: z.string(),
  qtype: z.string(),
  funding: z.enum(['FI', 'ASO', 'BF']),
  prospect_id: z.number(), prospect_name: z.string(),
  agent_id: z.string(), agent_fstnam: z.string(), agent_lstnam: z.string(),
  status: z.enum([ 'INPROG', 'QUOTED', 'READY', 'RATEREQ', 'PENDING', 'ENROLLED', 'EXPIRED', 'NEW' ]),
  effdat: z.string(), // Validates clean string payload input (e.g., MM/DD/YYYY)
  size_cd: z.string(),
  nonstd: z.enum(['N', 'Y', 'C']),
  mass_compliant: z.boolean(),
  grandfathered: z.boolean(),
  med_plan: z.string(), dru_plan: z.string(), vis_plan: z.string(), den_plan: z.string(),
  crtusr: z.string(), crttms: z.coerce.date(), updusr: z.string(), updtms: z.coerce.date(),
  extra: z.string().optional(),
  proposals: z.array( z.object({ id: z.number(), descr: z.string(), }) ),
}).strict();

// 2. Automatically infer your exact Iquote interface type signature from the schema
export type Iquote = z.infer<typeof QuoteSchema>;

