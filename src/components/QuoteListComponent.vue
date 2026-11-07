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
  onDblpick: () => { quoteEventHandler.edit(cfgQuotesList.value.pickedRow) },
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
      help: `<p>Values in<sup>superscript</sup> indicate the number
      of proposals the quote is assigned to.</p>
      <p>'In Progress' quotes cannot be added to proposals.</p>
      <p>If the number shows as<sup style='color:red;'><b>0</b></sup>&nbsp;then it
      will not be able to be enrolled. ONLY quotes in proposals can be
      enrolled</p>`},
    { id: "descr", heading: "Name" },
  ]
})

const formatStatusCell = (row:any, setStyle:any, setHtml:any) => {
  setStyle((td:HTMLTableCellElement) => {
    const classname = "status" + row.status
    td.classList.add(classname)
  })
  let txt = B.codeToText.quoteStatus(row.status)
  if ("INPROG,ENROLLED,EXPIRED".indexOf(row.status) < 0) {
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

const findAndPickQuote = ((qid:number) => {
  const found = pStore.quotes.find((q:Iquote) => {
    return q.id == qid
  })
  cfgQuotesList.value.pickedRow = found
})
const quoteEventHandler = {
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
    q.effdat = quote.effdat
    qStore.getRLOBList(q)
    this.quote.value = {...q}
    B.popup.showModal(this.popid)
  },
  async edit(quote:Iquote) {
    const temp = await qStore.getQuote(quote.id)
    // console.dir(temp)
    // qStore.quote = this.quote.value
    if (temp) {
      this.quote.value = temp
      B.popup.showModal(this.popid)
    }
  },
  async save(quote:Iquote) {
    findAndPickQuote(quote.id)
    useToast().addToast(`Quote ${quote.id} saved`, "success")
    this.close()
  },
  name(quote:Iquote) { // Quote has already been saved with new name... just get it into the list
    findAndPickQuote(quote.id)
  },
  delete() {
    cfgQuotesList.value.pickedRow = null
    this.close()
  },
  async submit(quote:Iquote) {
    let toastMessage = 'unchanged'
    switch(quote.nonstd) {
      case 'N':
        toastMessage = 'is ready to enroll'
        break
      case 'Y':
        toastMessage = 'rates have been requested'
        break
      case 'C':
        toastMessage = 'is pending approval'
        break
    }
    findAndPickQuote(quote.id)
    useToast().addToast(`Quote ${quote.id} ${toastMessage}`, "success")
  },
  async force(quote:Iquote) {
    findAndPickQuote(quote.id)
    useToast().addToast(`Quote ${quote.id} set back to In Progress`, "success")
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
          <p><BButton @click="quoteEventHandler.start('MED')" class="anchor" :icon="B.codeToText.qtypeIcon('MED')">Medical &amp; Drug</BButton></p>
          <p><BButton @click="quoteEventHandler.start('DEN')" class="anchor" :icon="B.codeToText.qtypeIcon('DEN')">Dental</BButton></p>
          <p><BButton @click="quoteEventHandler.start('VIS')" class="anchor" :icon="B.codeToText.qtypeIcon('VIS')">Vision</BButton></p>
          <p><BButton disabled @click="quoteEventHandler.start('WEL')" class="anchor" :icon="B.codeToText.qtypeIcon('WEL')">Wellness</BButton></p>
          <hr style="margin-top: .2em; margin-bottom: .2em;"/>
          <p><BButton :disabled="!cfgQuotesList.pickedRow" @click="quoteEventHandler.startFromQuote(cfgQuotesList.pickedRow)" class="anchor" icon="clone_">Copy Selected</BButton></p>
        </template>
      </BPopup>
      <BButton class="anchor anchor-in-table-footer"
        gapleft gapright
        style="color: white"
        :disabled="!cfgQuotesList.pickedRow"
        :icon="uStore.isUserReadOnly() ? 'solid magnifying-glass-plus' : 'edit'"
        @click="quoteEventHandler.edit(cfgQuotesList.pickedRow)"
        @xclick="quoteEventHandler.edit(cfgQuotesList.pickedRow)"
      >{{ uStore.isUserReadOnly() ? 'View Quote...' : 'Edit Quote...' }}</BButton>
      |
      <BButton class="anchor anchor-in-table-footer"
        gapleft
        style="color: white"
        icon="solid rotate-left_"
        @click="pStore.reloadProspect()">Refresh</BButton>
    </template>
  </BTable>

  <QuoteDialog :popid="quoteEventHandler.popid"
    @save="(q) => quoteEventHandler.save(q)"
    @name="(q) => quoteEventHandler.name(q)"
    @close="quoteEventHandler.close()"
    @delete="quoteEventHandler.delete()"
    @submit="(q) => quoteEventHandler.submit(q)"
    @force="(q) => quoteEventHandler.force(q)"
    :quote="quoteEventHandler.quote.value"/>

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
