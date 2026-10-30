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
import BIcon from './B/BIcon.vue';
import type { Iquote } from '@/types/quote.ts';
import QuoteDialog from '@/dialogs/QuoteDialog.vue';
import { useToast } from '@/composables/useToast'

// Watch for changes to the prospect.
// Because the value is in a store, we need to use
// a 'getter' function rather than just the value itself
watch(() => pStore.prospect, () => {
    // console.log('Prospect quotes changed (Quotes List)')
    cfgQuotesList.value.pickedRow = null
  }
)


const cfgQuotesList = ref({
  onPick: (row:any) => {
    cfgQuotesList.value.pickedRow = row
    // cfgQuotesList.value.pickedRowNumber = rn
  },
  onDblpick: () => { qHandler.edit(cfgQuotesList.value.pickedRow) },
  height: "calc(100vh - 11.7em)",
  width: "calc(100vw - 200px - .9em)",
  pickedRow: null as any,
  // pickedRowNumber: -1,
  no_rows_text: 'No quotes to display',
  columns: [
    { id: "id", heading: "Quote", width: "4em", flags: "R" },
    { id: "effdat", heading: "Effective", width: "5em", flags: "C" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "status", heading: "Status", width: "11.5em",
      help: "Values in superscript indicate the number of proposals the quote is assigned to. 'In Progress' quotes cannot be added to proposals."},
    // { id: "proposals", heading: "Prop", width: "3em", flags: "R" },
    { id: "descr", heading: "Name" },
  ]
})

const formatStatusCell = (row:any, setStyle:any, setHtml:any) => {
  setStyle((td:HTMLTableCellElement) => {
    const classname = "status" + row.status
    td.classList.add(classname)
  })
  let txt = B.codeToText.quoteStatus(row.status)
  if ("INPROG,ENROLLED".indexOf(row.status) < 0) {
    let cnt = 0
    if (!row.proposals) {
      cnt = 0
    } else {
      cnt = row.proposals.length
    }
    let sup = "<sup>"
    if (cnt == 0) sup = "<sup style='color: firebrick; font-weight: bold'>"
    txt += `${sup}${cnt}</sup>`
  }
  setHtml(txt)
}
const qHandler = {
  quote: ref<Iquote | undefined>(undefined),
  popid: useId(),

  close() {
    B.popup.close(this.popid)
  },
  start(qtype:string) {
    if (!pStore.prospect) return
    this.quote.value = qStore.makeBlankQuote(qtype, pStore.prospect, null)
    B.popup.showModal(this.popid)
  },
  startFromQuote(quote:Iquote) {
    if (!uStore.user) return
    const q = {...quote} // Clone it first
    q.id = -1
    q.status = "INPROG" // Bypass initial screen of New quote
    q.crttms = new Date()
    q.crtusr = uStore.user.id
    q.updtms = quote.crttms
    q.updusr = quote.crtusr
    q.effdat = B.dateFromYYYYMMDD(quote.effdat)
    qStore.getRLOBList(q)
    this.quote.value = {...q}
    B.popup.showModal(this.popid)
  },
  edit(quote:Iquote) {
    this.quote.value = {...quote}
    B.popup.showModal(this.popid)
  },
  save(quote:Iquote) {
    if (quote.id < 0) {
      qStore.quote = {...quote}
      qStore.createQuote().then(() => {
        cfgQuotesList.value.pickedRow = qStore.quote
        // cfgQuotesList.value.pickedRowNumber = pStore.quotes.length - 1
        this.close()
      })
    } else {
      qStore.updateQuote(quote).then((updatedQuote:any) => {
        if (updatedQuote) {
          pStore.refreshQuote(updatedQuote)
          // pStore.quotes[cfgQuotesList.value.pickedRowNumber] = {...updatedQuote}
          cfgQuotesList.value.pickedRow = null
          useToast().addToast(`Quote ${updatedQuote.id} saved`, "success")
        }
        this.close()
      })
    }
  },
  continue(quote:Iquote) { // Change from NEW to INPROG (still not saved)
    if (!uStore.user) return
    this.quote.value = {...quote}
    this.quote.value.status = 'INPROG'
    this.quote.value.crtusr = uStore.user.id
    this.quote.value.updusr = uStore.user.id
  },
  delete() {
    if (!this.quote.value) return
    qStore.deleteQuote(this.quote.value)
    cfgQuotesList.value.pickedRow = null
    this.close()
  },
  submit(quote:Iquote) {
    let toastMessage = 'unchanged'
    switch(quote.nonstd) {
      case 'N':
        quote.status = 'READY'
        toastMessage = 'is ready to enroll'
        break
      case 'Y':
        quote.status = 'RATEREQ'
        toastMessage = 'rates have been requested'
        break
      case 'C':
        quote.status = 'PENDING'
        toastMessage = 'is pending approval'
        break
    }
    if (quote.id < 0) {
      qStore.quote = {...quote}
      qStore.createQuote().then(() => {
        cfgQuotesList.value.pickedRow = qStore.quote
        // cfgQuotesList.value.pickedRowNumber = pStore.quotes.length - 1
        this.close()
      })
    } else {
      qStore.updateQuote(quote).then((updatedQuote:any) => {
        if (updatedQuote) {
          pStore.refreshQuote(updatedQuote)
          // pStore.quotes[cfgQuotesList.value.pickedRowNumber] = {...updatedQuote}
          cfgQuotesList.value.pickedRow = null
          useToast().addToast(`Quote ${updatedQuote.id} ${toastMessage}`, "success")
        }
        this.close()
      })
    }
  },
  force(quote:Iquote) {
    quote.status = 'INPROG'
    qStore.updateQuote(quote).then((updatedQuote:any) => {
      if (updatedQuote) {
        cfgQuotesList.value.pickedRow.status = 'INPROG'
        useToast().addToast(`Quote ${updatedQuote.id} set back to In Progress`, "success")
      }
    })
  }
}
</script>

<template>
  <BTable :config="cfgQuotesList" :rows="pStore.quotes">
    <template #column_effdat="{row}">{{ B.format.effdat(row.effdat) }}</template>
    <!-- <template #column_proposals="{row}">{{ proposalCount(row) }}</template> -->
    <template #column_product="{row}">{{ row.qtype }} {{ row.rlob }}</template>
    <template #column_status="{row, setStyle, setHtml}"><BIcon :icon="B.statusIcon(row.status)">{{ formatStatusCell(row, setStyle, setHtml) }}</BIcon></template>
    <template #column_nonstd="{row}">
      <span :class="{
        'nonstdY': row.nonstd == 'Y',
        'nonstdC': row.nonstd == 'C'}"
      >{{ B.codeToText.nonstd(row.nonstd) }}</span>
    </template>
    <template #footer>
      <BPopup v-if="!uStore.isUserReadOnly()" class="action" icon="solid bars_" pos="T2R" heading="New Quote">New Quote&hellip;
        <template #body>
          <p><BButton @click="qHandler.start('MED')" class="anchor" :icon="B.codeToText.qtypeIcon('MED')">Medical &amp; Drug</BButton></p>
          <p><BButton @click="qHandler.start('DEN')" class="anchor" :icon="B.codeToText.qtypeIcon('DEN')">Dental</BButton></p>
          <p><BButton @click="qHandler.start('VIS')" class="anchor" :icon="B.codeToText.qtypeIcon('VIS')">Vision</BButton></p>
          <p><BButton disabled @click="qHandler.start('WEL')" class="anchor" :icon="B.codeToText.qtypeIcon('WEL')">Wellness</BButton></p>
          <hr style="margin-top: .2em; margin-bottom: .2em;"/>
          <p><BButton :disabled="!cfgQuotesList.pickedRow" @click="qHandler.startFromQuote(cfgQuotesList.pickedRow)" class="anchor" icon="clone_">Copy Selected</BButton></p>
        </template>
      </BPopup>
      <BButton class="anchor anchor-in-table-footer" gapleft style="color: white" :disabled="!cfgQuotesList.pickedRow" :icon="uStore.isUserReadOnly() ? 'solid magnifying-glass-plus' : 'edit'" @click="qHandler.edit(cfgQuotesList.pickedRow)">{{ uStore.isUserReadOnly() ? 'View Quote...' : 'Edit Quote...' }}</BButton>
      <BButton class="anchor anchor-in-table-footer" gapleft style="color: white" disabled icon="file-pdf">Generate Proposal</BButton>
    </template>
  </BTable>

  <QuoteDialog :popid="qHandler.popid"
    @save="(q) => qHandler.save(q)"
    @close="qHandler.close()"
    @continue="(q) => qHandler.continue(q)"
    @delete="qHandler.delete()"
    @submit="(q) => qHandler.submit(q)"
    @force="(q) => qHandler.force(q)"
    :quote="qHandler.quote.value"/>

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
