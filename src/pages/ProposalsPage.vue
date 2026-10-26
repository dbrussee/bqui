<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import { appUserStore } from '@/stores/AppUserStore';
const uStore = appUserStore()
import { computed, ref } from 'vue';
import BTable from '@/components/B/BTable.vue';
import BIcon from '@/components/B/BIcon.vue';

// const refresh = () => {
//   cfgQuotesList.value.pickedRow = null
//   currentProposal.value = null;
//   uStore.getProposals()
// }

const cfgQuotesList = ref({
  onPick: (row:any) => {
    cfgQuotesList.value.pickedRow = row
  },
  // onDblpick: () => { qHandler.edit(cfgQuotesList.value.pickedRow) },
  height: "calc(100vh - 13em)",
  width: "calc(100vw - 450px - .9em)",
  pickedRow: null as any,
  // pickedRowNumber: -1,
  no_rows_text: 'No quotes to display',
  columns: [
    { id: "id", heading: "Quote", width: "4em", flags: "R" },
    { id: "nonstd", heading: "Design", width: "5em", flags: "C" },
    { id: "funding", heading: "Fund", width: "3em", flags: "C", cellclass: "mono" },
    { id: "product", heading: "Product", width: "5.5em", cellclass: "mono" },
    { id: "descr", heading: "Name" },
  ]
})


const monthsRange = computed(() => {
  const dates = <any[]>[];
  if (!uStore) return dates
  const today = new Date();

  // 1. Start on the 1st of the month, 3 months prior
  const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);

  // 2. End 12 months past today (adjusting to cover that full month)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 18, 1);

  // 3. Loop and push each month into the array
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateAsString = B.format.dateMMDDYYYY(currentDate)
    dates.push(B.format.dateMMDDYYYY(currentDate))
    const test = uStore.proposaldata[dateAsString]
    if (test) {
      uStore.proposaldata[dateAsString].forEach((pp:any) => {
        pp.effdat = B.dateFromYYYYMMDD(pp.effdat)
      })
    }
    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return dates;
})
const formatStatusCell = (row:any, setStyle:any) => {
  setStyle((td:HTMLTableCellElement) => {
    const classname = "status" + row.status
    td.classList.add(classname)
  })
  return B.codeToText.quoteStatus(row.status)
}


</script>

<template>

  <div class="drop_menu">
    <!-- <BButton class="anchor" icon="solid rotate-left_" @click="refresh()">Refresh List</BButton>&nbsp;&nbsp; -->
    <BButton class="action" icon="square-plus_">New Proposal&hellip;</BButton>
    <span style="float: right;" v-if="uStore.currentProposal">
      <BConfirm class="anchor" pos="B2L" icon="#red trash-can_" @confirm="console.log('Not Implemented')">Delete Proposal
        <template #message>
          Delete this proposal?
          <p style='color:red'>This cannot be undone</p>
        </template>
      </BConfirm>&nbsp;
    </span>
  </div>
  <div v-if="uStore && uStore.proposaldata" class="proposal_list">
    <div v-if="Object.keys(uStore.proposaldata).length == 0" style="width: 100%; text-align: center; color: silver">No Proposals</div>
    <template v-for="m of monthsRange" :key="m">
      <div v-if="uStore?.proposaldata[m]" >{{ B.format.effdat(m) }}
        <ul>
          <li class="anchor" @click="uStore.currentProposal = uStore.proposaldata[m][index]"
            v-for="(pp, index) of uStore.proposaldata[m]" :key="index">{{ uStore.proposaldata[m][index].descr || '< No Name >' }}</li>
        </ul>
      </div>
    </template>
  </div>
  <div v-else class="proposal_list">
    You have no proposals.
  </div>
  <div v-if="uStore.currentProposal" class="proposal">
    <table class="form-table">
      <tbody>
        <tr><th>Effective:</th><td>{{ B.format.effdat(uStore.currentProposal.effdat) }}</td></tr>
        <tr><th>Proposal Name:</th><td><input name="grpname" style="width: 25em;" v-model="uStore.currentProposal.descr"></td></tr>
      </tbody>
    </table>
    <BTable :config="cfgQuotesList" :rows="uStore.currentProposal.quotes">
      <template #column_product="{row}">{{ row.qtype }} {{ row.rlob }}</template>
      <template #column_status="{row, setStyle}"><BIcon :icon="B.statusIcon(row.status)">{{ formatStatusCell(row, setStyle) }}</BIcon></template>
      <template #column_nonstd="{row}">
        <span :class="{
          'nonstdY': row.nonstd == 'Y',
          'nonstdC': row.nonstd == 'C'}"
        >{{ B.codeToText.nonstd(row.nonstd) }}</span>
      </template>
      <template #footer>
        <BButton class="modern" icon="#lime solid plus_">Add Quote</BButton>
        <BButton :disabled="!cfgQuotesList.pickedRow" class="anchor" icon="#red trash-can_" gapleft>Remove Quote?</BButton>
      </template>
    </BTable>
  </div>
  <div v-else class="proposal info">
    Click any proposal on the left to see the contents here
  </div>
</template>

<style lang="css" scoped>
div.proposal_list {
  display: inline-block;
  /* margin-top: .3em; */
  width: 15em;
  height: calc(100vh - 9em);
  overflow-y: auto;
  border-right: 3px solid gainsboro;
  padding-right: 3px;
}
div.proposal {
  display: inline-block;
  padding-left: .3em;
  /* margin-top: .3em; */
  width: calc(100% - 15.5em);
  height: calc(100vh - 9em);
  overflow-y: auto;
}
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
