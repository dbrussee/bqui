/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { B } from '@/composables/BUtils'
import { appProspectStore } from './ProspectStore'
import { useToast } from '@/composables/useToast'
import BQAPIFetcher from '@/components/BQAPI'

export const QuoteStore = defineStore('QuoteStore', () => {
  const NUMBER_OF_EFFDATES = 10
  const INITIAL_EFFDATE_OFFSET = -2
  const quote = ref<any>({
    descr: '',
    prosp: -1,
    status: 'INPROG',
    size_cd: '',
    qtype: '',
    effdat: B.firstOfMonth(1),
    mass_compliant: false,
    grandfathered: false,
    nonstd: 'N',
    rlob: '',
    funding: 'FI',
    med_plan: '', dru_plan: '', vis_plan: '', den_plan: ''
  })
  const BLANK_QUOTE = {
    descr: '',
    prosp: -1,
    status: 'INPROG',
    size_cd: '',
    qtype: '',
    effdat: B.firstOfMonth(1),
    grandfathered: false,
    mass_compliant: false,
    nonstd: 'N',
    rlob: '',
    funding: 'FI',
    med_plan: '', dru_plan: '', vis_plan: '', den_plan: ''
  }
  // const UNUSEDQuoteOptions = ref<any>({
  //   descr: '',
  //   prosp: -1,
  //   size_cd: '',
  //   qtype: '',
  //   effdat: B.firstOfMonth(1),
  //   grandfathered: false,
  //   nonstd: 'N',
  //   rlob: '',
  //   funding: 'FI',
  //   mass_compliant: false,
  //   med_plan: '', dru_plan: '', vis_plan: '', den_plan: ''
  // })

  const createQuote = async ():Promise<any> => {
    const fetcher = await new BQAPIFetcher().callAPI(`/quote`, 'POST', quote.value)
    if (fetcher.resp != null) {
      const q:any = {...fetcher.resp}
      if (q.med_plan == null) q.med_plan = ''
      if (q.dru_plan == null) q.dru_plan = ''
      if (q.vis_plan == null) q.vis_plan = ''
      if (q.den_plan == null) q.deb_plan = ''
      appProspectStore().quotes.unshift(q)
      appProspectStore().quotes = sortQuotes(appProspectStore().quotes)
      appProspectStore().prospect.last_quote = {...q}
      appProspectStore().prospect.last_quote_id = q.id
      if (fetcher.issue) {
        useToast().addToast(`Error creating quote: ${fetcher.issue.error}`, "error")
      } else {
        useToast().addToast(`Quote ${q.id} created`, "success")
      }
      quote.value = {...q}
      return q
    } else {
      return null
    }
  }
  const deleteQuote = async (qid:number) => {
    const fetcher = await new BQAPIFetcher().callAPI(`/quote/${qid}`, 'DELETE')
    if (fetcher.issue) {
      useToast().addToast(`Error deleting quote: ${fetcher.issue.error}`, "error")
    } else {
      if (fetcher.resp == null) { // No more quotes
        appProspectStore().prospect.last_quote = null
        appProspectStore().prospect.last_quote_id = null
      } else { // Found a new last quote
        const newLastQuote = fetcher.resp
        appProspectStore().prospect.last_quote = {...newLastQuote}
        appProspectStore().prospect.last_quote_id = newLastQuote.id
      }
      quote.value = {...BLANK_QUOTE}
      appProspectStore().quotes = appProspectStore().quotes.filter((q) => {
        return q.id != qid
      })
      useToast().addToast(`Quote ${qid} deleted`, "success")
    }
  }
  const updateQuote = async (q:any, action:string):Promise<unknown> => {
    const fetcher = await new BQAPIFetcher().callAPI(`/quote`, 'PUT', q)
    if (fetcher.resp != null) {
      if (fetcher.issue) {
        useToast().addToast(`Error: ${fetcher.issue.error}`, "error")
        return null
      } else {
        useToast().addToast(`Quote ${fetcher.resp.id} ${action}`, "success")
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


  const initializeNewQuoteOptions = (qtype:string = 'MED', month_offset:number | null = null) => {
    const prospStore = appProspectStore()
    const q = quote.value
    q.prosp = prospStore.prospect.id
    q.size_cd = prospStore.prospect.size_cd
    q.qtype = qtype
    if (month_offset != null) q.effdat = B.firstOfMonth(month_offset)
    // opts.grandfathered = false
    if (rlobList[qtype] && rlobList[qtype].length == 1) {
      q.rlob = rlobList[qtype][0]
    } else {
      q.rlob = ''
    }
    // opts.funding = 'FI'
    // opts.mass_compliant = false
    if (typeof q.effdat == 'string') q.effdat = B.dateFromYYYYMMDD(q.effdat)

    if (!verifyEffdatInRange(q.effdat)) {
      q.effdat = ''
    }
  }
  const initializeFromQuote = (q:any) => {
    const prospStore = appProspectStore()
    const opts = quote.value
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
    for (let i = 0; i < NUMBER_OF_EFFDATES; i++) {
      const test = B.firstOfMonth(i + INITIAL_EFFDATE_OFFSET)
      // console.log("Eff", effdat.getTime(), "Test", test.getTime())
      if (effdat.getTime() == test.getTime()) return true
    }
    // If I get here, effdat is not in range
    return false
  }

  const rlobList: Record<string, string[]> = {
    'MED': [ 'PPO1', 'PPO3', 'HPN1' ],
    'DEN': [ 'DTL1', 'DTL2' ],
    'VIS': [ 'VIS1' ]
  }

  return {
    quote,
    rlobList,
    // newQuoteOptions,
    initializeNewQuoteOptions, initializeFromQuote,
    initial_effdate_offset: INITIAL_EFFDATE_OFFSET, number_of_effdates: NUMBER_OF_EFFDATES,
    createQuote, deleteQuote, updateQuote
  }
})
