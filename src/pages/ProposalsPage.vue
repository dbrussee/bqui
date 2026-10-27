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

// const refresh = () => {
//   cfgQuotesList.value.pickedRow = null
//   currentProposal.value = null;
//   uStore.getProposals()
// }

const cfgQuotesList = ref({
  onPick: (row:any) => {
    cfgQuotesList.value.pickedRow = row
  },
  // onDblpick: () => { qHandler.edit(cfgQuotesList.value.pickedRow) },
  height: "calc(100vh - 13em)",
  width: "calc(100vw - 450px - .9em)",
  pickedRow: null as any,
  // pickedRowNumber: -1,
  no_rows_text: "There are no quotes to display<br/>Add quotes to an existing proposal<br/>Pick a different proposal from the list<br/>Or create a new proposal",
  columns: [
    { id: "id", heading: "Quote", width: "4em", flags: "R" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "descr", heading: "Name" },
  ]
})

const cfgAddQuoteList = ref({
  onPick: (row:any) => {
    proposalHandler.addQuote(row.id)
  },
  height: "10em",
  width: "600px",
  // pickedRowNumber: -1,
  columns: [
    { id: "id", heading: "Quote", width: "4em", flags: "R" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "descr", heading: "Name" },
  ]
})


const monthsRange = computed(() => {
  const dates = <any[]>[];
  if (!uStore) return dates
  const today = new Date();

  // 1. Start on the 1st of the month, 3 months prior
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);

  // 2. End 12 months past today (adjusting to cover that full month)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 18, 1);

  // 3. Loop and push each month into the array
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateAsString = B.format.dateMMDDYYYY(currentDate)
    dates.push(B.format.dateMMDDYYYY(currentDate))
    const test = ppStore.proposaldata[dateAsString]
    if (test) {
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
  })
  return B.codeToText.quoteStatus(row.status)
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
  create() {
    if (this.model.value.effdat == '') return false
    if (this.model.value.descr == '') return false
    ppStore.createProposal(this.model.value)
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
      const added = ppStore.currentProposal.quotes.find((pq:any) => {
        return q.id == pq.id
      })
      // console.log("Compare quote", qeff, "with", peff, " status:", q.status)
      return qeff == peff
        && q.status == 'READY'
        && !added
    })
    // console.dir(this.availableQuotes)
    B.popup.showModal(this.quote_select_id)
  },
  addQuote(qid:string) {
    if (!qid || qid == '') return
    B.popup.close(this.quote_select_id)
    ppStore.addQuote(ppStore.currentProposal.id, qid)
    // this.pickQuote()
  },
  removeQuote() {
    const qid = cfgQuotesList.value.pickedRow.id
    ppStore.removeQuote(ppStore.currentProposal.id, qid)
    cfgQuotesList.value.pickedRow = null
  }
}

</script>

<template>

  <div class="drop_menu">
    <!-- <BButton class="anchor" icon="solid rotate-left_" @click="refresh()">Refresh List</BButton>&nbsp;&nbsp; -->
    <BButton class="action" icon="square-plus_" @click="B.popup.showModal(proposalHandler.id)">New Proposal&hellip;</BButton>
    <span style="float: right;" v-if="ppStore.currentProposal">
      <BConfirm class="anchor" pos="B2L" icon="#red trash-can_" @confirm="proposalHandler.delete">Delete Proposal
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
      <p :class="pp.id == ppStore.currentProposal?.id ? 'proposal-item picked' : 'proposal-item'" @click="ppStore.currentProposal = ppStore.proposaldata[m][index]"
        v-for="(pp, index) of ppStore.proposaldata[m]" :key="index">
        <BIcon :icon="B.statusIcon(ppStore.currentProposal?.status)" />{{ ppStore.proposaldata[m][index].descr || '< No Name >' }}</p>
    </template>
  </div>
  <div v-else class="proposal_list">
    You have no proposals.
  </div>
  <div class="proposal">
    <table class="form-table" style="margin-bottom: .3em; width: 100%;">
      <tbody>
        <tr><th style="width:8em;">Effective:</th>
            <td>{{ B.format.effdat(ppStore.currentProposal?.effdat) }}
                <span style="float: right">Proposal Status: <BIcon :icon="B.statusIcon(ppStore.currentProposal?.status)">{{ B.codeToText.quoteStatus(ppStore.currentProposal?.status) }}</BIcon></span>
            </td></tr>
        <tr><th>Proposal Name:</th>
            <td>{{ ppStore.currentProposal?.descr }}
              <BPrompt v-if="ppStore.currentProposal" @change="proposalHandler.rename" :text="ppStore.currentProposal?.descr" prompt="Proposal Name"/>
            </td>
        </tr>
      </tbody>
    </table>
    <BTable :config="cfgQuotesList" :rows="ppStore.currentProposal?.quotes || []">
      <template #column_product="{row}">{{ row.qtype }} {{ row.rlob }}</template>
      <template #column_status="{row, setStyle}"><BIcon :icon="B.statusIcon(row.status)">{{ formatStatusCell(row, setStyle) }}</BIcon></template>
      <template #column_nonstd="{row}">
        <span :class="{
          'nonstdY': row.nonstd == 'Y',
          'nonstdC': row.nonstd == 'C'}"
        >{{ B.codeToText.nonstd(row.nonstd) }}</span>
      </template>
      <template #footer>
        <BButton @click="proposalHandler.pickQuote()" class="modern" :disabled="!ppStore.currentProposal" gapright>Add Quote...</BButton>
        <BConfirm pos="T" @confirm="proposalHandler.removeQuote" :disabled="!cfgQuotesList.pickedRow" class="anchor" icon="#red trash-can_" gapleft>Remove Quote?</BConfirm>
      </template>
    </BTable>
  </div>
  <dialog :id="proposalHandler.id">
    <div class="titlebar">New Proposal</div>
    <table class="form-table">
      <tbody>
        <tr><th>Effective:</th><td><input v-model="proposalHandler.model.value.effdat"></td></tr>
        <tr><th>Name:</th><td><input style="width: 30em;" v-model="proposalHandler.model.value.descr"></td></tr>
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
    <div style="margin-bottom: .5em;" class="info">
      Only quotes effective {{ B.format.effdat(ppStore.currentProposal?.effdat) }}, are in Ready status and are not already<br/>
      included are listed. These are the only quotes that can be added.
    </div>
    <BTable :config="cfgAddQuoteList" :rows="proposalHandler.availableQuotes.value || []">
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
</style>
