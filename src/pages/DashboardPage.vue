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
  if (!row) return
  if (!uStore.dashdata[row]) return
  // console.dir(col)
  const parts = row.split("/")
  const eff = parts[0] + "/" + parts[2]
  let status = ""
  if (col.id != 'eff' && col.id != 'total') {
    if (!uStore.dashdata[row].breakout[col.id]) return
    status = col.id
  }
  uStore.getDashboardQuotes(eff, status).then((list:any) => {
    quoteListRows.value = list
    quoteListHandler.eff.value = B.format.effdat(row) as string
    quoteListHandler.status.value = status
    quoteListHandler.open()
  })

  // pStore.clearSearchParameters()
  // pStore.searchParameters.eff = eff
  // if (col.id != 'eff' && col.id != 'total') {
  //   if (!uStore.dashdata[row].breakout[col.id]) return
  //   pStore.searchParameters.status = col.id
  // }
  // pStore.searchProspects()
  // useSearchProspectPopup().openSearch()
}

const setCount = (td:HTMLTableCellElement | null, count:number) => {
  if (!td) return
  if (!count) return
  td.classList.add("anchor")
  return count.toString()
}
const setEff = (row:any, rn:number, td:HTMLTableCellElement | null) => {
  if (!td) return
  const txt = B.format.effdat(row).toString()
  // if (rn > 0 && !txt.startsWith("Jan")) {
  //   txt = txt.split(" ")[0] as string
  // }
  const tr = td.closest("tr") as HTMLTableRowElement
  if (!uStore.dashdata[row]) {
    tr.style.display = "none"
  } else {
    tr.style.display = ""
  }
  td.innerHTML = txt
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
  open() { (document.getElementById(this.popId) as HTMLDialogElement).showModal() },
  close() { (document.getElementById(this.popId) as HTMLDialogElement).close() },
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

const quoteHandler = {
  action: "",
  editPopid: useId(),
  lastQtype: '',
  openEdit() { (document.getElementById(this.editPopid) as HTMLDialogElement).showModal(); this.action = "editing"; },
  closeEdit() { (document.getElementById(this.editPopid) as HTMLDialogElement).close(); this.action = ""; },
  delete() {
    qStore.deleteQuote(qStore.quote.id)
    uStore.getDashboard()
    this.closeEdit()
  },
  edit(quote:any) {
    if (!pStore.prospect) return
    qStore.quote = {...quote}
    qStore.getPlanList(pStore.prospect.id)
    this.openEdit()
  },
  revertToINPROG() {
    qStore.quote.status = 'INPROG'
    qStore.updateQuote(qStore.quote, "set back to In Progress").then((updatedQuote:any) => {
      if (updatedQuote) {
        uStore.getDashboard()
        pStore.refreshQuote(qStore.quote)
        this.closeEdit()
      }
    })
  },
  save() {
    if (qStore.quote.id < 0) {
      qStore.createQuote().then(() => {
        uStore.getDashboard()
        pStore.refreshQuote(qStore.quote)
        this.closeEdit()
      })
    } else {
      qStore.updateQuote(qStore.quote, "updated").then((updatedQuote:any) => {
        if (updatedQuote) {
          pStore.refreshQuote(qStore.quote)
          uStore.getDashboard()
        }
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
        pStore.refreshQuote(qStore.quote)
        uStore.getDashboard()
        this.closeEdit()
      })
    } else {
      qStore.updateQuote(qStore.quote, toastMessage).then((updatedQuote:any) => {
        if (updatedQuote) {
          pStore.refreshQuote(qStore.quote)
          uStore.getDashboard()
        }
        this.closeEdit()
      })
    }
  },
  abort() {
    this.closeEdit()
  }
}
const formatStatusCell = (row:any, td:HTMLTableCellElement | null) => {
  if (td == null) return
  const classname = "status" + row.quote.status
  td.classList.add(classname)
  return B.codeToText.quoteStatus(row.quote.status)
}
const formatProspectName = (row:any, td:HTMLTableCellElement | null) => {
  if (td == null) return
  td.style.width = "5em"
  td.innerHTML = `<p class='truncate-text'>${row.name}</p>`
}

</script>
<template>
  <p>
    {{ salutation() }}
  </p>
  <BTable class="centerme" :config="dashConfig" :rows="monthsRange">
    <template #column_eff="{row, td, rn}">{{ setEff(row, rn, td) }}</template>
    <template #column_total="{row, td}">{{ setCount(td, uStore.dashdata[row]?.total) }}</template>
    <template #column_INPROG="{row, td}">{{ setCount(td, uStore.dashdata[row]?.breakout.INPROG) }}</template>
    <template #column_PENDING="{row, td}">{{ setCount(td, uStore.dashdata[row]?.breakout.PENDING) }}</template>
    <template #column_RATEREQ="{row, td}">{{ setCount(td, uStore.dashdata[row]?.breakout.RATEREQ) }}</template>
    <template #column_READY="{row, td}">{{ setCount(td, uStore.dashdata[row]?.breakout.READY) }}</template>
    <template #column_ENROLLED="{row, td}">{{ setCount(td, uStore.dashdata[row]?.breakout.ENROLLED) }}</template>
    <template #column_EXPIRED="{row, td}">{{ setCount(td, uStore.dashdata[row]?.breakout.EXPIRED) }}</template>
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
  <dialog :id="quoteListHandler.popId">
    <div class="titlebar">Dashboard Quotes for {{ quoteListHandler.eff }}<span v-if="quoteListHandler.status.value != ''"> status <BIcon :icon="B.statusIcon(quoteListHandler.status.value)" />{{ B.codeToText.quoteStatus(quoteListHandler.status.value) }}</span></div>
    <BTable :config="quoteListHandler.status.value == '' ? quoteListConfig : quoteListWithoutStatusConfig" :rows="quoteListRows">
      <template #column_name="{row, td}">{{ formatProspectName(row, td) }}</template>
      <template #column_effdat="{row}">{{ B.format.effdat(row.quote.effdat) }}</template>
      <template #column_product="{row}">{{ row.quote.qtype }} {{ row.quote.rlob }}</template>
      <template #column_status="{row, td}"><BIcon :icon="B.statusIcon(row.quote.status)">{{ formatStatusCell(row, td) }}</BIcon></template>
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
