import type { quote } from "./quote"

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface prospect {
  id: number
  grpnum: string
  name: string
  dba: string
  group_type: string
  agent_id: string
  addr1: string
  addr2: string
  city: string
  state_cd: string
  zip_cd: string
  county: string
  size_cd: string
  subs_estimate: number
  enroll_date: Date | null
  enrolled_ts: Date | null
  contact: string
  phone: string
  email: string
  census: any
  last_quote: quote | null
  last_quote_id: number | null
  crtusr: string
  crttms: Date
  updtusr: string
  updtms: Date
}
