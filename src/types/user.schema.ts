import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  status: z.string(),
  fstnam: z.string(), lstnam: z.string(),
  email: z.string().email('Invalid email address format'), // Optional: Adds runtime email string pattern validation
  lst_login: z.coerce.date(),
  config: z.any(),
  rights: z.any(),
  recents: z.array(z.any()),
  faves: z.array(z.any()),
  agency_id: z.number(), agency_descr: z.string(), agency_users: z.array(z.any()),
  crtusr: z.string(), crttms: z.coerce.date(), updtusr: z.string(), updtms: z.coerce.date(),
}).strict();

// Automatically infer your exact Iuser type signature from the schema
export type Iuser = z.infer<typeof UserSchema>;
