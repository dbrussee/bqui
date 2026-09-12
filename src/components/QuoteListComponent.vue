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
  qtype: 'MED',
  startFromQuote: () => {
    quoteStore.quote = {}
    const q = cfgQuotesList.value.pickedRow
    quoteStore.initializeFromQuote(q)
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.showModal()
  },
  start: (qtype:string) => {
    quoteStore.quote = {}
    quoteHandler.value.qtype = qtype
    if (qtype != quoteStore.newQuoteOptions.qtype) quoteStore.initializeNewQuoteOptions(qtype)
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.showModal()
  },
  step2: () => {
    quoteStore.createQuote(quoteStore.newQuoteOptions).then((newquote:any) => {
      quoteStore.quote = newquote
      cfgQuotesList.value.pickedRow = quoteStore.quote
      // console.log(JSON.stringify(quoteStore.newQuoteOptions, null, 2))
      const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
      popup?.close()
      const popup2 = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
      popup2?.showModal()
    })
  },
  delete: () => {
    quoteStore.deleteQuote(quoteStore.quote.id)
    quoteStore.quote = {}
    cfgQuotesList.value.pickedRow = null
    const popup = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
    popup?.close()
  },
  edit: () => {
    quoteStore.quote = {...cfgQuotesList.value.pickedRow} // copy of data
    const popup = document.getElementById(quoteHandler.value.startPopid) as HTMLDialogElement
    popup?.close()
    const popup2 = document.getElementById(quoteHandler.value.editPopid) as HTMLDialogElement
    console.dir(popup2)
    popup2?.showModal()
  },
  save: () => {
    quoteStore.updateQuote(quoteStore.quote).then((updatedQuote:any) => {
      if (updatedQuote) {
        prospStore.quotes[cfgQuotesList.value.pickedRowNumber] = {...updatedQuote}
        cfgQuotesList.value.pickedRow = {...updatedQuote}
      }
    })
    // TODO: Update pickedrow
    // TODO: Update rows collection
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
    { id: "id", heading: "Quote", width: "5em", flags: "R" },
    { id: "effdat", heading: "Effective", width: "5em", flags: "C" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "product", heading: "Product", width: "6em", cellclass: "mono" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C" },
    // { id: "nonstd", heading: "NS", width: "3em", flags: "C" },
    { id: "status", heading: "Status", width: "10em" },
    { id: "descr", heading: "Description", cellclass: "anchor" },
  ]
})

// const productIcon = (qtype:string):string => {
//   if (qtype == 'MED') return '#black solid stethoscope_'
//   if (qtype == 'DEN') return '#black solid tooth_'
//   if (qtype == 'VIS') return '#black solid glasses_'
//   if (qtype == 'WEL') return '#black solid spa_'
//   return '#red solid question'
// }

const handleQuoteRowClicked = (row:any, rn:number, col:any) => {
  cfgQuotesList.value.pickedRow = row
  cfgQuotesList.value.pickedRowNumber = rn
  if (col.id == "descr") {
    quoteHandler.value.edit()
  }
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
      @pick="(row:any, rn:number, col:any) => {
        handleQuoteRowClicked(row, rn, col)
      }"
      :config="cfgQuotesList" :rows="prospStore.quotes">
    <template #column_effdat="{row}">{{ B.format.effdat(row.effdat) }}</template>
    <template #column_product="{row}">{{ row.qtype }} {{ row.rlob }}</template>
    <template #column_status="{row, td}">{{ formatStatusCell(row, td) }}</template>
    <template #column_nonstd="{row}">
      <span :class="{
        'nonstdY': row.nonstd == 'Y',
        'nonstdC': row.nonstd == 'C'}"
      >{{ B.codeToText.nonstd(row.nonstd) }}</span>
    </template>
    <template #buttons>
      <BPopup class="action gapright" icon="solid bars_" pos="T2R" heading="New Quote">New Quote&hellip;
        <template #body>
          <p><BButton @click="quoteHandler.start('MED')" class="anchor" icon="#black solid stethoscope_">Medical &amp; Drug</BButton></p>
          <p><BButton @click="quoteHandler.start('DEN')" class="anchor" icon="#black solid tooth_">Dental</BButton></p>
          <p><BButton @click="quoteHandler.start('VIS')" class="anchor" icon="#black solid glasses_">Vision</BButton></p>
          <p><BButton disabled @click="quoteHandler.start('WEL')" class="anchor" icon="#black solid spa_">Wellness</BButton></p>
          <hr style="margin-top: .2em; margin-bottom: .2em;"/>
          <p><BButton :disabled="!cfgQuotesList.pickedRow" @click="quoteHandler.startFromQuote()" class="anchor" icon="#black clone_">Copy Selected</BButton></p>
        </template>
      </BPopup>
      <!-- <BConfirm class="anchor gapright" @confirm="quoteStore.deleteQuote(cfgQuotesList.pickedRow.id)" :disabled="!cfgQuotesList.pickedRow || cfgQuotesList.pickedRow.status != 'INPROG'" pos="T2R" icon="trash-can_">Delete...</BConfirm> -->
      <BButton class="anchor gapright" :disabled="!cfgQuotesList.pickedRow" icon="_edit" @click="quoteHandler.edit()">Edit...</BButton>
      |
      <BButton class="anchor gapright" :disabled="!cfgQuotesList.pickedRow" icon="_file-pdf">Generate</BButton>
    </template>
  </BTable>
  <dialog :id="quoteHandler.startPopid">
    <NewQuoteDialog @abort="quoteHandler.abort()" @continue="(opts) => quoteHandler.step2()" :qtype="quoteHandler.qtype"></NewQuoteDialog>
  </dialog>
  <dialog v-if="quoteStore.quote.id" :id="quoteHandler.editPopid">
    <EditQuoteDialog @abort="quoteHandler.abort()" @delete="quoteHandler.delete()" @save="() => quoteHandler.save()"></EditQuoteDialog>
  </dialog>
</template>

<style lang="css" scoped>
.nonstdC {
  color: maroon;
  font-style: italic;
}
.nonstdY {
  font-style: italic;
}

</style>
