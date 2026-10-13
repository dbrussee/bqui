<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, useId } from 'vue';
import { appProspectStore } from '@/stores/ProspectStore.ts';
const pStore = appProspectStore()
import { appUserStore } from '@/stores/AppUserStore.ts';
const uStore = appUserStore()
import { QuoteStore } from '@/stores/QuoteStore.ts';
const qStore = QuoteStore()
import BTable from './B/BTable.vue';
import { B } from '@/composables/BUtils.ts';
import BPopup from './B/BPopup.vue';
import BButton from './B/BButton.vue';
import NewQuoteDialog from '@/dialogs/NewQuoteDialog.vue';
import EditQuoteDialog from '@/dialogs/EditQuoteDialog.vue';
import BIcon from './B/BIcon.vue';

// Watch for changes to the prospect.
// Because the value is in a store, we need to use
// a 'getter' function rather than just the value itself
watch(() => pStore.prospect, () => {
    // console.log('Prospect quotes changed (Quotes List)')
    cfgQuotesList.value.pickedRow = null
  }
)

const quoteHandler = {
  action: "",
  startPopid: useId(),
  editPopid: useId(),
  lastQtype: '',
  openStart() { (document.getElementById(this.startPopid) as HTMLDialogElement).showModal(); this.action = "creating"; },
  closeStart() { (document.getElementById(this.startPopid) as HTMLDialogElement).close(); this.action = ""; },
  openEdit() { (document.getElementById(this.editPopid) as HTMLDialogElement).showModal(); this.action = "editing"; },
  closeEdit() { (document.getElementById(this.editPopid) as HTMLDialogElement).close(); this.action = ""; },
  startFromQuote() {
    const q = cfgQuotesList.value.pickedRow
    cfgQuotesList.value.pickedRow = null
    qStore.initializeFromQuote(q)
    this.openStart()
  },
  start(qtype:string) {
    qStore.initializeNewQuoteOptions(qtype, cfgQuotesList.value.pickedRow)
    this.openStart()
  },
  step2() {
    if (!pStore.prospect) return
    // quoteStore.createQuote().then(() => {
    //   cfgQuotesList.value.pickedRow = quoteStore.quote
    //   cfgQuotesList.value.pickedRowNumber = prospStore.quotes.length - 1
    //   this.edit()
    // })
    qStore.getPlanList(pStore.prospect.id)
    this.closeStart()
    this.openEdit()
  },
  delete() {
    qStore.deleteQuote(qStore.quote.id)
    cfgQuotesList.value.pickedRow = null
    this.closeEdit()
  },
  edit() {
    if (!pStore.prospect) return
    qStore.quote = {...cfgQuotesList.value.pickedRow} // copy of data
    qStore.getPlanList(pStore.prospect.id)
    this.closeStart()
    this.openEdit()
  },
  revertToINPROG() {
    const tempDescr = qStore.quote.descr
    qStore.quote = {...cfgQuotesList.value.pickedRow} // copy of data
    qStore.quote.status = 'INPROG'
    qStore.updateQuote(qStore.quote, "set back to In Progress").then((updatedQuote:any) => {
      if (updatedQuote) {
        qStore.quote.descr = tempDescr
        cfgQuotesList.value.pickedRow.status = 'INPROG'
      }
    })
  },
  save() {
    if (qStore.quote.id < 0) {
      qStore.createQuote().then(() => {
        cfgQuotesList.value.pickedRow = qStore.quote
        cfgQuotesList.value.pickedRowNumber = pStore.quotes.length - 1
        this.closeStart()
        this.closeEdit()
      })
    } else {
      qStore.updateQuote(qStore.quote, "updated").then((updatedQuote:any) => {
        if (updatedQuote) {
          pStore.quotes[cfgQuotesList.value.pickedRowNumber] = {...updatedQuote}
          cfgQuotesList.value.pickedRow = null
        }
        this.closeStart()
        this.closeEdit()
      })
    }
  },
  submit() {
    let toastMessage = 'unchanged'
    switch(qStore.quote.nonstd) {
      case 'N':
        qStore.quote.status = 'READY'
        toastMessage = 'submitted'
        break
      case 'Y':
        qStore.quote.status = 'RATEREQ'
        toastMessage = 'rates requested'
        break
      case 'C':
        qStore.quote.status = 'PENDING'
        toastMessage = 'pending approval'
    }
    if (qStore.quote.id < 0) {
      qStore.createQuote().then(() => {
        cfgQuotesList.value.pickedRow = qStore.quote
        cfgQuotesList.value.pickedRowNumber = pStore.quotes.length - 1
        this.closeStart()
        this.closeEdit()
      })
    } else {
      qStore.updateQuote(qStore.quote, toastMessage).then((updatedQuote:any) => {
        if (updatedQuote) {
          pStore.quotes[cfgQuotesList.value.pickedRowNumber] = {...updatedQuote}
          cfgQuotesList.value.pickedRow = null
        }
        this.closeStart()
        this.closeEdit()
      })
    }
  },
  abort() {
    this.closeStart()
    this.closeEdit()
  }
}


const cfgQuotesList = ref({
  onPick: (row:any, rn:number) => {
    cfgQuotesList.value.pickedRow = row
    cfgQuotesList.value.pickedRowNumber = rn
  },
  onDblpick: () => { quoteHandler.edit() },
  height: "calc(100vh - 11.7em)",
  width: "calc(100vw - 200px - .9em)",
  pickedRow: null as any,
  pickedRowNumber: -1,
  no_rows_text: 'No quotes to display',
  columns: [
    { id: "id", heading: "Quote", width: "4em", flags: "R" },
    { id: "effdat", heading: "Effective", width: "5em", flags: "C" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    // { id: "nonstd", heading: "NS", width: "3em", flags: "C" },
    { id: "status", heading: "Status", width: "11em" },
    { id: "descr", heading: "Name" },
  ]
})

const formatStatusCell = (row:any, td:HTMLTableCellElement | null) => {
  if (td == null) return
  const classname = "status" + row.status
  td.classList.add(classname)
  return B.codeToText.quoteStatus(row.status)
}
</script>

<template>
  <BTable :config="cfgQuotesList" :rows="pStore.quotes">
    <!-- <template #column_id="{row, rn, td}">{{ formatIDCell(row, rn, td) }}</template> -->
    <template #column_effdat="{row}">{{ B.format.effdat(row.effdat) }}</template>
    <template #column_product="{row}">{{ row.qtype }} {{ row.rlob }}</template>
    <template #column_status="{row, td}"><BIcon :icon="B.statusIcon(row.status)">{{ formatStatusCell(row, td) }}</BIcon></template>
    <template #column_nonstd="{row}">
      <span :class="{
        'nonstdY': row.nonstd == 'Y',
        'nonstdC': row.nonstd == 'C'}"
      >{{ B.codeToText.nonstd(row.nonstd) }}</span>
    </template>
    <template #footer>
      <BPopup v-if="!uStore.isUserReadOnly()" class="action" icon="solid bars_" pos="T2R" heading="New Quote">New Quote&hellip;
        <template #body>
          <p><BButton @click="quoteHandler.start('MED')" class="anchor" :icon="B.codeToText.qtypeIcon('MED')">Medical &amp; Drug</BButton></p>
          <p><BButton @click="quoteHandler.start('DEN')" class="anchor" :icon="B.codeToText.qtypeIcon('DEN')">Dental</BButton></p>
          <p><BButton @click="quoteHandler.start('VIS')" class="anchor" :icon="B.codeToText.qtypeIcon('VIS')">Vision</BButton></p>
          <p><BButton disabled @click="quoteHandler.start('WEL')" class="anchor" :icon="B.codeToText.qtypeIcon('WEL')">Wellness</BButton></p>
          <hr style="margin-top: .2em; margin-bottom: .2em;"/>
          <p><BButton :disabled="!cfgQuotesList.pickedRow" @click="quoteHandler.startFromQuote()" class="anchor" icon="clone_">Copy Selected</BButton></p>
        </template>
      </BPopup>
      <!-- <BConfirm class="anchor gapright" @confirm="quoteStore.deleteQuote(cfgQuotesList.pickedRow.id)" :disabled="!cfgQuotesList.pickedRow || cfgQuotesList.pickedRow.status != 'INPROG'" pos="T2R" icon="trash-can_">Delete...</BConfirm> -->
      <BButton class="anchor anchor-in-table-footer" gapleft gapright style="color: white" :disabled="!cfgQuotesList.pickedRow" :icon="uStore.isUserReadOnly() ? 'solid magnifying-glass-plus' : 'edit'" @click="quoteHandler.edit()">{{ uStore.isUserReadOnly() ? 'View...' : 'Edit...' }}</BButton>
      <BButton class="anchor anchor-in-table-footer" style="color: white" disabled icon="file-pdf">Generate</BButton>
    </template>
  </BTable>
  <NewQuoteDialog :popupid="quoteHandler.startPopid"
    @abort="quoteHandler.abort()"
    @continue="(opts) => quoteHandler.step2()"
    :qtype="qStore.quote.qtype"></NewQuoteDialog>
  <EditQuoteDialog :popupid="quoteHandler.editPopid"
    @abort="quoteHandler.abort()"
    @delete="quoteHandler.delete()"
    @submit="quoteHandler.submit()"
    @force="quoteHandler.revertToINPROG()"
    @save="() => quoteHandler.save()"></EditQuoteDialog>
</template>

<style lang="css" scoped>
.nonstdC {
  color: goldenrod;
  font-style: italic;
  font-weight: bold;
}
.nonstdY {
  color: goldenrod;
  font-style: italic;
}

</style>
