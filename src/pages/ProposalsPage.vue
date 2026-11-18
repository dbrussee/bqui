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
import { computed, onMounted, ref, useId, watch } from 'vue';
import BTable from '@/components/B/BTable.vue';
import BIcon from '@/components/B/BIcon.vue';
import BPrompt from '@/components/B/BPrompt.vue';
import type { Iquote } from '@/types';
import BCheckbox from '@/components/B/BCheckbox.vue';

watch(() => pStore.prospect, () => {
  proposalHandler.availableQuotes.value = []
  }
)
const cfgAddQuoteList = ref({
  onPick: (row:any) => {
    proposalHandler.toggleQuote(row)
  },
  heading: 'Available Quotes (click rows to toggle selection)',
  height: "calc(100vh - 13.8em)",
  width: "calc(100vw - 200px - 10em - 1.8em)",
  no_rows_text: "No available quotes for this Effective Date",
  help: `Only quotes matching the proposal effective date and are not In Progress or Expired are available.`,
  // pickedRowNumber: -1,
  columns: [
    { id: "id", heading: "Quote", width: "4em", flags: "R" },
    { id: "extra", heading: "", width: ".1em", flags: "C" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "status", heading: "Status", width: "10em" },
    { id: "descr", heading: "Name" },
  ]
})

const quoteOptions = ref({
  cover: false,
  grpapp: true,
  details: false,
  rates: false,
  legal: false,
  tax: false,
  comp_benes: false,
  comp_rates: false
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

  // 2. End 18 months past today (adjusting to cover that full month)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 18, 1);

  // 3. Loop and push each month into the array
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(B.format.dateMMDDYYYY(currentDate))
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return dates;
})
const formatStatusCell = (row:any, setStyle:any) => {
  setStyle((td:HTMLTableCellElement) => {
    const classname = "status" + row.status
    td.classList.add(classname)
  })
  return B.codeToText.quoteStatus(row.status)
}

const isInProposalIcon = (row:Iquote) => {
  if (!ppStore.currentProposal) return ""
  if (row.extra == "Y") {
    if (ppStore.currentProposal.status != 'INPROG') {
      return "#silver solid square-check"
    } else {
      return "#green solid square-check"
    }
  } else {
    if (ppStore.currentProposal.status != 'INPROG') {
      return "#silver solid ban"
    } else {
      return "square"
    }
  }
}

const proposalHandler = {
  id: useId(),
  quote_options_id: useId(),
  previewId: useId(),
  model: ref<any>({ effdat:"", descr:"", prospect_id:pStore.prospect?.id }),
  availableQuotes: ref<any[]>([]),
  rename(newname:string) {
    if (newname == '') return
    ppStore.renameProposal(ppStore.currentProposal.id, newname)
  },
  async create() {
    if (this.model.value.effdat == '') return
    if (this.model.value.descr == '') {
      let descr = 'Quote Proposal'
      if (ppStore.proposaldata) {
        const effnode = ppStore.proposaldata[this.model.value.effdat]
        if (effnode) descr += ' #' + (effnode.length + 1)
      }
      this.model.value.descr = descr
    }
    ppStore.currentProposal = await ppStore.createProposal(this.model.value)
    this.pickProposal()

    this.model.value.effdat = ''
    this.model.value.descr = ''
    B.popup.close(this.id)
  },
  delete() {
    ppStore.deleteProposal(ppStore.currentProposal.id)
  },
  pickProposal() {
    this.availableQuotes.value = []
    this.availableQuotes.value = pStore.quotes.filter((q:Iquote) => {
      const qeff = B.format.effdat(q.effdat)
      const peff = B.format.effdat(ppStore.currentProposal.effdat)
      const alreadyInList = ppStore.currentProposal.quotes.find((pq:any) => {
        return q.id == pq.id
      })
      q.extra = alreadyInList ? "Y" : "N"
      return qeff == peff
        && 'INPROG,EXPIRED,ENROLLED'.indexOf(q.status) < 0
    })
  },
  async toggleQuote(quote_row:any) {
    if (ppStore.currentProposal.status != 'INPROG') return
    if (!quote_row.id || quote_row.id == '') return
    if (quote_row.extra == 'Y') { // It's on the list
      quote_row.extra = "N"
      await ppStore.removeQuote(ppStore.currentProposal.id, quote_row.id)
      // if (cfgQuotesList.value.pickedRow) {
      //   if (cfgQuotesList.value.pickedRow.id == quote_row.id) {
      //     cfgQuotesList.value.pickedRow = null
      //   }
      // }
    } else {
      quote_row.extra = "Y"
      await ppStore.addQuote(ppStore.currentProposal.id, quote_row.id)
    }
  },
  showOptions() {
    B.popup.showModal(this.quote_options_id)
  }
}

const setCurrent = (effmonth:string, index:number) => {
  ppStore.currentProposal = ppStore.proposaldata[effmonth][index]
  proposalHandler.pickProposal()
}
onMounted(() => {
  if (ppStore.currentProposal) proposalHandler.pickProposal()
})
</script>

<template>
  <div class="proposal_list">
    <BButton class="action" style="width: 150px;" icon="square-plus_" @click="B.popup.showModal(proposalHandler.id)">New Proposal&hellip;</BButton>
    <div v-if="uStore && ppStore && ppStore.proposaldata">
      <div v-if="ppStore && ppStore.proposaldata && Object.keys(ppStore.proposaldata).length == 0" style="width: 100%; text-align: center; color: silver">No Proposals</div>
      <template v-for="m of monthsRange" :key="m">
        <div class="effdat-title info" v-if="ppStore && ppStore.proposaldata && ppStore.proposaldata[m]" >- {{ B.format.effdat(m) }} -</div>
        <div v-for="(pp, index) of ppStore.proposaldata[m]" :key="index"
          :class="pp.id == ppStore.currentProposal?.id ? 'proposal-item picked' : 'proposal-item'"
          @click="setCurrent(m, index as number)">
          {{ ppStore.proposaldata[m][index].descr }}<br/>
          <span :style="{'font-size': '.8em', 'color': ppStore.proposaldata[m][index].quotes.length == 0 ? 'red' : ''}">
            <BIcon :icon="B.statusIcon(ppStore.proposaldata[m][index].status)"/>
            {{ B.format.valueWithUnits(ppStore.proposaldata[m][index].quotes.length, "quote") }}</span>
        </div>
      </template>
    </div>
  </div>
  <!-- <div v-else class="proposal_list">
    You have no proposals.
  </div> -->
  <div class="proposal">
    <table class="form-table" style="margin-bottom: .5em; width: calc(100vw - 200px - 12em);">
      <tbody>
        <tr><th style="width: 10em;">Effective:</th>
          <td>{{ B.format.effdat(ppStore.currentProposal?.effdat) }}</td>
          <th style="width: 7em;">Proposal ID:</th>
          <td>{{ ppStore.currentProposal?.id }}</td>
          <td style="width: 15em">
            <span v-if="ppStore.currentProposal" style="float: right">Proposal Status: <BIcon :icon="B.statusIcon(ppStore.currentProposal?.status)">{{ B.codeToText.quoteStatus(ppStore.currentProposal?.status) }}</BIcon></span>
          </td>
          </tr>
        <tr><th>Proposal Name:</th>
          <td colspan="4">{{ ppStore.currentProposal?.descr }}
            <BPrompt required v-if="ppStore.currentProposal" @change="proposalHandler.rename" :text="ppStore.currentProposal?.descr" prompt="Proposal Name"/>
          </td>
        </tr>
        <tr><th>Quote Summary:</th>
          <td colspan="4">{{ quotesSummary.total }}
            {{ quotesSummary.ready == '' ? '' : ' - ' }}
            <BIcon v-if="quotesSummary.icon != ''" :icon="quotesSummary.icon"/>{{ quotesSummary.ready }}
          </td>
        </tr>
      </tbody>
    </table>
    <BTable :config="cfgAddQuoteList" :rows="proposalHandler.availableQuotes.value || []">
      <template #column_extra="{row}"><BIcon :icon="isInProposalIcon(row)"></BIcon></template>
      <template #column_product="{row}">{{ row.qtype }} {{ row.rlob }}</template>
      <template #column_status="{row, setStyle}"><BIcon :icon="B.statusIcon(row.status)">{{ formatStatusCell(row, setStyle) }}</BIcon></template>
      <template #column_nonstd="{row}">
        <span :class="{
          'nonstdY': row.nonstd == 'Y',
          'nonstdC': row.nonstd == 'C'}"
        >{{ B.codeToText.nonstd(row.nonstd) }}</span>
      </template>
      <template #footer>
        <BButton @click="proposalHandler.showOptions()" :disabled="quotesSummary.counts.total == 0" icon="file-pdf_" class="modern" gapright>Generate PDF...</BButton>
        <BConfirm class="modern" :disabled="quotesSummary.counts.total == 0 || quotesSummary.counts.not_ready > 0" icon="thumbs-up_" pos="T">Enroll Proposal?</BConfirm>
        <BConfirm style="float: right" class="anchor" :disabled="ppStore.currentProposal?.quotes.length != 0" pos="T2L" icon="#red trash-can_" @confirm="proposalHandler.delete">Delete Proposal?
          <template #message>
            Delete this proposal?
            <p style='color:red'>This cannot be undone</p>
          </template>
        </BConfirm>&nbsp;

      </template>
    </BTable>

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
        <tr><th>Name:</th><td><input :placeholder="'Quote Proposal'" style="width: 30em;" v-model="proposalHandler.model.value.descr"></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <BButton class="anchor" @click="B.popup.close(proposalHandler.id)" icon="#red solid x">Cancel</BButton>&nbsp;
            <BButton class="modern" @click="proposalHandler.create()" icon="solid share_">Create</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
  </dialog>
  <dialog :id="proposalHandler.quote_options_id" style="width: 35em">
    <div class="titlebar">Generate Proposal</div>
    <div class="infobar">
      The proposal PDF will consist of the following pages. They will be included
      in the order presented in the list below. You may elect to print any of the options
      but you must select at least one option.
    </div>
    <table class="form-table">
      <tbody>
        <tr><th>Include: </th><td colspan="2"><BCheckbox v-model="quoteOptions.cover">Cover Page</BCheckbox></td></tr>
        <tr><th></th><td colspan="2"><BCheckbox v-model="quoteOptions.grpapp">Group Application</BCheckbox></td></tr>
        <tr><th></th><td style="width: 11em;"><BCheckbox v-model="quoteOptions.details">Details</BCheckbox></td>
                    <td><BCheckbox v-model="quoteOptions.comp_benes">Benefit Comparisons</BCheckbox></td></tr>
        <tr><th></th><td><BCheckbox disabled v-model="quoteOptions.rates">Rate Sheets</BCheckbox></td>
                    <td><BCheckbox v-model="quoteOptions.comp_rates">Rate Sheet Comparisons</BCheckbox></td></tr>
        <tr><th></th><td colspan="2"><BCheckbox v-model="quoteOptions.legal">Legal Agreement Form</BCheckbox></td></tr>
        <tr><th></th><td colspan="2"><BCheckbox v-model="quoteOptions.tax">Tax Preparation Documents</BCheckbox></td></tr>
      </tbody>
    </table>
    <div class="buttonbar" v-if="ppStore.currentProposal">
      <BButton class="anchor" gapright @click="B.popup.closeMe($event)" icon="#red solid x">Cancel</BButton>
      <BConfirm :disabled="quotesSummary.counts.total == 0" icon="file-pdf_" class="modern">Generate PDF?</BConfirm>
    </div>
  </dialog>


</template>

<style lang="css" scoped>
div.proposal_list {
  display: inline-block;
  /* margin-top: .3em; */
  width: 10em;
  height: calc(100vh - 7em);
  overflow-y: auto;
  /* border-right: 3px solid gainsboro; */
  padding-right: 3px;
}
div.proposal {
  display: inline-block;
  padding-left: .3em;
  /* margin-top: .3em; */
  width: calc(100% - 10.5em);
  height: calc(100vh - 7em);
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
.effdat-title {
  padding: .3em;
  font-size: 1.1em;
  text-align: center;
}

.breakline {
  padding-top: .4em;
  padding-bottom: .4em;
}
</style>
