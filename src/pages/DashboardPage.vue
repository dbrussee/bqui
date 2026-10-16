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
import BButton from '@/components/B/BButton.vue'

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

const doSearch = ():void => {
  if (!uStore.dashdata[dashConfig.value.pickedRow]) return
  const parts = dashConfig.value.pickedRow.split("/")
  const eff = parts[0] + "/" + parts[2]
  pStore.searchQuery = "@" + eff
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
  onPick: (row:any) => {
    dashConfig.value.pickedRow = row
  },
  onDblpick: () => { doSearch() },
  pickedRow: null as any,
  columns: [
    { id: "eff", heading: "Effective", width: "6em", flags: "R" },
    { id: "total", heading: "Total", flags: "R" },
    { id: "INPROG", heading: B.codeToText.quoteStatus('INPROG'), width: "2em", flags: "R" },
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
  <template #footer>
      <BButton class="anchor" :disabled="!dashConfig.pickedRow" icon="solid magnifying-glass" @click="doSearch()">Search...</BButton>
  </template>
</BTable>
</template>
<style lang="css" scoped>

table {
  border-collapse: collapse;
  position: relative;
}
thead tr {
  top: 0;
  position: sticky;
  z-index: 1;
}
thead tr th {
  /* border-top: 1px solid var(--table-header-bg); */
  /* border-bottom: 1px solid var(--table-header-bg); */
  width: 2em;
  text-align: left;
  font-weight: normal;
  text-align: right;
  background-color: var(--body-bg);
  color: var(--form-prompt-color) !important;
  padding: 0.1rem 0.2rem;
  padding-bottom: .6rem;
  /* text-decoration: double underline; */
  text-underline-offset: 4px;
  vertical-align: bottom;
}
tr td {
  line-height: 1.1em;
  /* border-left: 1px solid black; */
  border-bottom: 1px solid var(--table-row-border-color);
  padding: 0.1rem 0.2rem;
  vertical-align: top;
  cursor: pointer;
}

tbody tr {
  background-color: var(--table-row-bg);
  color: var(--table-row-text);
  &:hover {
    background-color: var(--table-row-picked-bg);
    color: var(--table-row-picked-text) !important;
  }
  &.picked {
    background-color: var(--table-row-picked-bg);
    color: var(--table-row-picked-text) !important;
  }
}

</style>
