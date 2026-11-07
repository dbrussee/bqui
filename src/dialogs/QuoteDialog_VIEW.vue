<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { inject, useId, ref } from 'vue'
import type { Ref } from 'vue'
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import BIcon from '@/components/B/BIcon.vue';
import type { Iquote } from '@/types';
import { appProspectStore } from '@/stores/ProspectStore';
const pStore = appProspectStore()
import { proposalStore } from '@/stores/ProposalStore.ts';
const ppStore = proposalStore()
if (!ppStore.proposaldata) ppStore.proposaldata = {}
import { appUserStore } from '@/stores/AppUserStore';
const uStore = appUserStore()
import BTable from '@/components/B/BTable.vue';
import BPrompt from '@/components/B/BPrompt.vue';

// import ViewQuotePlanDetails from './ViewQuotePlanDetails.vue';
const localQuote = inject<Ref<Iquote> | null>('sharedLocalQuote', null)

const emit = defineEmits<{
  (e: 'name', payload: Iquote): void
  (e: 'force', payload: Iquote): void
  (e: 'close'): void
}>()


const updateQuoteName = (newName:string) => {
  if (!localQuote) return
  localQuote.value.descr = newName
  emit('name', localQuote.value)
}

const cfgProposals = ref({
  onPick: async (row:any) => {
    if (!localQuote) return
    if (localQuote.value.status == 'EXPIRED') return
    // const eff = B.format.dateMMDDYYYY(localQuote.value.effdat);
    const hasQuote = row.quotes.some((q:Iquote) => {
      return q.id == localQuote?.value.id
    })
    // console.log(hasQuote)
    if (hasQuote) {
      await ppStore.removeQuote(row.id, localQuote.value.id)
    } else {
      await ppStore.addQuote(row.id, localQuote.value.id)
    }
  },
  heading: "Proposals Containing This Quote",
  height: "10em",
  pickedRow: null as any,
  // pickedRowNumber: -1,
  no_rows_text: 'No Proposals for this Effective Date',
  columns: [
    // { id: "id", heading: "ID", width: "4em", flags: "R" },
    { id: "hasQuote", heading: "", width: "3em", flags: "R" },
    { id: "descr", heading: "Proposal Name", width: "35em" },
    { id: "status", heading: "Proposal Status", width: "11em" },
  ]
})
const proposalsHandler = {
  popid: useId(),
  open: function() { B.popup.showModal(this.popid) },
  close: function() { B.popup.close(this.popid) },
  createProposal: function(newname:string) {
    if (!localQuote) return
    if (!pStore.prospect) return
    const eff = B.format.dateMMDDYYYY(localQuote.value.effdat)
    if (!newname) {
      newname = B.format.effdat(localQuote.value.effdat) + " Proposal"
      if (ppStore.proposaldata) {
        if (ppStore.proposaldata[eff]) { // Find the eff date
          if (ppStore.proposaldata[eff].length > 0) {
            newname += ` #${ppStore.proposaldata[eff].length + 1}`
          }
        }
      }
    }
    const formData = {
      prospect_id: pStore.prospect.id,
      effdat: eff,
      descr: newname
    }
    ppStore.createProposal(formData)
  }
}

// const proposalsList = computed(() => {
//   if (!localQuote) return []
//   const eff = localQuote.value.effdat
//   if (!ppStore.proposaldata) return []
//   if (!ppStore.proposaldata[eff]) return []
//   const list = [... ppStore.proposaldata[eff]]

//   return list
// })

// const handleSave = () => {
//   emit('save', localQuote!.value)
// }
const handleForce = () => {
  emit('force', localQuote!.value)
}

const formatStatusCell = (row:any, setStyle:any) => {
  setStyle((td:HTMLTableCellElement) => {
    const classname = "status" + row.status
    td.classList.add(classname)
  })
  return B.codeToText.quoteStatus(row.status)
}
const getHasQuoteIcon = (row:any):string => {
  const hasQuote = row.quotes.some((q:Iquote) => {
    return q.id == localQuote?.value.id
  })
  // console.log(row.id, row.descr, hasQuote)
  if (hasQuote) {
    return '#green solid square-check'
  } else {
    return 'square'
  }
}

</script>

<template v-else><!-- Post-INPROG status of any kind -->
  <table class="form-table" style="width: 100%">
    <tbody>
      <tr v-if="localQuote.id >= 0">
        <th style="width:6.5em;">Started:</th>
        <td colspan="3" class="info">{{ B.format.ts(localQuote.crttms) }} by {{ localQuote.crtusr }}</td>
      </tr>
      <tr v-if="localQuote.id >= 0 && (localQuote.crttms != localQuote.updtms)">
        <th>Updated:</th>
        <td colspan="3" class="info">{{ B.format.ts(localQuote.updtms) }} by {{ localQuote.updusr }}</td>
      </tr>
      <tr v-if="localQuote.id >= 0"><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
      <tr><th>Prospect:</th><td colspan="3" class="info">{{ localQuote.prospect_name }} ({{ localQuote.prospect_id }})</td></tr>
      <tr><th>Agent:</th><td colspan="3" class="info">{{ localQuote.agent_fstnam + ' ' + localQuote.agent_lstnam }} ({{ localQuote.agent_id }})</td></tr>
      <tr><th>Product:</th><td colspan="3" class="info">{{ B.codeToText.rlob(localQuote.rlob) }} ({{ localQuote.rlob }})</td></tr>
      <tr>
        <th>Design:</th><td class="info">{{ B.codeToText.nonstd(localQuote.nonstd) }}</td>
        <th>Funding:</th><td class="info">{{ B.codeToText.funding(localQuote.funding) }}</td>
      </tr>
      <tr v-if="localQuote.qtype == 'MED'">
        <th>Medical Plan:</th><td class="info">{{ localQuote.med_plan }}</td>
        <th>Drug Plan:</th><td class="info">{{ localQuote.dru_plan }}</td>
      </tr>
      <tr v-if="localQuote.qtype == 'DEN'">
        <th>Dental Plan:</th><td colspan="3" class="info">{{ localQuote.den_plan }}</td>
      </tr>
      <tr v-if="localQuote.qtype == 'VIS'">
        <th>Vision Plan:</th><td colspan="3" class="info">{{ localQuote.vis_plan }}</td>
      </tr>
      <tr>
        <th :style="{color:localQuote.descr == '' ? 'red' : ''}">Name:</th>
        <td colspan="3">{{ localQuote.descr }}
          <BPrompt required @change="updateQuoteName" :text="localQuote.descr" prompt="Quote Name"/>
        </td>
      </tr>
      <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>

    </tbody>
  </table>

  <!-- <div class="titlebar">{{ B.format.effdat(localQuote?.effdat) }} Proposals Containing Quote #{{ localQuote?.id }}</div> -->
  <BTable :config="cfgProposals" :rows="ppStore.proposaldata[localQuote.effdat]">
    <template #column_status="{row, setStyle}">
      <BIcon :icon="B.statusIcon(row.status)">{{ formatStatusCell(row, setStyle) }}</BIcon>
    </template>
    <template #column_hasQuote="{row}">
      <BIcon :icon="getHasQuoteIcon(row)"/>
    </template>
    <template #footer>
      <span v-if="'EXPIRED,ENROLLED'.indexOf(localQuote.status) >= 0" class="info">
        Proposals cannot be modified with quote in {{B.codeToText.quoteStatus(localQuote.status)}} status</span>
      <BPrompt pos="T2R" v-else
        :disabled="localQuote?.prospect_id != pStore.prospect?.id"
        @change="proposalsHandler.createProposal($event)"
        prompt="Proposal Name"
        :placeholder="B.format.effdat(localQuote?.effdat) + ' Proposal'"
          >Create New Proposal</BPrompt>
    </template>
  </BTable>

  <div class="buttonbar">
    <BConfirm icon="solid backward-step" v-if="uStore.getUserRightValue('FORCE_INPROG') == 'Y'" style="float:left;" class="anchor" gapright pos="T2R" @confirm="handleForce">
      <template #message>
        <div class="titlebar">Force quote #{{localQuote.id}} to 'In Progress' status?</div>
        <BIcon icon="#red solid octagon_"/><b style="color: red;">This is not something typically done.</b>
        <p>Please be sure you are clear that any documents seen by a prospect and possibly rated
        may no longer be valid if you change plans or any other features of the quote.</p>
      </template>
    </BConfirm>
    <BButton class="anchor" icon="#red solid x_" @click="emit('close')">Close</BButton>&nbsp;
    <!-- <BButton v-if="!uStore.isUserReadOnly()"
      class="modern"
      icon="floppy-disk_"
      @click="handleSave"
      :disabled="qStore.working != null || localQuote.descr == ''">Save Changes</BButton>&nbsp; -->
  </div>

</template>
<style lang="css" scoped>
</style>
