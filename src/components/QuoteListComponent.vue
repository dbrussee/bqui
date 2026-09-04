<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { appProspectStore } from '@/stores/ProspectStore.ts';
const prospStore = appProspectStore()
import BTable from './B/BTable.vue';
import { B } from '@/composables/BUtils.ts';
import BPopup from './B/BPopup.vue';
import BButton from './B/BButton.vue';
// import BActionlist from './B/BActionlist.vue';
import BInfo from './B/BInfo.vue';
import BIcon from './B/BIcon.vue';

// Watch for changes to the prospect.
// Because the value is in a store, we need to use
// a 'getter' function rather than just the value itself
watch(() => prospStore.prospect, () => {
    // console.log('Prospect quotes changed (Quotes List)')
    cfgQuotesList.value.pickedRow = null
  }
)

const cfgQuotesList = ref({
  height: "calc(100vh - 12em)",
  width: "calc(100vw - 200px - 2em)",
  pickedRow: null as any,
  columns: [
    { id: "id", heading: "Quote", width: "5em", flags: "R" },
    { id: "effdat", heading: "Effective", width: "5em", flags: "C" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "product", heading: "Product", width: "4.5em", cellclass: "mono" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C" },
    // { id: "nonstd", heading: "NS", width: "3em", flags: "C" },
    { id: "status", heading: "Status", width: "10em" },
    { id: "descr", heading: "Description" },
  ]
})

const productIcon = (qtype:string):string => {
  if (qtype == 'MED') return '#black solid stethoscope_'
  if (qtype == 'DEN') return '#black solid tooth_'
  if (qtype == 'VIS') return '#black solid glasses_'
  if (qtype == 'WEL') return '#black solid spa_'
  return '#red solid question'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleQuoteRowClicked = (row:any, col:any, cn:number) => {
  cfgQuotesList.value.pickedRow = row
}

</script>

<template>
  <BTable
      @pick="(row:any, col:any, cn:number) => {
        handleQuoteRowClicked(row, col, cn)
      }"
      :config="cfgQuotesList" :rows="prospStore.quotes">
    <template #column_effdat="{row}">{{ B.format.effdat(row.effdat) }}</template>
    <template #column_product="{row}"><BIcon :icon="productIcon(row.qtype)"/>{{ row.rlob }}</template>
    <template #column_status="{row}">{{ B.codeToText.quoteStatus(row.status) }}</template>
    <template #column_nonstd="{row}">
      <span :class="{
        'nonstdY': row.nonstd == 'Y',
        'nonstdC': row.nonstd == 'C'}"
      >{{ B.codeToText.nonstd(row.nonstd) }}</span>
    </template>
    <template #buttons>
      <BPopup class="action gapright" icon="solid bars_" pos="T2R" heading="New Quote Family">New Quote&hellip;
        <template #body>
          <p><BButton class="anchor" icon="#black solid stethoscope_">Medical &amp; Drug</BButton></p>
          <p><BButton class="anchor" icon="#black solid tooth_">Dental</BButton></p>
          <p><BButton class="anchor" icon="#black solid glasses_">Vision</BButton></p>
          <p><BButton class="anchor" icon="#black solid spa_">Wellness</BButton></p>
        </template>
      </BPopup>
      <BInfo :disabled="!cfgQuotesList.pickedRow" pos="T2R" class="gapright" :heading="'Selected Quote Details'" text="Details">
        <ul>
          <li>{{ B.codeToText.nonstd(cfgQuotesList.pickedRow?.nonstd) }}
            {{ B.codeToText.qtype(cfgQuotesList.pickedRow?.qtype) }} Quote ID: {{ cfgQuotesList.pickedRow?.id }}
            ({{ cfgQuotesList.pickedRow?.funding }} {{ cfgQuotesList.pickedRow?.rlob }})
          </li>
          <li>Effective: {{ B.format.effdat(cfgQuotesList.pickedRow?.effdat) }}</li>
          <li>Status: {{ B.codeToText.quoteStatus(cfgQuotesList.pickedRow?.status) }}</li>
          <li v-if="cfgQuotesList.pickedRow?.med_plan">MED Plan: {{ cfgQuotesList.pickedRow?.med_plan }}</li>
          <li v-if="cfgQuotesList.pickedRow?.dru_plan">DRU Plan: {{ cfgQuotesList.pickedRow?.dru_plan }}</li>
          <li v-if="cfgQuotesList.pickedRow?.den_plan">DEN Plan: {{ cfgQuotesList.pickedRow?.den_plan }}</li>
          <li v-if="cfgQuotesList.pickedRow?.vis_plan">VIS Plan: {{ cfgQuotesList.pickedRow?.vis_plan }}</li>
          <li>Created: {{ B.format.ts(cfgQuotesList.pickedRow?.crttms) }}</li>
          <li>By: {{ cfgQuotesList.pickedRow?.crtusr }}</li>
        </ul>
      </BInfo>
      |
      <BButton gapleft :disabled="!cfgQuotesList.pickedRow" class="anchor" icon="_file-pdf">Generate</BButton>
    </template>
  </BTable>
</template>

<style lang="css" scoped>
.nonstdC {
  font-weight: bold;
  color: red;
  text-shadow: 0 0 1px black;
}
.nonstdY {
  color: orange;
}
</style>
