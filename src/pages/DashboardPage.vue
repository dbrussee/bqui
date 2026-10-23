<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, useId } from 'vue'
import { B } from '@/composables/BUtils'
// import BIcon from '@/components/B/BIcon.vue'
import { appUserStore } from '@/stores/AppUserStore'
const uStore = appUserStore()
import { appProspectStore } from '@/stores/ProspectStore'
const pStore = appProspectStore()
import { QuoteStore } from '@/stores/QuoteStore'
const qStore = QuoteStore()
// import { useSearchProspectPopup } from '@/popups/SearchProspect/useSearchProspectPopup';
import BTable from '@/components/B/BTable.vue'
import BIcon from '@/components/B/BIcon.vue'
import BButton from '@/components/B/BButton.vue'
import EditQuoteDialog from '@/dialogs/EditQuoteDialog.vue'
import ViewQuoteDialog from '@/dialogs/ViewQuoteDialog.vue'
import type { Iquote, Iprospect } from '@/types'

const salutation = ():string => {
  const msg = timeOfDay()
  const user = uStore.user
  if (!user) return msg
  return `${msg}, ${user.fstnam}`
}

const timeOfDay = ():string => {
  const hours = new Date().getHours()
  if (hours < 12) return "Good Morning"
  if (hours < 18) return "Good Afternoon"
  return "Good Evening"
}

const doSearch = (row:any, col:any):void => {
  if (!row) return // No row picked
  if (!uStore.dashdata[row]) return // No data for that row (eff date)
  const parts = row.split("/")
  const eff = parts[0] + "/" + parts[2] // Short eff (mm/yyyy)
  let status = ""
  if (col.id != 'eff' && col.id != 'total') {
    if (!uStore.dashdata[row].breakout[col.id]) return // No data for that status
    status = col.id
  }
  uStore.getDashboardQuotes(eff, status).then((list:any) => {
    quoteListRows.value = list
    quoteListHandler.eff.value = B.format.effdat(row) as string
    quoteListHandler.status.value = status
    quoteListHandler.open()
  })
}

const setCount = (setStyle:any, setHtml:any, count:number) => {
  if (!count) return
  setStyle((td:HTMLTableCellElement) => {
    td.classList.add("anchor")
  })
  setHtml(count.toString())
}
const setEff = (row:any, setStyle:any, setHtml:any) => {
  setStyle((td:HTMLTableCellElement) => {
    const tr = td.closest("tr") as HTMLTableRowElement
    if (!uStore.dashdata[row]) {
      tr.style.display = "none"
    } else {
      tr.style.display = ""
    }
  })
  const txt = B.format.effdat(row).toString()
  setHtml(txt)
}

const monthsRange = computed(() => {
  const dates = [];
  const today = new Date();

  // 1. Start on the 1st of the month, 3 months prior
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);

  // 2. End 12 months past today (adjusting to cover that full month)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 18, 1);

  // 3. Loop and push each month into the array
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(B.format.dateMMDDYYYY(currentDate))
    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return dates;
})

const dashConfig = ref({
  hover: false,
  onPick: (row:any, ri:number, col:any) => {
    // dashConfig.value.pickedRow = row
    doSearch(row, col)
  },
  // onDblpick: () => { doSearch() },
  // pickedRow: null as any,
  columns: [
    { id: "eff", heading: "Effective", width: "5em", flags: "R" },
    { id: "total", heading: "Total", width: "4em", flags: "C" },
    { id: "INPROG", heading: B.codeToText.quoteStatus('INPROG'), width: "5em", flags: "C" },
    { id: "PENDING", heading: B.codeToText.quoteStatus('PENDING'), width: "5em", flags: "C" },
    { id: "RATEREQ", heading: B.codeToText.quoteStatus('RATEREQ'), width: "5em", flags: "C" },
    { id: "READY", heading: B.codeToText.quoteStatus('READY'), width: "5em", flags: "C" },
    { id: "ENROLLED", heading: B.codeToText.quoteStatus('ENROLLED'), width: "5em", flags: "C" },
    { id: "EXPIRED", heading: B.codeToText.quoteStatus('EXPIRED'), width: "5em", flags: "C" },
  ]
})

const quoteListHandler = {
  popId: useId(),
  eff: ref(""),
  status: ref(""),
  open() { B.popup.showModal(this.popId) },
  close() { B.popup.close(this.popId) },
}
const quoteListRows = ref<any>([])
const quoteListConfig = ref({
  height: "20em",
  onPick: (row:any) => {
    quoteListHandler.close()
    quoteHandler.edit(row.quote)
  },
  columns: [
    { id: "pid", heading: "", flags: "R" },
    { id: "name", heading: "Prospect", width: "12em" },
    { id: "quote.id", heading: "Quote", flags: "R" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "quote.funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "status", heading: "Status", width: "11em" },
    { id: "quote.descr", heading: "Name", width: "12em" },
  ]
})
const quoteListWithoutStatusConfig = ref({
  height: "20em",
  onPick: (row:any) => {
    quoteListHandler.close()
    quoteHandler.edit(row.quote)
  },
  columns: [
    { id: "pid", heading: "", flags: "R" },
    { id: "name", heading: "Prospect", width: "12em" },
    { id: "quote.id", heading: "Quote", flags: "R" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "quote.funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "quote.descr", heading: "Name", width: "12em" },
  ]
})

const quotePlans = ref<any>(null)
const quoteAttrs = ref<any>(null)
const quoteProspect = ref<Iprospect | null>(null)
const quoteQuote = ref<Iquote | null>(null)
const quoteHandler = {
  action: "",
  editPopid: useId(),
  viewPopid: useId(),
  lastQtype: '',
  close() {
    B.popup.close(this.editPopid, this.viewPopid)
    this.action = "";
  },
  openEdit() {
    B.popup.showModal(this.editPopid, this.viewPopid)
    this.action = "editing";
  },
  openView() {
    B.popup.showModal(this.viewPopid, this.editPopid)
    this.action = "viewing";
  },
  delete() {
    if (!quoteQuote.value) return
    qStore.deleteQuote(quoteQuote.value.id)
    uStore.getDashboard()
    this.close()
  },
  edit(quote:Iquote) {
    if (!pStore.prospect) return
    const status = quote.status
    if (status == "READY" || status == "RATEREQ" || status == "PENDING") {
      this.view(quote)
    } else {
      qStore.quote = {...quote}
      qStore.getPlanList(quote)
      this.openEdit()
    }
  },
  view(quote:Iquote) {
    quoteQuote.value = {...quote}
    quotePlans.value = null
    quoteAttrs.value = null
    quoteProspect.value = null
    // Call the API to get details... This is async, so the
    // dialog will open with empty data (from above) and then
    // get populated after the async promise completes
    qStore.getPlansForQuote(quoteQuote.value.id).then((data:any) => {
      quotePlans.value = data.resp.plans || null
      quoteAttrs.value = data.resp.attrs || null
      quoteProspect.value = data.resp.prospect || null
      this.openView()
    })
  },
  revertToINPROG() { // Quote is already set
    if (!quoteQuote.value) return
    const tempDescr = quoteQuote.value.descr
    quoteQuote.value.status = 'INPROG'
    qStore.updateQuote(quoteQuote.value, "set back to In Progress").then((updatedQuote:any) => {
      if (updatedQuote && quoteQuote.value) {
        quoteQuote.value.descr = tempDescr
        uStore.getDashboard()
        pStore.refreshQuote(quoteQuote.value)
      }
    })
  },
  save() { // Quote is already set
    if (!quoteQuote.value) return
    qStore.updateQuote(quoteQuote.value, "updated").then((updatedQuote:any) => {
      if (updatedQuote && quoteQuote.value) {
        uStore.getDashboard()
        pStore.refreshQuote(quoteQuote.value)
      }
      this.close()
    })
  },
  submit() { // Quote is already set
    if (!quoteQuote.value) return
    let toastMessage = 'unchanged'
    switch(quoteQuote.value.nonstd) {
      case 'N':
        quoteQuote.value.status = 'READY'
        toastMessage = 'submitted'
        break
      case 'Y':
        quoteQuote.value.status = 'RATEREQ'
        toastMessage = 'rates requested'
        break
      case 'C':
        quoteQuote.value.status = 'PENDING'
        toastMessage = 'pending approval'
    }
    qStore.updateQuote(quoteQuote.value, toastMessage).then((updatedQuote:any) => {
      if (updatedQuote) {
        pStore.refreshQuote(quoteQuote.value)
        uStore.getDashboard()
      }
      this.close()
    })
  },
  abort() {
    this.close()
  }
}

const formatStatusCell = (row:any, setStyle:any) => {
  setStyle((td:HTMLTableCellElement) => {
    const classname = "status" + row.quote.status
    td.classList.add(classname)
  })
  return B.codeToText.quoteStatus(row.quote.status)
}
const formatProspectName = (row:any, setStyle:any, setHtml:any) => {
  setStyle((td:HTMLTableCellElement) => {
    td.style.width = "5em"
  })
  setHtml(`<p class='truncate-text'>${row.name}</p>`)
}
const headingText = ():string => {
  let txt = ""
  const scope = uStore.user?.rights.SEARCH_SCOPE.value
  if (scope == "GLOBAL") txt += "All "
  else if (scope == "AGENCY") txt += "Your Agency "
  else txt += "Your "
  txt += "Quotes for "
  txt += quoteListHandler.eff.value

  if (quoteListHandler.status.value != '') {
    txt += " with status '" + B.codeToText.quoteStatus(quoteListHandler.status.value) + "'"
  }
  return txt
}

</script>
<template>
  <p>
    {{ salutation() }}
  </p>
  <BTable class="centerme" :config="dashConfig" :rows="monthsRange">
    <template #column_eff="{row, setStyle, setHtml}">{{ setEff(row, setStyle, setHtml) }}</template>
    <template #column_total="{row, setStyle, setHtml}">{{ setCount(setStyle, setHtml, uStore.dashdata[row]?.total) }}</template>
    <template #column_INPROG="{row, setStyle, setHtml}">{{ setCount(setStyle, setHtml, uStore.dashdata[row]?.breakout.INPROG) }}</template>
    <template #column_PENDING="{row, setStyle, setHtml}">{{ setCount(setStyle, setHtml, uStore.dashdata[row]?.breakout.PENDING) }}</template>
    <template #column_RATEREQ="{row, setStyle, setHtml}">{{ setCount(setStyle, setHtml, uStore.dashdata[row]?.breakout.RATEREQ) }}</template>
    <template #column_READY="{row, setStyle, setHtml}">{{ setCount(setStyle, setHtml, uStore.dashdata[row]?.breakout.READY) }}</template>
    <template #column_ENROLLED="{row, setStyle, setHtml}">{{ setCount(setStyle, setHtml, uStore.dashdata[row]?.breakout.ENROLLED) }}</template>
    <template #column_EXPIRED="{row, setStyle, setHtml}">{{ setCount(setStyle, setHtml, uStore.dashdata[row]?.breakout.EXPIRED) }}</template>
    <!-- <template #footer>
        <BButton class="anchor" :disabled="!dashConfig.pickedRow" icon="solid magnifying-glass" @click="doSearch()">Search...</BButton>
    </template> -->
  </BTable>
  <EditQuoteDialog  :popupid="quoteHandler.editPopid"
    @abort="quoteHandler.abort()"
    @delete="quoteHandler.delete()"
    @submit="quoteHandler.submit()"
    @force="quoteHandler.revertToINPROG()"
    @save="() => quoteHandler.save()"></EditQuoteDialog>
  <ViewQuoteDialog :popupid="quoteHandler.viewPopid"
    :quote="quoteQuote as Iquote"
    :prospect="quoteProspect as Iprospect"
    :plans="quotePlans"
    :attrs="quoteAttrs"
    @force="quoteHandler.revertToINPROG()"
    @abort="quoteHandler.abort()"></ViewQuoteDialog>

  <dialog :id="quoteListHandler.popId">
    <div class="titlebar">{{ headingText() }}</div>
    <BTable :config="quoteListHandler.status.value == '' ? quoteListConfig : quoteListWithoutStatusConfig" :rows="quoteListRows">
      <template #column_name="{row, setStyle, setHtml}">{{ formatProspectName(row, setStyle, setHtml) }}</template>
      <template #column_effdat="{row}">{{ B.format.effdat(row.quote.effdat) }}</template>
      <template #column_product="{row}">{{ row.quote.qtype }} {{ row.quote.rlob }}</template>
      <template #column_status="{row, setStyle}"><BIcon :icon="B.statusIcon(row.quote.status)">{{ formatStatusCell(row, setStyle) }}</BIcon></template>
      <template #column_nonstd="{row}">
        <span :class="{
          'nonstdY': row.quote.nonstd == 'Y',
          'nonstdC': row.quote.nonstd == 'C'}"
        >{{ B.codeToText.nonstd(row.quote.nonstd) }}</span>
      </template>
    </BTable>
    <div class="buttonbar">
      <BButton @click="quoteListHandler.close()" class="anchor" icon="#red x">Cancel</BButton>
    </div>
  </dialog>

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
