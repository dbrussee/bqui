<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { inject } from 'vue'
import type { Ref } from 'vue'
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import BPrompt from '@/components/B/BPrompt.vue';
import ViewQuotePlanDetails from './ViewQuotePlanDetails.vue';
import type { Iquote } from '@/types';
import { appUserStore } from '@/stores/AppUserStore';
const uStore = appUserStore()
import { QuoteStore } from '@/stores/QuoteStore';
const qStore = QuoteStore()
const localQuote = inject<Ref<Iquote> | null>('sharedLocalQuote', null)
const getPlansAndAttributes = inject('sharedGetPlansAndAttributes')
const quotePlans = inject('sharedQuotePlans') as any
const quoteAttrs = inject('sharedQuoteAttrs') as any
const allPlans = inject('sharedAllPlans') as any


const emit = defineEmits<{
  (e: 'save', payload: Iquote): void
  (e: 'delete'): void
  (e: 'submit', payload: Iquote): void
  (e: 'close'): void
}>()


const updateQuoteName = (newName:string) => {
  if (!localQuote) return
  localQuote.value.descr = newName
}

const handleSave = () => {
  emit('save', localQuote!.value)
}

const getPlancodeDetails = (qtype:string, plncod:string):any => {
  if (!localQuote) return {}
  if (!allPlans.value) return {}
  const plans = allPlans.value[qtype]
  if (!plans) return {}
  const plan = plans.find((p:any) => {
    return p.plncod == plncod
  })
  if (!plan) return {}
  // console.dir(plan.attributes)
  return plan
}

</script>

<template v-else-if="localQuote.status == 'INPROG'">
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

      <tr><th>Funding:</th><td colspan="3" class="info">{{ B.codeToText.funding(localQuote.funding) }}</td></tr>
      <tr>
        <th :style="{color:localQuote.descr == '' ? 'red' : ''}">Name:</th>
        <td colspan="3">{{ localQuote.descr }}
          <BPrompt required @change="updateQuoteName" :text="localQuote.descr" prompt="Quote Name"/>
        </td>
      </tr>
      <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
      <tr>
        <th>Design:</th>
        <td colspan="3">
          <label><input @click="getPlansAndAttributes()" :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="localQuote.nonstd" value='N'> Standard</label>&nbsp;
          <label><input @click="getPlansAndAttributes()" :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="localQuote.nonstd" value='Y'> Non-Std</label>&nbsp;
          <label><input @click="getPlansAndAttributes()" :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="localQuote.nonstd" value='C'> Custom</label>
        </td>
      </tr>
      <tr v-if="localQuote.qtype == 'MED'">
        <th :style="{color:!localQuote.med_plan ? 'red' : ''}">Medical Plan:</th>
        <td>
          <select :readonly="uStore.isUserReadOnly()" v-model="localQuote.med_plan" style="width: 7em;" required>
            <option value="M_NOPLN" style="color:red;">No Plan</option>
            <option v-for="plan in qStore.planList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
          </select>
        </td>
        <th :style="{color:!localQuote.dru_plan ? 'red' : ''}">Drug Plan:</th>
        <td>
          <select :readonly="uStore.isUserReadOnly()" v-model="localQuote.dru_plan" style="width: 7em;" required>
            <option value="R_NOPLN" style="color:red;">No Plan</option>
            <option v-for="plan in qStore.drugPlanList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
          </select>
        </td>
      </tr>
      <tr v-if="localQuote.qtype == 'DEN'">
        <th :style="{color:!localQuote.den_plan ? 'red' : ''}">Dental Plan:</th>
        <td colspan="3">
          <select :readonly="uStore.isUserReadOnly()" v-model="localQuote.den_plan" style="width: 7em;" required>
            <option value="D_NOPLN" style="color:red;">No Plan</option>
            <option v-for="plan in qStore.planList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
          </select>
        </td>
      </tr>
      <tr v-if="localQuote.qtype == 'VIS'">
        <th :style="{color:!localQuote.vis_plan ? 'red' : ''}">Vision Plan:</th>
        <td colspan="3">
          <select :readonly="uStore.isUserReadOnly()" v-model="localQuote.den_plan" style="width: 7em;" required>
            <option value="D_NOPLN" style="color:red;">No Plan</option>
            <option v-for="plan in qStore.planList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
          </select>
        </td>
      </tr>
      <tr><td colspan="4">
        <div class="planlist">
          <template v-if="localQuote.qtype == 'MED'">
            <ViewQuotePlanDetails
              family="MED"
              :quote="localQuote"
              :attrs="quoteAttrs.MED || []"
              :plncod="localQuote.med_plan"
              :details="getPlancodeDetails('MED', localQuote.med_plan) || {}"></ViewQuotePlanDetails>
            <ViewQuotePlanDetails
              family="DRU"
              :quote="localQuote"
              :attrs="quoteAttrs.DRU || []"
              :plncod="localQuote.dru_plan"
              :details="quotePlans[localQuote.dru_plan] || {}"></ViewQuotePlanDetails>
          </template>
          <ViewQuotePlanDetails v-if="localQuote.qtype == 'DEN' && quoteAttrs && quotePlans"
            family="DEN"
            :quote="localQuote"
            :attrs="quoteAttrs.DEN || []"
            :plncod="localQuote.den_plan"
            :details="quotePlans[localQuote.den_plan] || {}"></ViewQuotePlanDetails>
          <ViewQuotePlanDetails v-if="localQuote.qtype == 'VIS' && quoteAttrs && quotePlans"
            family="VIS"
            :quote="localQuote"
            :attrs="quoteAttrs.VIS || []"
            :plncod="localQuote.vis_plan"
            :details="quotePlans[localQuote.vis_plan] || {}"></ViewQuotePlanDetails>
        </div>
      </td></tr>
    </tbody>
  </table>

  <div class="buttonbar">
    <BConfirm v-if="uStore.getUserRightValue('QUOTE_DELETE') == 'Y'" style="float: left;" class="anchor" gapright @confirm="emit('delete')"
      pos="T2R"
      :disabled="uStore.isUserReadOnly()"
      tabindex="-1"
      heading="Permanently Delete Quote"
      icon="trash-can_">
      <template #message>
        Since this quote has a status of 'In Progress',
        you are allowed to permanently delete it. However:
        <span style="color: red">NOTE: This action cannot be undone!</span>
        <p>Are you sure you want to delete this quote?</p>
      </template>
    </BConfirm>

    <BButton class="anchor" icon="#red solid x_" @click="emit('close')">Close</BButton>&nbsp;
    <BButton v-if="!uStore.isUserReadOnly()"
      :class="localQuote.status == 'INPROG' ? 'anchor' : 'modern'"
      icon="floppy-disk_"
      @click="handleSave"
      :disabled="qStore.working != null || localQuote.descr == ''">Save Changes</BButton>&nbsp;
    <BConfirm v-if="localQuote.nonstd == 'N' && !uStore.isUserReadOnly()"
      class="modern"
      icon="solid share_"
      heading="Submit Standard Quote"
      pos="T"
      :disabled="qStore.working != null"
      @confirm="emit('submit', localQuote)">Submit?
      <template #message>
        After submitting this quote, you will be asked to select Proposals to link the quote to.
      </template>
    </BConfirm>
    <BConfirm v-if="localQuote.nonstd == 'Y' && !uStore.isUserReadOnly()"
      class="modern"
      icon="solid coins_"
      heading="Non-Standard Quote Submission"
      pos="T"
      :disabled="qStore.working != null"
      @confirm="emit('submit', localQuote)">Request Rates?
      <template #message>
        <p>After requesting rates for this quote, you will be asked to select Proposals to link the quote to.</p>
        <p>Once rates are available, the quote will move to Ready status.</p>
      </template>
    </BConfirm>
    <BConfirm v-if="localQuote.nonstd == 'C' && !uStore.isUserReadOnly()"
      class="modern"
      icon="solid user-check_"
      heading="Custom Quote Submission"
      pos="T"
      :disabled="qStore.working != null"
      @confirm="emit('submit', localQuote)">Request Approval?
      <template #message>
        <p>After submitting this quote for approval, you will be asked to select Proposals to link the quote to.</p>
        <p>When the quote is approved and rates are available, the quote will move to Ready status.</p>
      </template>
    </BConfirm>
</div>

</template>

<style lang="css" scoped>
.planlist {
  height: calc(100vh - 24em);
  width: 100%;
  overflow-y: scroll;
}
</style>
