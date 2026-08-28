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

// Watch for changes to the prospect.
// Because the value is in a store, we need to use
// a 'getter' function rather than just the value itself
watch(() => prospStore.prospect, () => {
    // console.log('Prospect quotes changed (Quotes List)')
    cfgQuotesList.value.pickedRow = null
  }
)

const cfgQuotesList = ref({
  height: "calc(100vh - 14.5em)",
  width: "calc(100vw - 200px - 2em)",
  pickedRow: null as any,
  columns: [
    { id: "id", heading: "Quote", width: "5em", flags: "R" },
    { id: "effdat", heading: "Effective", width: "5em", flags: "C" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "rlob", heading: "Product", width: "8em", cellclass: "mono" },
    { id: "descr", heading: "Description" },
    { id: "status", heading: "Status", width: "8em", cellclass: "mono" },
  ]
})

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
    <template #buttons>
      <BPopup as="button" class="action gapright" linkicon="square-plus_" linktext="New Quote&hellip;" pos="T2R">
        Placeholder for New Quote dialog
      </BPopup>&nbsp;
      <!-- <BActionlist :disabled="!cfgQuotesList.pickedRow" class="anchor" heading="Quote Actions" pos="T2R" icon="solid bars" text="Actions"
        :actions="[
          { icon: 'lightbulb', text: 'Quote Info', info: {heading:`Quote ID ${cfgQuotesList.pickedRow?.id} Info`,
            body:
              `<ul>
                <li>Created: ${B.format.ts(cfgQuotesList.pickedRow?.crttms)}</li>
                <li>By: ${cfgQuotesList.pickedRow?.crtusr}</li>
                <li>Plans
                <ul>
                  <li>MED: ${B.ifNull(cfgQuotesList.pickedRow?.med_plan, '')}</li>
                  <li>DRU: ${B.ifNull(cfgQuotesList.pickedRow?.dru_plan, '')}</li>
                  <li>DEN: ${B.ifNull(cfgQuotesList.pickedRow?.den_plan, '')}</li>
                  <li>VIS: ${B.ifNull(cfgQuotesList.pickedRow?.vis_plan, '')}</li>
                </ul></li>
              </ul>`}
          },
        ]"
      /> -->
      <BInfo :disabled="!cfgQuotesList.pickedRow" pos="T2R" class="gapright" :heading="'Quote ID ' + cfgQuotesList.pickedRow?.id + ' Info'">
        <ul>
          <li>Quote ID: {{ cfgQuotesList.pickedRow?.id }} ({{ cfgQuotesList.pickedRow?.qtype }} {{ cfgQuotesList.pickedRow?.funding }} {{ cfgQuotesList.pickedRow?.rlob }})</li>
          <li>Created: {{ B.format.ts(cfgQuotesList.pickedRow?.crttms) }}</li>
          <li>By: {{ cfgQuotesList.pickedRow?.crtusr }}</li>
          <li v-if="cfgQuotesList.pickedRow?.med_plan">MED Plan: {{ cfgQuotesList.pickedRow?.med_plan }}</li>
          <li v-if="cfgQuotesList.pickedRow?.dru_plan">DRU Plan: {{ cfgQuotesList.pickedRow?.dru_plan }}</li>
          <li v-if="cfgQuotesList.pickedRow?.den_plan">DEN Plan: {{ cfgQuotesList.pickedRow?.den_plan }}</li>
          <li v-if="cfgQuotesList.pickedRow?.vis_plan">VIS Plan: {{ cfgQuotesList.pickedRow?.vis_plan }}</li>
        </ul>
      </BInfo>
      |
      <BButton gapleft :disabled="!cfgQuotesList.pickedRow" class="anchor" icon="_file-pdf">Generate</BButton>
    </template>
  </BTable>
</template>

<style lang="css" scoped>
</style>
