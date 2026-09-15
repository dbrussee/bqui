<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch, useId } from 'vue';
import { appProspectStore } from '@/stores/ProspectStore.ts';
const prospStore = appProspectStore()
import { QuoteStore } from '@/stores/QuoteStore.ts';
const quoteStore = QuoteStore()
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
watch(() => prospStore.prospect, () => {
    // console.log('Prospect quotes changed (Quotes List)')
    cfgQuotesList.value.pickedRow = null
  }
)

const quoteHandler = ref({
  startPopid: useId(),
  editPopid: useId(),
  lastQtype: '',
  startFromQuote: () => {
    // quoteStore.quote = {}
    const q = cfgQuotesList.value.pickedRow
    quoteStore.initializeFromQuote(q)
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.showModal()
  },
  start: (qtype:string) => {
    // quoteStore.quote = {}
    if (qtype != quoteHandler.value.lastQtype) quoteStore.initializeNewQuoteOptions(qtype)
    quoteHandler.value.lastQtype = qtype
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.showModal()
  },
  step2: () => {
    quoteStore.createQuote().then(() => {
      // quoteStore.quote = newquote
      cfgQuotesList.value.pickedRow = quoteStore.quote
      // console.log(JSON.stringify(quoteStore.quote, null, 2))
      const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
      popup?.close()
      const popup2 = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
      popup2?.showModal()
    })
  },
  delete: () => {
    quoteStore.deleteQuote(quoteStore.quote.id)
    // quoteStore.clearQuote()
    cfgQuotesList.value.pickedRow = null
    const popup = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
    popup?.close()
  },
  edit: () => {
    quoteStore.quote = {...cfgQuotesList.value.pickedRow} // copy of data
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.close()
    const popup2 = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
    popup2?.showModal()
  },
  save: () => {
    quoteStore.updateQuote(quoteStore.quote, "updated").then((updatedQuote:any) => {
      if (updatedQuote) {
        prospStore.quotes[cfgQuotesList.value.pickedRowNumber] = {...updatedQuote}
        cfgQuotesList.value.pickedRow = {...updatedQuote}
      }
    })
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.close()
    const popup2 = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
    popup2?.close()
  },
  submit: () => {
    quoteStore.quote.status = quoteStore.quote.nonstd == 'N' ? 'READY' : 'RATEREQ'
    const toastMessage = quoteStore.quote.status == 'READY' ? 'submitted' : ' rates requested'
    quoteStore.updateQuote(quoteStore.quote, toastMessage).then((updatedQuote:any) => {
      if (updatedQuote) {
        prospStore.quotes[cfgQuotesList.value.pickedRowNumber] = {...updatedQuote}
        cfgQuotesList.value.pickedRow = {...updatedQuote}
      }
    })
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.close()
    const popup2 = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
    popup2?.close()
  },
  abort: () => {
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.close()
    const popup2 = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
    popup2?.close()
  }
})


const cfgQuotesList = ref({
  height: "calc(100vh - 12em)",
  width: "calc(100vw - 200px - 2em)",
  pickedRow: null as any,
  pickedRowNumber: -1,
  no_rows_text: 'No quotes to display',
  columns: [
    { id: "id", heading: "Quote", width: "4em", flags: "R" },
    { id: "effdat", heading: "Effective", width: "5em", flags: "C" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "product", heading: "Product", width: "6em", cellclass: "mono" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    // { id: "nonstd", heading: "NS", width: "3em", flags: "C" },
    { id: "status", heading: "Status", width: "11em" },
    { id: "descr", heading: "Description" },
  ]
})

// const productIcon = (qtype:string):string => {
//   if (qtype == 'MED') return '#black solid stethoscope_'
//   if (qtype == 'DEN') return '#black solid tooth_'
//   if (qtype == 'VIS') return '#black solid glasses_'
//   if (qtype == 'WEL') return '#black solid spa_'
//   return '#red solid question'
// }

const handleQuoteRowClicked = (row:any, rn:number) => {
  cfgQuotesList.value.pickedRow = row
  cfgQuotesList.value.pickedRowNumber = rn
  // if (col.id == "descr") {
  //   quoteHandler.value.edit()
  // }
}

const formatStatusCell = (row:any, td:HTMLTableCellElement | null) => {
  if (td == null) return
  const classname = "status" + row.status
  td.classList.add(classname)
  return B.codeToText.quoteStatus(row.status)
}
</script>

<template>
  <BTable
      @pick="(row:any, rn:number, col:any) => { handleQuoteRowClicked(row, rn) }"
      @dblpick="(row:any, rn:number, col:any) => { quoteHandler.edit() }"
      :config="cfgQuotesList" :rows="prospStore.quotes">
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
    <template #buttons>
      <BPopup class="action gapright" icon="solid bars_" pos="T2R" heading="New Quote">New Quote&hellip;
        <template #body>
          <p><BButton @click="quoteHandler.start('MED')" class="anchor" icon="solid stethoscope_">Medical &amp; Drug</BButton></p>
          <p><BButton @click="quoteHandler.start('DEN')" class="anchor" icon="solid tooth_">Dental</BButton></p>
          <p><BButton @click="quoteHandler.start('VIS')" class="anchor" icon="solid glasses_">Vision</BButton></p>
          <p><BButton disabled @click="quoteHandler.start('WEL')" class="anchor" icon="solid spa_">Wellness</BButton></p>
          <hr style="margin-top: .2em; margin-bottom: .2em;"/>
          <p><BButton :disabled="!cfgQuotesList.pickedRow" @click="quoteHandler.startFromQuote()" class="anchor" icon="clone_">Copy Selected</BButton></p>
        </template>
      </BPopup>
      <!-- <BConfirm class="anchor gapright" @confirm="quoteStore.deleteQuote(cfgQuotesList.pickedRow.id)" :disabled="!cfgQuotesList.pickedRow || cfgQuotesList.pickedRow.status != 'INPROG'" pos="T2R" icon="trash-can_">Delete...</BConfirm> -->
      <BButton class="anchor anchor-in-table-footer gapright" style="color: white" :disabled="!cfgQuotesList.pickedRow" icon="_edit" @click="quoteHandler.edit()">Edit...</BButton>
      <BButton class="anchor anchor-in-table-footer gapright" style="color: white" :disabled="!cfgQuotesList.pickedRow" icon="_file-pdf">Generate</BButton>
    </template>
  </BTable>
  <NewQuoteDialog :id="quoteHandler.startPopid"
    @abort="quoteHandler.abort()"
    @continue="(opts) => quoteHandler.step2()"
    :qtype="quoteHandler.lastQtype"></NewQuoteDialog>
  <EditQuoteDialog :id="quoteHandler.editPopid"
    @abort="quoteHandler.abort()"
    @delete="quoteHandler.delete()"
    @submit="quoteHandler.submit()"
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
