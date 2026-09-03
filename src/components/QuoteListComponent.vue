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
  height: "calc(100vh - 15em)",
  width: "calc(100vw - 200px - 2em)",
  pickedRow: null as any,
  columns: [
    { id: "id", heading: "Quote", width: "5em", flags: "R" },
    { id: "effdat", heading: "Effective", width: "5em", flags: "C" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C" },
    // { id: "nonstd", heading: "NS", width: "3em", flags: "C" },
    { id: "status", heading: "Status", width: "8em", cellclass: "mono" },
    { id: "descr", heading: "Description" },
  ]
})

const productIcon = (qtype:string):string => {
  console.log("Product Icon", qtype)
  if (qtype == 'MED') return '#black solid stethoscope_'
  if (qtype == 'DEN') return '#black solid tooth_'
  if (qtype == 'VIS') return '#black solid glasses_'
  if (qtype == 'WEL') return '#black solid spa_'
  return '#red solid question'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleQuoteRowClicked = (row:any, col:any, cn:number) => {
  cfgQuotesList.value.pickedRow = row
  // const pop = document.getElementById('popStatus')
  // pop?.showPopover()

}
// const quoteRowPopupId = useId()
// const handlePopup = (qid:number, e:Event):void => {
//   const el = e.target as HTMLElement
//   const code = el.getAttribute('code')
//   console.log(`Popup Choice: Quote ${qid} ${code}`)
//   // const popup = document.getElementById(quoteRowPopupId) as HTMLDialogElement
//   // popup?.hidePopover()
//   return
// }

</script>

<template>
  <BTable
      @pick="(row:any, col:any, cn:number) => {
        handleQuoteRowClicked(row, col, cn)
      }"
      :config="cfgQuotesList" :rows="prospStore.quotes">
    <template #column_effdat="{row}">{{ B.format.effdat(row.effdat) }}</template>
    <template #column_product="{row}"><BIcon :icon="productIcon(row.qtype)"/>{{ row.rlob }}<sup v-if="row.nonstd=='Y'" style="color:red">NS</sup></template>
    <template #buttons>
      <BPopup class="action gapright" icon="solid bars_" pos="T2R" heading="Select Quote Type">New Quote&hellip;
        <template #body>
          <p><BButton class="anchor" icon="#black solid stethoscope_">Medical &amp; Drug</BButton></p>
          <p><BButton class="anchor" icon="#black solid tooth_">Dental</BButton></p>
          <p><BButton class="anchor" icon="#black solid glasses_">Vision</BButton></p>
          <p><BButton class="anchor" icon="#black solid spa_">Wellness</BButton></p>
        </template>
      </BPopup>
      <BInfo :disabled="!cfgQuotesList.pickedRow" pos="T2R" class="gapright" :heading="'Selected Quote Details'">
        <ul>
          <li>{{ cfgQuotesList.pickedRow?.qtype }} Quote ID: {{ cfgQuotesList.pickedRow?.id }}
            ({{ cfgQuotesList.pickedRow?.funding }} {{ cfgQuotesList.pickedRow?.rlob }})<sup
              v-if="cfgQuotesList.pickedRow?.nonstd == 'Y'" style="color:red">NS</sup>
          </li>
          <li>Effective: {{ B.format.effdat(cfgQuotesList.pickedRow?.effdat) }}</li>
          <li>Status: {{ B.format.effdat(cfgQuotesList.pickedRow?.status) }}</li>
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
</style>
