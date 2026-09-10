/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { B } from '@/composables/BUtils'
import { appProspectStore } from './ProspectStore'

export const QuoteStore = defineStore('QuoteStore', () => {
  const number_of_effdates = 10
  const initial_effdate_offset = -2

  const quote = ref<any>({

  })
  const newQuoteOptions = ref<any>({
    name: '',
    prosp: -1,
    size_cd: '',
    family: '',
    effdat: B.firstOfMonth(1),
    grandfathered: false,
    rlob: '',
    funding: 'FI',
    mass_compliant: false
  })
  const initializeNewQuoteOptions = (family:string = 'MED', month_offset:number | null = null) => {
    const prospStore = appProspectStore()
    const opts = newQuoteOptions.value
    opts.prosp = prospStore.prospect.id
    opts.size_cd = prospStore.prospect.size_cd
    opts.family = family
    if (month_offset != null) opts.effdat = B.firstOfMonth(month_offset)
    // opts.grandfathered = false
    if (rlobList[family].length == 1) {
      opts.rlob = rlobList[family][0].rlob
    } else {
      opts.rlob = ''
    }
    // opts.funding = 'FI'
    // opts.mass_compliant = false
    if (!verifyEffdatInRange(opts.effdat)) {
      opts.effdat = ''
    }
  }
  const initializeFromQuote = (q:any) => {
    const prospStore = appProspectStore()
    const opts = newQuoteOptions.value
    opts.name = q.descr
    opts.prosp = prospStore.prospect.id
    opts.size_cd = prospStore.prospect.size_cd
    opts.family = q.qtype
    opts.effdat = B.dateFromYYYYMMDD(q.effdat)
    // opts.grandfathered = false
    opts.rlob = q.rlob
    opts.funding = q.funding
    // opts.mass_compliant = false

    if (!verifyEffdatInRange(opts.effdat)) {
      // Try adding a year for renewal quotes
      const test = new Date(opts.effdat)
      test.setMonth(test.getMonth() + 12)
      if (verifyEffdatInRange(test)) {
        opts.effdat = test
      } else {
        opts.effdat = ''
      }
    }
  }

  const verifyEffdatInRange = (effdat:Date):boolean => {
    if (!effdat) return true// Empty is ok... but not valid
    for (let i = 0; i < number_of_effdates; i++) {
      const test = B.firstOfMonth(i + initial_effdate_offset)
      if (effdat.getTime() == test.getTime()) return true
    }
    // If I get here, effdat is not in range
    return false
  }

  const rlobList = {
  MED: [
    { rlob: 'PPO1', descr: 'Blue Options'},
    { rlob: 'PPO3', descr: 'Blue Options 1-2-3'},
    { rlob: 'HPN1', descr: 'Blue High Performance Network'}
  ] as any[],
  DEN: [
    { rlob: 'DTL1', descr: 'Dental Blue'},
    { rlob: 'DTL2', descr: 'Dental Blue Select'}
  ] as any[],
  VIS: [
    { rlob: 'VIS1', descr: 'Blue 20/20'}
  ] as any[]
} as any

  return {
    quote,
    rlobList,
    newQuoteOptions,
    initializeNewQuoteOptions, initializeFromQuote,
    initial_effdate_offset, number_of_effdates
  }
})
