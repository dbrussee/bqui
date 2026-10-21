/* eslint-disable @typescript-eslint/no-explicit-any */
export interface user {
  id: string
  status: string
  fstnam: string
  lstnam: string
  email: string
  lst_login: Date
  crtusr: string
  crttms: Date
  updtusr: string
  updtms: Date
  config: any
  rights: any
  recents: any[]
  faves: any[]
  agency_id: number
  agency_descr: string
  agency_users: any[]
}
