<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed, useId } from 'vue'
import { B } from '@/composables/BUtils'
// import BIcon from '@/components/B/BIcon.vue'
import { appUserStore } from '@/stores/AppUserStore'
const uStore = appUserStore()
import { QuoteStore } from '@/stores/QuoteStore'
import { appProspectStore } from '@/stores/ProspectStore'
const pStore = appProspectStore()
const qStore = QuoteStore()
// import { useSearchProspectPopup } from '@/popups/SearchProspect/useSearchProspectPopup';
import BTable from '@/components/B/BTable.vue'
import BIcon from '@/components/B/BIcon.vue'
import BButton from '@/components/B/BButton.vue'
import { useToast } from '@/composables/useToast'
import QuoteDialog from '@/dialogs/QuoteDialog.vue'
import { type Iquote } from '@/types'

const salutation = ():string => {
  const msg = timeOfDay()
  const user = uStore.user
  if (!user) return msg
  return `${msg}, ${user.fstnam} ${user.lstnam}`
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
  // if (!count) return
  setStyle((td:HTMLTableCellElement) => {
    td.classList.add("anchor")
  })
  setHtml(count ? count.toString() : '')
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
    qHandler.edit(row.quote)
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
    qHandler.edit(row.quote)
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

const qHandler = {
  quote: ref<Iquote | undefined>(undefined),
  popid: useId(),

  close() {
    B.popup.close(this.popid)
  },
  edit(quote:Iquote) {
    this.quote.value = {...quote}
    B.popup.showModal(this.popid)
  },
  save(quote:Iquote) {
    if (quote.id < 0) {
      qStore.quote = {...quote}
      qStore.createQuote().then(() => {
        pStore.refreshQuote(quote)
        uStore.getDashboard()
        this.close()
      })
    } else {
      qStore.updateQuote(quote).then((updatedQuote:any) => {
        if (updatedQuote) {
          pStore.refreshQuote(quote)
          uStore.getDashboard()
          useToast().addToast(`Quote ${updatedQuote.id} saved`, "success")
        }
        this.close()
      })
    }
  },
  delete() {
    if (!this.quote.value) return
    qStore.deleteQuote(this.quote.value.id)
    pStore.refreshQuote(this.quote.value)
    uStore.getDashboard()
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
        pStore.refreshQuote(quote)
        uStore.getDashboard()
        this.close()
      })
    } else {
      qStore.updateQuote(quote).then((updatedQuote:any) => {
        if (updatedQuote) {
          pStore.refreshQuote(updatedQuote)
          uStore.getDashboard()
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
        pStore.refreshQuote(updatedQuote)
        uStore.getDashboard()
        useToast().addToast(`Quote ${updatedQuote.id} set back to In Progress`, "success")
      }
    })
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
  <QuoteDialog :popid="qHandler.popid"
    @save="(q:Iquote) => qHandler.save(q)"
    @close="qHandler.close()"
    @delete="qHandler.delete()"
    @submit="(q:Iquote) => qHandler.submit(q)"
    @force="(q:Iquote) => qHandler.force(q)"
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
