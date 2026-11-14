
export type ICensusMember = {
  id?: string,
  relation?: 'SUB' | 'SPS' | 'DOM' | 'CHD' | 'OTH',
  fstnam?: string, lstnam?: string, midnam?: string, suffix?: string,
  dob?: string, sex?: 'M' | 'F',
  med: boolean, den: boolean, vis: boolean,
  dis?: boolean, cobra?: boolean,
  deps: ICensusMember[]
}
