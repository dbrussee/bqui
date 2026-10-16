<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { B } from '@/composables/BUtils'
// import BIcon from '@/components/B/BIcon.vue'
import { appUserStore } from '@/stores/AppUserStore'
const uStore = appUserStore()
import { appProspectStore } from '@/stores/ProspectStore'
const pStore = appProspectStore()
import { useSearchProspectPopup } from '@/popups/SearchProspect/useSearchProspectPopup';
import BTable from '@/components/B/BTable.vue'
// import BButton from '@/components/B/BButton.vue'

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
  pStore.searchQuery = "@" + eff // Add status
  if (col.id != 'eff' && col.id != 'total') {
    if (!uStore.dashdata[row].breakout[col.id]) return
    pStore.searchQuery += " ~" + col.id
  }
  pStore.searchProspects(pStore.searchQuery)
  useSearchProspectPopup().openSearch()
}

const monthsRange = computed(() => {
  const dates = [];
  const today = new Date();

  // 1. Start on the 1st of the month, 3 months prior
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);

  // 2. End 12 months past today (adjusting to cover that full month)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 12, 1);

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
    { id: "eff", heading: "Effective", width: "6em", flags: "R" },
    { id: "total", heading: "Total", flags: "R" },
    { id: "INPROG", heading: B.codeToText.quoteStatus('INPROG'), width: "6em", flags: "R" },
    { id: "PENDING", heading: B.codeToText.quoteStatus('PENDING'), width: "2em", flags: "R" },
    { id: "RATEREQ", heading: B.codeToText.quoteStatus('RATEREQ'), width: "2em", flags: "R" },
    { id: "READY", heading: B.codeToText.quoteStatus('READY'), width: "2em", flags: "R" },
    { id: "ENROLLED", heading: B.codeToText.quoteStatus('ENROLLED'), width: "2em", flags: "R" },
    { id: "EXPIRED", heading: B.codeToText.quoteStatus('EXPIRED'), width: "2em", flags: "R" },
  ]
})

</script>
<template>
<p>
  {{ salutation() }}
</p>
<BTable :config="dashConfig" :rows="monthsRange">
  <template #column_eff="{row}">{{ B.format.effdat(row) }}</template>
  <template #column_total="{row}">{{ uStore.dashdata[row]?.total }}</template>
  <template #column_INPROG="{row}">{{ uStore.dashdata[row]?.breakout.INPROG }}</template>
  <template #column_PENDING="{row}">{{ uStore.dashdata[row]?.breakout.PENDING }}</template>
  <template #column_RATEREQ="{row}">{{ uStore.dashdata[row]?.breakout.RATEREQ }}</template>
  <template #column_READY="{row}">{{ uStore.dashdata[row]?.breakout.READY }}</template>
  <template #column_ENROLLED="{row}">{{ uStore.dashdata[row]?.breakout.ENROLLED }}</template>
  <template #column_EXPIRED="{row}">{{ uStore.dashdata[row]?.breakout.EXPIRED }}</template>
  <!-- <template #footer>
      <BButton class="anchor" :disabled="!dashConfig.pickedRow" icon="solid magnifying-glass" @click="doSearch()">Search...</BButton>
  </template> -->
</BTable>
</template>
<style lang="css" scoped>

</style>
