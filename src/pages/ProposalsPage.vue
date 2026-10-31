<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import { appUserStore } from '@/stores/AppUserStore';
const uStore = appUserStore()
import { appProspectStore } from '@/stores/ProspectStore';
const pStore = appProspectStore()
import { proposalStore } from '@/stores/ProposalStore';
const ppStore = proposalStore()
import { computed, ref, useId } from 'vue';
import BTable from '@/components/B/BTable.vue';
import BIcon from '@/components/B/BIcon.vue';
import BPrompt from '@/components/B/BPrompt.vue';
import type { Iquote } from '@/types';

const cfgAddQuoteList = ref({
  onPick: (row:any) => {
    proposalHandler.toggleQuote(row)
  },
  height: "10em",
  width: "800px",
  // pickedRowNumber: -1,
  columns: [
    { id: "id", heading: "Quote", width: "4em", flags: "R" },
    { id: "custom", heading: "", width: ".1em" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "status", heading: "Status", width: "10em" },
    { id: "descr", heading: "Name" },
  ]
})

const quotesSummary = computed(() => {
  const rslt = {
    counts: {
      total: 0,
      ready: 0,
      not_ready: 0
    },
    total: "No Selected Proposal",
    ready: "",
    icon:""
  }
  if (!ppStore.currentProposal) return rslt
  const total = ppStore.currentProposal.quotes.length
  if (total == 0) {
    rslt.total = "No Quotes"
    return rslt
  }
  const totalText = B.format.valueWithUnits(total, "quote")
  const notReadyCount = ppStore.currentProposal.quotes.filter((q:Iquote) => {
    return q.status != 'READY'
  }).length
  let readyText = ""
  if (notReadyCount == 0) {
    switch(total) {
      case 1: readyText = "Ready"; break;
      case 2: readyText = "Both Ready"; break;
      default: readyText = "All Ready"; break;
    }
  } else {
    if (notReadyCount == total) {
      switch(total) {
        case 1: readyText = "Not Ready"; break;
        case 2: readyText = "Neither Ready"; break;
        default: readyText = "None Ready"; break;
      }
    } else {
      readyText = notReadyCount + " Not Ready"
    }
  }
  rslt.counts.total = total
  rslt.counts.not_ready = notReadyCount
  rslt.counts.ready = total - notReadyCount
  rslt.total = totalText
  rslt.ready = readyText
  if (notReadyCount == 0) {
    rslt.icon = B.statusIcon("READY")
  } else {
    rslt.icon = B.statusIcon("RATEREQ")
  }
  return rslt
})

const monthsRange = computed(() => {
  const dates = <any[]>[];
  if (!uStore) return dates
  const today = new Date();

  // 1. Start on the 1st of the month, 3 months prior
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);

  // 2. End 12 months past today (adjusting to cover that full month)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 12, 1);

  // 3. Loop and push each month into the array
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateAsString = B.format.dateMMDDYYYY(currentDate)
    dates.push(B.format.dateMMDDYYYY(currentDate))
    let foundEff = null
    if (ppStore.proposaldata) {
      foundEff = ppStore.proposaldata[dateAsString]
    }
    if (foundEff) {
      ppStore.proposaldata[dateAsString].forEach((pp:any) => {
        pp.effdat = B.dateFromYYYYMMDD(pp.effdat)
      })
    }
    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return dates;
})
const formatStatusCell = (row:any, setStyle:any) => {
  setStyle((td:HTMLTableCellElement) => {
    const classname = "status" + row.status
    td.classList.add(classname)
    // const tr = td.closest("tr") as HTMLTableRowElement
    // if (tr) tr.style.textDecoration = (row.custom == 'Y' ? "line-through" : "none")
  })
  return B.codeToText.quoteStatus(row.status)
}

const isInProposalIcon = (row:Iquote) => {
  if (row.custom == "Y") {
    return "#green solid square-check"
  } else {
    return "square"
  }
}

const proposalHandler = {
  id: useId(),
  quote_select_id: useId(),
  previewId: useId(),
  model: ref<any>({ effdat:"", descr:"", prospect_id:pStore.prospect?.id }),
  availableQuotes: ref<any[]>([]),
  rename(newname:string) {
    ppStore.renameProposal(ppStore.currentProposal.id, newname)
  },
  async create() {
    if (this.model.value.effdat == '') return
    if (this.model.value.descr == '') {
      let descr = B.format.effdat(this.model.value.effdat)
      descr += ' Proposal'
      if (ppStore.proposaldata) {
        const effnode = ppStore.proposaldata[this.model.value.effdat]
        if (effnode) descr += ' #' + (effnode.length + 1)
      }
      this.model.value.descr = descr
    }
    ppStore.currentProposal = await ppStore.createProposal(this.model.value)
    this.pickQuote()

    this.model.value.effdat = ''
    this.model.value.descr = ''
    B.popup.close(this.id)
  },
  delete() {
    ppStore.deleteProposal(ppStore.currentProposal.id)
  },
  pickQuote() {
    this.availableQuotes.value = pStore.quotes.filter((q:Iquote) => {
      const qeff = B.format.effdat(B.dateFromYYYYMMDD(q.effdat))
      const peff = B.format.effdat(ppStore.currentProposal.effdat)
      const alreadyInList = ppStore.currentProposal.quotes.find((pq:any) => {
        return q.id == pq.id
      })
      q.custom = alreadyInList ? "Y" : "N"
      // console.log("Compare quote", qeff, "with", peff, " status:", q.status)
      return qeff == peff
        && 'INPROG,EXPIRED,ENROLLED'.indexOf(q.status) < 0
        // && !alreadyInList
    })
    // console.dir(this.availableQuotes)
    B.popup.showModal(this.quote_select_id)
  },
  async toggleQuote(quote_row:any) {
    if (!quote_row.id || quote_row.id == '') return
    if (quote_row.custom == 'Y') { // It's on the list
      quote_row.custom = "N"
      await ppStore.removeQuote(ppStore.currentProposal.id, quote_row.id)
      // if (cfgQuotesList.value.pickedRow) {
      //   if (cfgQuotesList.value.pickedRow.id == quote_row.id) {
      //     cfgQuotesList.value.pickedRow = null
      //   }
      // }
    } else {
      quote_row.custom = "Y"
      await ppStore.addQuote(ppStore.currentProposal.id, quote_row.id)
    }
    // this.pickQuote()
  },
}

const setCurrent = (effmonth:string, index:number) => {
  ppStore.currentProposal = ppStore.proposaldata[effmonth][index]
}
</script>

<template>

  <div class="drop_menu">
    <!-- <BButton class="anchor" icon="solid rotate-left_" @click="refresh()">Refresh List</BButton>&nbsp;&nbsp; -->
    <BButton class="action" icon="square-plus_" @click="B.popup.showModal(proposalHandler.id)">New Proposal&hellip;</BButton>
    <span style="float: right;" v-if="ppStore.currentProposal">
      <BConfirm class="anchor" pos="B2L" icon="#red trash-can_" @confirm="proposalHandler.delete">Delete Proposal?
        <template #message>
          Delete this proposal?
          <p style='color:red'>This cannot be undone</p>
        </template>
      </BConfirm>&nbsp;
    </span>
  </div>
  <div v-if="uStore && ppStore.proposaldata" class="proposal_list">
    <div v-if="Object.keys(ppStore.proposaldata).length == 0" style="width: 100%; text-align: center; color: silver">No Proposals</div>
    <template v-for="m of monthsRange" :key="m">
      <div class="info" v-if="ppStore?.proposaldata[m]" >- {{ B.format.effdat(m) }}</div>
      <div v-for="(pp, index) of ppStore.proposaldata[m]" :key="index"
        :class="pp.id == ppStore.currentProposal?.id ? 'proposal-item picked' : 'proposal-item'"
        @click="setCurrent(m, index as number)">
        <BIcon :icon="B.statusIcon(ppStore.proposaldata[m][index].status)"/>
        {{ ppStore.proposaldata[m][index].descr }}<br/>
        <span :style="{'font-size': '.8em', 'color': ppStore.proposaldata[m][index].quotes.length == 0 ? 'red' : ''}">&hellip;{{ B.format.valueWithUnits(ppStore.proposaldata[m][index].quotes.length, "quote") }}</span>
      </div>
    </template>
  </div>
  <div v-else class="proposal_list">
    You have no proposals.
  </div>
  <div class="proposal">
    <table class="form-table" style="margin-bottom: .3em; width: 100%;">
      <tbody>
        <tr><th style="width:8em;">Effective:</th>
            <td colspan="2">{{ ppStore.currentProposal?.effdat }}
                <span v-if="ppStore.currentProposal" style="float: right">Proposal Status: <BIcon :icon="B.statusIcon(ppStore.currentProposal?.status)">{{ B.codeToText.quoteStatus(ppStore.currentProposal?.status) }}</BIcon></span>
            </td></tr>
        <tr><th>Proposal Name:</th>
            <td colspan="2">{{ ppStore.currentProposal?.descr }}
              <BPrompt v-if="ppStore.currentProposal" @change="proposalHandler.rename" :text="ppStore.currentProposal?.descr" prompt="Proposal Name"/>
            </td>
        </tr>
        <tr><th>Quotes:</th><td colspan="2">{{ quotesSummary.total }}
            {{ quotesSummary.ready == '' ? '' : ' - ' }}
            <BIcon v-if="quotesSummary.icon != ''" :icon="quotesSummary.icon"/>{{ quotesSummary.ready }}
          <span v-if="ppStore.currentProposal" class="anchor" @click="proposalHandler.pickQuote()">
            &nbsp; <BIcon icon="solid pencil_"></BIcon>Add / Remove Quotes
          </span>
        </td></tr>
        <template v-if="ppStore.currentProposal">
        <tr><td class="breakline" colspan="3"><hr/></td></tr>
        <tr><th>Include:</th><td colspan="2"><label><input type="checkbox"> Cover Page</label></td></tr>
        <tr><th></th><td colspan="2"><label><input type="checkbox"> Group Application</label></td></tr>
        <tr><th></th><td style="width: 11em;"><label><input type="checkbox"> Benefit Details</label></td>
                    <td><label><input type="checkbox"> Benefit Comparisons</label></td></tr>
        <tr><th></th><td><label><input type="checkbox"> Rate Sheets</label></td>
                    <td><label><input type="checkbox"> Rate Sheet Comparisons</label></td></tr>
        <tr><th></th><td colspan="2"><label><input type="checkbox"> Legal Agreement Form</label></td></tr>
        <tr><th></th><td colspan="2"><label><input type="checkbox"> Tax Preparation Documents</label></td></tr>
        </template>
      </tbody>
    </table>
    <div class="buttonbar" v-if="ppStore.currentProposal">
      <BConfirm :disabled="quotesSummary.counts.total == 0" icon="file-pdf_" class="modern" gapright>Generate PDF</BConfirm>
      <BConfirm :disabled="quotesSummary.counts.total == 0 || (quotesSummary.counts.total != quotesSummary.counts.ready)" icon="thumbs-up_" class="action">Start Enrollment</BConfirm>
    </div>
  </div>
  <dialog :id="proposalHandler.id">
    <div class="titlebar">New Proposal</div>
    <table class="form-table">
      <tbody>
        <tr><th>Effective:</th>
            <td>
              <select v-model="proposalHandler.model.value.effdat">
                <option value="">Select</option>
                <option v-for="m of monthsRange" :key="m" :value="m">{{ B.format.effdat(m) }}</option>
              </select>
            </td>
        </tr>
        <tr><th>Name:</th><td><input :placeholder="(B.format.effdat(proposalHandler.model.value.effdat) as string) + ' Proposal'" style="width: 30em;" v-model="proposalHandler.model.value.descr"></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <BButton class="anchor" @click="B.popup.close(proposalHandler.id)" icon="#red solid x">Cancel</BButton>&nbsp;
            <BButton class="modern" @click="proposalHandler.create()" icon="solid share_">Create</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
  </dialog>
  <dialog :id="proposalHandler.quote_select_id">
    <div class="titlebar">Add Quote to Proposal</div>
    <div style="margin-bottom: .5em; text-align: center;" class="info">
      Only quotes effective {{ B.format.effdat(ppStore.currentProposal?.effdat) }}
      and are not In Progress or Expired are available.
    </div>
    <BTable :config="cfgAddQuoteList" :rows="proposalHandler.availableQuotes.value || []">
      <template #column_custom="{row}"><BIcon :icon="isInProposalIcon(row)"></BIcon></template>
      <template #column_product="{row}">{{ row.qtype }} {{ row.rlob }}</template>
      <template #column_status="{row, setStyle}"><BIcon :icon="B.statusIcon(row.status)">{{ formatStatusCell(row, setStyle) }}</BIcon></template>
      <template #column_nonstd="{row}">
        <span :class="{
          'nonstdY': row.nonstd == 'Y',
          'nonstdC': row.nonstd == 'C'}"
        >{{ B.codeToText.nonstd(row.nonstd) }}</span>
      </template>
    </BTable>
    <div class="buttonbar">
      <BButton class="anchor" @click="B.popup.close(proposalHandler.quote_select_id)" icon="#red solid x">Close</BButton>&nbsp;
    </div>
  </dialog>


</template>

<style lang="css" scoped>
div.proposal_list {
  display: inline-block;
  /* margin-top: .3em; */
  width: 15em;
  height: calc(100vh - 9em);
  overflow-y: auto;
  border-right: 3px solid gainsboro;
  padding-right: 3px;
}
div.proposal {
  display: inline-block;
  padding-left: .3em;
  /* margin-top: .3em; */
  width: calc(100% - 15.5em);
  height: calc(100vh - 9em);
  overflow-y: auto;
}
.nonstdC {
  color: goldenrod;
  font-style: italic;
  font-weight: bold;
}
.nonstdY {
  color: goldenrod;
  font-style: italic;
}
.picked {
  color: var(--table-row-picked-text);
  background-color: var(--table-row-picked-bg);
}
.proposal-item {
  cursor: pointer;
  padding: .2em;
  border-bottom: var(--table-row-border-color);
  margin-bottom: .2em;
  &:hover {
    color: var(--table-row-picked-text);
    background-color: var(--table-row-picked-bg);
  }
}

.breakline {
  padding-top: .4em;
  padding-bottom: .4em;
}
</style>
