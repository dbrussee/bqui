/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { B } from '@/composables/BUtils'
import { appProspectStore } from './ProspectStore'
import { useToast } from '@/composables/useToast'
import { appUserStore } from './AppUserStore'
import BQAPIFetcher from '@/components/BQAPI'
import type { Iquote } from '@/types/quote'
import { ref } from 'vue'
import type { Iprospect } from '@/types'

export const QuoteStore = defineStore('QuoteStore', () => {
  const NUMBER_OF_EFFDATES = 10
  const INITIAL_EFFDATE_OFFSET = -2
  const working = ref<any>(null)
  const quote = ref<Iquote>({
    id: -1, status: 'NEW',
    descr: '', proposals: [],
    prospect_id: -1, prospect_name: '',
    size_cd: '', qtype: '', effdat: B.format.dateMMDDYYYY(B.firstOfMonth(1)),
    mass_compliant: false, grandfathered: false,
    nonstd: 'N', rlob: '', funding: 'FI',
    med_plan: '', dru_plan: '', vis_plan: '', den_plan: '',
    crtusr: '', crttms: new Date(), updusr: '', updtms: new Date()
  })

  const createQuote = async ():Promise<any> => {
    B.working.set(working, "Creating Quote...")
    const clone = JSON.parse(JSON.stringify(quote.value))
    clone.effdat = B.format.dateMMDDYYYY(new Date(clone.effdat))
    const fetcher = await new BQAPIFetcher().callAPI(`/quote`, 'POST', clone)
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
        appUserStore().getDashboard()
      }
      quote.value = {...q}
      return q
    } else {
      return null
    }
  }

  const makeBlankQuote = (qtype:string, prospect:Iprospect | null, fromQuote:Iquote | null) => {
    const q:Iquote = {
      id: -1,
      status: 'NEW',
      qtype: qtype,
      descr: '', proposals: [],
      size_cd: prospect?.size_cd || "1",
      prospect_id: prospect?.id || -1, prospect_name: prospect?.name || '',
      effdat: fromQuote ? fromQuote.effdat : B.format.dateMMDDYYYY(B.firstOfMonth(1)),
      grandfathered: false, mass_compliant: false,
      nonstd: 'N', funding: 'FI', rlob: '',
      med_plan: 'M_NOPLN', dru_plan: 'R_NOPLN', vis_plan: 'V_NOPLN', den_plan: 'D_NOPLN',
      crtusr: '', crttms: new Date(), updusr: '', updtms: new Date()
    }
    console.dir(q)
    getRLOBList(q)
    return q
  }

  // const blankQuote = (qtype:string, pid:number, pname:string):void => {
  //   quote.value = {
  //     id: -1,
  //     descr: '',
  //     prospect_id: pid,
  //     prospect_name: pname,
  //     status: 'NEW',
  //     size_cd: '',
  //     qtype: qtype,
  //     effdat: B.firstOfMonth(1),
  //     grandfathered: false,
  //     mass_compliant: false,
  //     nonstd: 'N',
  //     rlob: '',
  //     funding: 'FI',
  //     med_plan: 'M_NOPLN', dru_plan: 'R_NOPLN', vis_plan: 'V_NOPLN', den_plan: 'D_NOPLN',
  //     crtusr: '', crttms: new Date(), updusr: '', updtms: new Date()
  //   }
  // }
  const deleteQuote = async (quote:Iquote) => {
    B.working.set(working, "Deleting Quote...")
    const fetcher = await new BQAPIFetcher().callAPI(`/quote/${quote.id}`, 'DELETE')
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
      useToast().addToast(`Quote ${quote.id} deleted`, "success")
      appUserStore().getDashboard()
      appProspectStore().quotes = appProspectStore().quotes.filter((q) => {
        return q.id != quote.id
      })

      // blankQuote(quote.value.qtype, prospStore.prospect.id, prospStore.prospect.name)
    }
  }
  const updateQuote = async (q:Iquote):Promise<unknown> => {
    B.working.set(working, "Updating Quote...")
    const fetcher = await new BQAPIFetcher().callAPI(`/quote`, 'PUT', q)
    B.working.clear(working)
    if (fetcher.resp != null) {
      if (fetcher.issue) {
        useToast().addToast(`Error: ${fetcher.issue.error}`, "error")
        return null
      } else {
        appUserStore().getDashboard()
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

  const getPlansForQuote = async (quote:Iquote) => {
    const fetcher = new BQAPIFetcher()
    let rslt = {}
    if (quote.id < 0) {ealr:
      rslt = await fetcher.callAPI(`/newquoteplans/${quote.prospect_id}`, "GET")
    } else {
      rslt = await fetcher.callAPI(`/quoteplans/${quote.id}`, 'GET')
    }
    return rslt;
  }


  // const initializeNewQuoteOptions = (qtype:string = 'MED', pickedQuote:any = null) => {
  //   const prospStore = appProspectStore()
  //   if (!prospStore.prospect) return
  //   blankQuote(qtype, prospStore.prospect.id, prospStore.prospect.name)
  //   const q = quote.value
  //   q.size_cd = prospStore.prospect.size_cd
  //   if (pickedQuote != null) q.effdat = B.dateFromYYYYMMDD(pickedQuote.effdat)
  //   // opts.grandfathered = false

  //   getRLOBList(q)
  // }
  const initializeFromQuote = (q:Iquote) => {
    const prospStore = appProspectStore()
    if (!prospStore.prospect) return
    const opts = quote.value
    opts.descr = q.descr as string
    if (!opts.descr.endsWith("- Copy")) opts.descr += ' - Copy'
    opts.prospect_id = prospStore.prospect.id
    opts.prospect_name = prospStore.prospect.name
    opts.size_cd = prospStore.prospect.size_cd
    opts.qtype = q.qtype
    opts.effdat = q.effdat
    // opts.grandfathered = false
    getRLOBList(q)
    opts.rlob = q.rlob
    opts.funding = q.funding
    // opts.mass_compliant = false
    opts.med_plan = q.med_plan
    opts.dru_plan = q.dru_plan
    opts.vis_plan = q.vis_plan
    opts.den_plan = q.den_plan

    const test = new Date(opts.effdat)
    if (!verifyEffdatInRange(test)) {
      // Try adding a year for renewal quotes
      test.setMonth(test.getMonth() + 12)
      if (verifyEffdatInRange(test)) {
        opts.effdat = B.format.dateMMDDYYYY(test)
      }
    }
  }

  const verifyEffdatInRange = (effdat:Date | null):boolean => {
    if (!effdat) return true// Empty is ok... but not valid
    // const effdat:Date = new Date(test)
    for (let i = 0; i <= NUMBER_OF_EFFDATES; i++) {
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

  const getRLOBList = async (quote:Iquote) => {
    B.working.set(working, "Getting avaiable product lines...")
    const preRLOB = quote.rlob || 'BEEF'
    rlobList.MED.value.length = 0
    rlobList.DRU.value.length = 0
    rlobList.VIS.value.length = 0
    rlobList.DEN.value.length = 0
    const eff = B.format.dateMMDDYYYY(quote.effdat)
    const fetcher = new BQAPIFetcher()
    await fetcher.callAPI(`/plancodecounts/${quote.prospect_id}?eff=${eff}`, 'GET')
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

        const list = rlobList[quote.qtype].value
        if (list) {
          if (list.length == 1) {
            quote.rlob = list[0]
          } else if (list.includes(preRLOB)) {
            quote.rlob = preRLOB
          } else {
            quote.rlob = ''
          }
        } else {
          quote.rlob = ''
        }
        // if (!verifyEffdatInRange(quote.effdat)) {
        //   quote.effdat = null
        // }
      }
    }
  }

  const planList = ref<any[]>([])
  const drugPlanList = ref<any[]>([])
  const getPlanList = async (quote: Iquote) => {
    B.working.set(working, "Getting avaiable plan codes...")
    planList.value.length = 0
    drugPlanList.value.length = 0
    const eff = B.format.dateMMDDYYYY(quote.effdat)
    const fetcher = new BQAPIFetcher()
    await fetcher.callAPI(`/plancodes/${quote.prospect_id}/${quote.qtype}?eff=${eff}&rlob=${quote.rlob}&macomp=N&gfther=N`, 'GET')
    // console.dir(fetcher.resp)
    if (fetcher.issue) {
      useToast().addToast(`Error getting plan codes: ${fetcher.issue.error}`, "error")
    } else {
      if (fetcher.resp != null) { // No RLOBs with plans
        planList.value = fetcher.resp || []
        // console.dir(planList.value)
        if (planList.value.length == 1) {
          if (quote.qtype == 'MED') quote.med_plan = planList.value[0].plncod
          if (quote.qtype == 'DEN') quote.den_plan = planList.value[0].plncod
          if (quote.qtype == 'VIS') quote.vis_plan = planList.value[0].plncod
        }
      }
    }
    if (quote.qtype == 'MED') {
      // When getting plans for Medical;, get Drug plans too
      await fetcher.callAPI(`/plancodes/${quote.prospect_id}/DRU?eff=${eff}&macomp=N&gfther=N`, 'GET')
      // console.dir(fetcher.resp)
      if (fetcher.issue) {
        useToast().addToast(`Error getting plan codes: ${fetcher.issue.error}`, "error")
      } else {
        if (fetcher.resp != null) { // No RLOBs with plans
          drugPlanList.value = fetcher.resp || []
          // console.dir(planList.value)
          if (drugPlanList.value.length == 1) {
            quote.dru_plan = drugPlanList.value[0].plncod
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
    initializeFromQuote, makeBlankQuote, //initializeNewQuoteOptions,
    initial_effdate_offset: INITIAL_EFFDATE_OFFSET, number_of_effdates: NUMBER_OF_EFFDATES,
    createQuote, deleteQuote, updateQuote, getPlansForQuote
  }
})
