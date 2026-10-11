/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { B } from '@/composables/BUtils'
import { appProspectStore } from './ProspectStore'
import { useToast } from '@/composables/useToast'
import BQAPIFetcher from '@/components/BQAPI'
import type { quote } from '@/types/quote'
import { ref } from 'vue'

export const QuoteStore = defineStore('QuoteStore', () => {
  const NUMBER_OF_EFFDATES = 10
  const INITIAL_EFFDATE_OFFSET = -2
  const working = ref<any>(null)
  const quote = ref<quote>({
    descr: '',
    id: -1,
    prospect_id: -1,
    status: 'INPROG',
    size_cd: '',
    qtype: '',
    effdat: B.firstOfMonth(1),
    mass_compliant: false,
    grandfathered: false,
    nonstd: 'N',
    rlob: '',
    funding: 'FI',
    med_plan: '', dru_plan: '', vis_plan: '', den_plan: '',
    crtusr: '', crttms: new Date(), updusr: '', updtms: new Date()
  })

  const createQuote = async ():Promise<any> => {
    B.working.set(working, "Creating Quote...")
    const fetcher = await new BQAPIFetcher().callAPI(`/quote`, 'POST', quote.value)
    B.working.clear(working)
    if (fetcher.resp != null) {
      const q:any = {...fetcher.resp}
      if (q.med_plan == null) q.med_plan = ''
      if (q.dru_plan == null) q.dru_plan = ''
      if (q.vis_plan == null) q.vis_plan = ''
      if (q.den_plan == null) q.deb_plan = ''
      const prospStore = appProspectStore()
      prospStore.quotes.unshift(q)
      prospStore.quotes = sortQuotes(appProspectStore().quotes)
      if (!prospStore.prospect) return null
      prospStore.prospect.last_quote = {...q}
      prospStore.prospect.last_quote_id = q.id
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
  const blankQuote = (qtype:string):void => {
    quote.value = {
      id: -1,
      descr: '',
      prospect_id: -1,
      status: 'INPROG',
      size_cd: '',
      qtype: qtype,
      effdat: B.firstOfMonth(1),
      grandfathered: false,
      mass_compliant: false,
      nonstd: 'N',
      rlob: '',
      funding: 'FI',
      med_plan: 'M_NOPLN', dru_plan: 'R_NOPLN', vis_plan: 'V_NOPLN', den_plan: 'D_NOPLN',
      crtusr: '', crttms: new Date(), updusr: '', updtms: new Date()
    }
  }
  const deleteQuote = async (qid:number) => {
    B.working.set(working, "Deleting Quote...")
    const fetcher = await new BQAPIFetcher().callAPI(`/quote/${qid}`, 'DELETE')
    B.working.clear(working)
    if (fetcher.issue) {
      useToast().addToast(`Error deleting quote: ${fetcher.issue.error}`, "error")
    } else {
      const prospStore = appProspectStore()
      if (!prospStore.prospect) return
      if (fetcher.resp == null) { // No more quotes
        prospStore.prospect.last_quote = null
        prospStore.prospect.last_quote_id = null
      } else { // Found a new last quote
        const newLastQuote = fetcher.resp
        prospStore.prospect.last_quote = {...newLastQuote}
        prospStore.prospect.last_quote_id = newLastQuote.id
      }
      blankQuote(quote.value.qtype)
      appProspectStore().quotes = appProspectStore().quotes.filter((q) => {
        return q.id != qid
      })
      useToast().addToast(`Quote ${qid} deleted`, "success")
    }
  }
  const updateQuote = async (q:any, action:string):Promise<unknown> => {
    B.working.set(working, "Updating Quote...")
    const fetcher = await new BQAPIFetcher().callAPI(`/quote`, 'PUT', q)
    B.working.clear(working)
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


  const initializeNewQuoteOptions = (qtype:string = 'MED', pickedQuote:any = null) => {
    const prospStore = appProspectStore()
    if (!prospStore.prospect) return
    blankQuote(qtype)
    const q = quote.value
    q.prospect_id = prospStore.prospect.id
    q.size_cd = prospStore.prospect.size_cd
    if (pickedQuote != null) q.effdat = B.dateFromYYYYMMDD(pickedQuote.effdat)
    // opts.grandfathered = false

    getRLOBList(prospStore.prospect.id)
  }
  const initializeFromQuote = (q:quote) => {
    const prospStore = appProspectStore()
    if (!prospStore.prospect) return
    const opts = quote.value
    opts.descr = q.descr as string
    if (!opts.descr.endsWith("- Copy")) opts.descr += ' - Copy'
    opts.prospect_id = prospStore.prospect.id
    opts.size_cd = prospStore.prospect.size_cd
    opts.qtype = q.qtype
    opts.effdat = B.dateFromYYYYMMDD(q.effdat)
    // opts.grandfathered = false
    getRLOBList(prospStore.prospect.id)
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
      }
    }
  }

  const verifyEffdatInRange = (effdat:Date | null):boolean => {
    if (!effdat) return true// Empty is ok... but not valid
    for (let i = 0; i < NUMBER_OF_EFFDATES; i++) {
      const test = B.firstOfMonth(i + INITIAL_EFFDATE_OFFSET)
      // console.log("Eff", effdat.getTime(), "Test", test.getTime())
      if (effdat.getTime() == test.getTime()) return true
    }
    // If I get here, effdat is not in range
    return false
  }

  const rlobList:any = {
    'MED': ref<[]>([]),
    'DRU': ref<[]>([]),
    'DEN': ref<[]>([]),
    'VIS': ref<[]>([])
  }

  const getRLOBList = async (pid:number) => {
    B.working.set(working, "Getting avaiable product lines...")
    const preRLOB = quote.value?.rlob || 'BEEF'
    rlobList.MED.value.length = 0
    rlobList.DRU.value.length = 0
    rlobList.VIS.value.length = 0
    rlobList.DEN.value.length = 0
    const eff = B.format.dateMDYYYY(quote.value.effdat)
    const fetcher = new BQAPIFetcher()
    await fetcher.callAPI(`/plancodecounts/${pid}?eff=${eff}`, 'GET')
    B.working.clear(working)
    // console.dir(fetcher.resp)
    if (fetcher.issue) {
      useToast().addToast(`Error getting RLOBs: ${fetcher.issue.error}`, "error")
    } else {
      if (fetcher.resp != null) { // No RLOBs with plans
        const avail = fetcher.resp.avail
        rlobList.MED.value = avail?.MED || []
        rlobList.DRU.value = avail?.DRU || []
        rlobList.VIS.value = avail?.VIS || []
        rlobList.DEN.value = avail?.DEN || []

        const list = rlobList[quote.value.qtype].value
        if (list) {
          if (list.length == 1) {
            quote.value.rlob = list[0]
          } else if (list.includes(preRLOB)) {
            quote.value.rlob = preRLOB
          } else {
            quote.value.rlob = ''
          }
        } else {
          quote.value.rlob = ''
        }
        if (!verifyEffdatInRange(quote.value.effdat)) {
          quote.value.effdat = null
        }
      }
    }
  }

  const planList = ref<any[]>([])
  const drugPlanList = ref<any[]>([])
  const getPlanList = async (pid:number) => {
    B.working.set(working, "Getting avaiable plan codes...")
    planList.value.length = 0
    drugPlanList.value.length = 0
    const family = quote.value.qtype // Quote qtype is a plancode family (MED, VIS, DEN)
    const rlob = quote.value.rlob
    const eff = B.format.dateMDYYYY(quote.value.effdat)
    const fetcher = new BQAPIFetcher()
    await fetcher.callAPI(`/plancodes/${pid}/${family}/${rlob}?eff=${eff}&macomp=N&gfther=N`, 'GET')
    // console.dir(fetcher.resp)
    if (fetcher.issue) {
      useToast().addToast(`Error getting plan codes: ${fetcher.issue.error}`, "error")
    } else {
      if (fetcher.resp != null) { // No RLOBs with plans
        planList.value = fetcher.resp || []
        // console.dir(planList.value)
        if (planList.value.length == 1) {
          if (quote.value.qtype == 'MED') quote.value.med_plan = planList.value[0].plncod
          if (quote.value.qtype == 'DEN') quote.value.den_plan = planList.value[0].plncod
          if (quote.value.qtype == 'VIS') quote.value.vis_plan = planList.value[0].plncod
        }
      }
    }
    if (family == 'MED') {
      // When getting plans for Medical;, get Drug plans too
      await fetcher.callAPI(`/plancodes/${pid}/DRU/DRU?eff=${eff}&macomp=N&gfther=N`, 'GET')
      // console.dir(fetcher.resp)
      if (fetcher.issue) {
        useToast().addToast(`Error getting plan codes: ${fetcher.issue.error}`, "error")
      } else {
        if (fetcher.resp != null) { // No RLOBs with plans
          drugPlanList.value = fetcher.resp || []
          // console.dir(planList.value)
          if (drugPlanList.value.length == 1) {
            quote.value.dru_plan = drugPlanList.value[0].plncod
          }
        }
      }
    }
    B.working.clear(working)
  }


  return {
    quote, working,
    rlobList, getRLOBList,
    planList, drugPlanList, getPlanList,
    initializeNewQuoteOptions, initializeFromQuote,
    initial_effdate_offset: INITIAL_EFFDATE_OFFSET, number_of_effdates: NUMBER_OF_EFFDATES,
    createQuote, deleteQuote, updateQuote
  }
})
