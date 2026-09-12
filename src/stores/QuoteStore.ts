/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { B } from '@/composables/BUtils'
import { appProspectStore } from './ProspectStore'
import { useToast } from '@/composables/useToast'
import BQAPIFetcher from '@/components/BQAPI'

export const QuoteStore = defineStore('QuoteStore', () => {
  const number_of_effdates = 10
  const initial_effdate_offset = -2

  const createQuote = async (jsonBody:string):Promise<any> => {
    const fetcher = await new BQAPIFetcher().callAPI(`/quote`, 'POST', jsonBody)
    if (fetcher.resp != null) {
      const q:any = {...fetcher.resp}
      if (q.med_plan == null) q.med_plan = ''
      if (q.dru_plan == null) q.dru_plan = ''
      if (q.vis_plan == null) q.vis_plan = ''
      if (q.den_plan == null) q.deb_plan = ''
      appProspectStore().quotes.unshift(q)
      appProspectStore().quotes = sortQuotes(appProspectStore().quotes)
      if (fetcher.issue) {
        useToast().addToast(`Error creating quote: ${fetcher.issue.error}`, "error")
      } else {
        useToast().addToast(`Quote ${q.id} created`, "success")
      }
      return q
    } else {
      return null
    }
  }
  const deleteQuote = async (qid:number) => {
    const fetcher = await new BQAPIFetcher().callAPI(`/quote/${qid}`, 'DELETE')
    if (fetcher.resp != null) {
      appProspectStore().quotes = appProspectStore().quotes.filter((q) => {
        return q.id != qid
      })
      //  = sortQuotes(fetcher.resp)
    }
    if (fetcher.issue) {
      useToast().addToast(`Error deleting quote: ${fetcher.issue.error}`, "error")
    } else {
      useToast().addToast(`Quote ${qid} deleted`, "success")
    }
  }
  const updateQuote = async (q:any):Promise<unknown> => {
    const fetcher = await new BQAPIFetcher().callAPI(`/quote`, 'PUT', q)
    if (fetcher.resp != null) {
      if (fetcher.issue) {
        useToast().addToast(`Error updating quote: ${fetcher.issue.error}`, "error")
        return null
      } else {
        useToast().addToast(`Quote ${fetcher.resp.id} updated`, "success")
        return fetcher.resp
      }
    }
  }

  function sortQuotes(original:any[]):any[] {
    const sorted = original.sort((a, b) => {
      const aDate = new Date(a.effdat)
      const bDate = new Date(b.effdat)
      if (aDate < bDate) return 1
      if (aDate > bDate) return -1
      if (a.id < b.id) return -1
      if (a.id > b.id) return 1
      return 0
    })
    return sorted
  }


  const quote = ref<any>({

  })
  const newQuoteOptions = ref<any>({
    descr: '',
    prosp: -1,
    size_cd: '',
    qtype: '',
    effdat: B.firstOfMonth(1),
    grandfathered: false,
    nonstd: 'N',
    rlob: '',
    funding: 'FI',
    mass_compliant: false,
    med_plan: '', dru_plan: '', vis_plan: '', den_plan: ''
  })
  const initializeNewQuoteOptions = (qtype:string = 'MED', month_offset:number | null = null) => {
    const prospStore = appProspectStore()
    const opts = newQuoteOptions.value
    opts.prosp = prospStore.prospect.id
    opts.size_cd = prospStore.prospect.size_cd
    opts.qtype = qtype
    if (month_offset != null) opts.effdat = B.firstOfMonth(month_offset)
    // opts.grandfathered = false
    if (rlobList[qtype].length == 1) {
      opts.rlob = rlobList[qtype][0].rlob
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
    opts.descr = q.descr
    opts.prosp = prospStore.prospect.id
    opts.size_cd = prospStore.prospect.size_cd
    opts.qtype = q.qtype
    opts.effdat = B.dateFromYYYYMMDD(q.effdat)
    // opts.grandfathered = false
    opts.rlob = q.rlob
    opts.funding = q.funding
    // opts.mass_compliant = false
    opts.med_plan = q.med_plan
    opts.dru_plan = q.dru_plan
    opts.vis_plan = q.vis_plan
    opts.den_plan = q.den_plan

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

  const rlobs = {
    PPO1: {descr: 'Blue Options', qtype: 'MED'},
    PPO3: {descr: 'Blue Options 1-2-3', qtype: 'MED'},
    HPN1: {descr: 'Blue High Performance Network', qtype: 'MED'},
    DTL1: {descr: 'Dental Blue', qtype: 'DEN'},
    DTL2: {descr: 'Dental Blue Select', qtype: 'DEB'},
    VIS1: {descr: 'Blue 20/20', qtype: 'VUS'}
  } as any
  const rlobList = {
    MED: [
      { rlob: 'PPO1', descr: rlobs.PPO1.descr},
      { rlob: 'PPO3', descr: rlobs.PPO3.descr},
      { rlob: 'HPN1', descr: rlobs.HPN1.descr}
    ] as any[],
    DEN: [
      { rlob: 'DTL1', descr: rlobs.DTL1.descr},
      { rlob: 'DTL2', descr: rlobs.DTL2.descr}
    ] as any[],
    VIS: [
      { rlob: 'VIS1', descr: rlobs.VIS1.descr}
  ] as any[]
} as any

  return {
    quote,
    rlobs, rlobList,
    newQuoteOptions,
    initializeNewQuoteOptions, initializeFromQuote,
    initial_effdate_offset, number_of_effdates,
    createQuote, deleteQuote, updateQuote
  }
})
