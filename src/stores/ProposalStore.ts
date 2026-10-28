/* eslint-disable @typescript-eslint/no-explicit-any */
import BQAPIFetcher from "@/components/BQAPI";
import { B } from "@/composables/BUtils";
import { useToast } from "@/composables/useToast";
import { defineStore } from "pinia";
import { ref } from "vue";
import { appProspectStore } from "./ProspectStore";
import { appUserStore } from "./AppUserStore";

export const proposalStore = defineStore("proposalStore", () => {
  const proposaldata = ref<any>({})
  const currentProposal = ref<any>(null)
  const meta = ref<any>(null);
  const issue = ref<any>(null)
  const working = ref<any>(null)

  function findProposal(id:number):any {
    for (const key of Object.keys(proposaldata.value)) {
      const array = proposaldata.value[key]
      const match = array.find((proposal:any) => proposal.id == id)
      if (match) return match
    }
    return null
  }
  function getProposals():void {
    const savedProposal = currentProposal.value
    currentProposal.value = null
    proposaldata.value = {}
    const pStore = appProspectStore()
    const uStore = appUserStore()
    if (!pStore.prospect) return
    if (!uStore.user) return
    B.working.set(working, "Loading...")
    const fetcher = new BQAPIFetcher()
    fetcher.callAPI(`/proposals/${pStore.prospect.id}`, "GET").then(() => {
      B.working.clear(working)
      proposaldata.value = fetcher.resp.eff_dates
      if (savedProposal && proposaldata.value) {
        for (const eff of Object.keys(proposaldata.value)) {
          proposaldata.value[eff].forEach((p:any) => {
            if (p.id == savedProposal.id) currentProposal.value = {...p}
          });
        }
      }
      // console.dir(proposaldata.value)
    })
  }
  async function createProposal(formData:any) {
    const fetcher = new BQAPIFetcher()
    await fetcher.callAPI(`/proposal`, 'POST', formData)
    proposaldata.value = fetcher.resp.eff_dates
    const found = findProposal(fetcher.resp.newid)
    useToast().addToast(`Proposal successfully created`)
    return found
  }
  function deleteProposal(id:number):void {
    const fetcher = new BQAPIFetcher()
    fetcher.callAPI(`/proposal/${id}`, 'DELETE').then((r) => {
      console.dir(r)
      proposaldata.value = fetcher.resp.eff_dates
      currentProposal.value = null
      useToast().addToast(`Proposal successfully deleted`)
    })
  }
  function renameProposal(proposal_id:number, newName:string):void {
    const body = {
      proposal_id: proposal_id,
      descr: newName
    }
    const fetcher = new BQAPIFetcher()
    fetcher.callAPI(`/proposal`, 'PUT', body).then(() => {
      proposaldata.value = fetcher.resp.eff_dates
      const found = findProposal(proposal_id)
      currentProposal.value = found
      useToast().addToast("Proposal successfully renamed")
    })
  }

  function addQuote(pid:number, qid:string|number):void {
    if (typeof qid == 'string') qid = parseInt(qid)
    new BQAPIFetcher().callAPI(`/proposal/quote/${pid}/${qid}`, 'PUT').then((fetcher) => {
      if (fetcher.issue) {
        useToast().addToast(fetcher.issue.message, "warning")
      } else {
        proposaldata.value = fetcher.resp.eff_dates
        currentProposal.value = findProposal(pid)
        useToast().addToast(`Quote ${qid} added to proposal`)
      }
    })
  }
  function removeQuote(pid:number, qid:string|number):void {
    if (typeof qid == 'string') qid = parseInt(qid)
    new BQAPIFetcher().callAPI(`/proposal/quote/${pid}/${qid}`, 'DELETE').then((fetcher) => {
      proposaldata.value = fetcher.resp.eff_dates
      currentProposal.value = findProposal(pid)
      useToast().addToast(`Quote ${qid} removed from proposal`)
    })
  }

  return { working,
    getProposals, proposaldata, currentProposal, findProposal,
    renameProposal, createProposal, deleteProposal,
    addQuote, removeQuote,
    meta, issue
  };

})
