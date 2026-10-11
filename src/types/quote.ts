export interface quote {
  id: number
  prospect_id: number
  rlob: string
  status: 'INPROG' | 'QUOTED' | 'READY' | 'RATEREQ' | 'PENDING' | 'ENROLLED' | 'EXPIRED'
  effdat: Date | null
  descr: string
  size_cd: string
  qtype: string
  mass_compliant: boolean
  grandfathered: boolean
  nonstd: 'N' | 'Y' | 'C'
  funding: 'FI' | 'ASO' | 'BF'
  med_plan: string
  dru_plan: string
  vis_plan: string
  den_plan: string
  crtusr: string
  crttms: Date
  updusr: string
  updtms: Date
}
