<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { type PropType } from 'vue';
import { appUserStore } from '@/stores/AppUserStore';
const uStore = appUserStore()
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import BIcon from '@/components/B/BIcon.vue';
import type { Iprospect } from '@/types/prospect';
import type { Iquote } from '@/types/quote'
import ViewQuotePlanDetails from './ViewQuotePlanDetails.vue';

const emit = defineEmits(["save","delete","abort","submit","force"])

const props = defineProps({
  popupid: { // For confirm popover
    type: String,
    required: true
  },
  prospect: {
    type: Object as PropType<Iprospect>,
    required: false
  },
  plans: {
    type: Object as any,
    required: false
  },
  attrs: {
    type: Object as any,
    required: false
  },
  quote: {
    type: Object as PropType<Iquote>,
    required: false
  }
})

</script>

<template>
  <dialog :id="props.popupid" v-if="props.quote" style="position:relative">
  <div class="titlebar">Quote #{{ props.quote?.id }}</div>
  <div style="position: absolute; top: .5em; right: .5em;" class="info">
    Status: <BIcon :icon="B.statusIcon(props.quote?.status)"/>{{ B.codeToText.quoteStatus(props.quote?.status) }}
  </div>
  <form @submit.stop.prevent="emit('save')">
    <table class="form-table" style="width: 35em;">
      <tbody>
        <tr>
          <th style="width:6.5em;">Created:</th>
          <td colspan="3" class="info">{{ B.format.ts(props.quote?.crttms) }} by {{ props.quote?.crtusr }}</td>
        </tr>
        <tr v-if="props.quote?.crttms != props.quote?.updtms">
          <th>Updated:</th>
          <td colspan="3" class="info">{{ B.format.ts(props.quote?.updtms) }} by {{ props.quote?.updusr }}</td>
        </tr>

        <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>

        <tr><th>Prospect:</th><td colspan="3" class="info">{{ props.quote?.prospect_name }} ({{ props.quote?.prospect_id }})</td></tr>
        <tr>
          <th :style="{color:props.quote?.descr == '' ? 'red' : ''}">Name:</th>
          <td colspan="3">{{ props.quote?.descr }}</td>
        </tr>
        <tr><th>Product:</th><td colspan="3" class="info">{{ B.codeToText.rlob(props.quote?.rlob) }} ({{ props.quote?.rlob }})</td></tr>
        <tr><th>Effective:</th><td colspan="3" class="info">{{ B.format.effdat(props.quote?.effdat) }}</td></tr>
        <tr>
            <th>Design:</th><td class="info">{{ B.codeToText.nonstd(props.quote?.nonstd) }}</td>
            <th>Funding:</th><td class="info">{{ B.codeToText.funding(props.quote?.funding) }}</td></tr>

        <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
      </tbody>
    </table>
  </form>
  <div class="planlist">
  <template v-if="props.quote?.qtype == 'MED' && props.attrs && props.plans">
    <ViewQuotePlanDetails
      family="MED"
      :quote="props.quote"
      :attrs="props.attrs.MED || []"
      :plncod="props.quote.med_plan"
      :details="props.plans[props.quote.med_plan] || {}"></ViewQuotePlanDetails>
    <ViewQuotePlanDetails
      family="DRU"
      :quote="props.quote"
      :attrs="props.attrs.DRU || []"
      :plncod="props.quote.dru_plan"
      :details="props.plans[props.quote.dru_plan] || {}"></ViewQuotePlanDetails>
  </template>
  <ViewQuotePlanDetails v-if="props.quote?.qtype == 'DEN' && props.attrs && props.plans"
    family="DEN"
    :quote="props.quote"
    :attrs="props.attrs.DEN || []"
    :plncod="props.quote.den_plan"
    :details="props.plans[props.quote.den_plan] || {}"></ViewQuotePlanDetails>
  <ViewQuotePlanDetails v-if="props.quote?.qtype == 'VIS' && props.attrs && props.plans"
    family="VIS"
    :quote="props.quote"
    :attrs="props.attrs.VIS || []"
    :plncod="props.quote.vis_plan"
    :details="props.plans[props.quote.vis_plan] || {}"></ViewQuotePlanDetails>
  </div>
  <div class="buttonbar">
    <BConfirm v-if="uStore.getUserRightValue('FORCE_INPROG') == 'Y'" style="float:left;" class="anchor" gapright pos="T2R" @confirm="emit('force')">π
      <template #message>
        <div class="titlebar">Force quote #{{props.quote?.id}} to 'In Progress' status?</div>
        <BIcon icon="#red solid octagon_"/><b style="color: red;">This is not something typically done.</b>
        <p>Please be sure you are clear that any documents seen by a prospect and possibly rated
        may no longer be valid if you change plans or any other features of the quote.</p>
      </template>
    </BConfirm>
    <BButton class="anchor" icon="#red solid x_" @click="emit('abort')">Cancel</BButton>&nbsp;
  </div>
  </dialog>
</template>

<style lang="css" scoped>
.planlist {
  position: relative;
  height: calc(100vh - 22em);
  width: 35em;
  overflow-y: scroll;

}

</style>
