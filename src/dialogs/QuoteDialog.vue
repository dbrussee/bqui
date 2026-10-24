<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { B } from '@/composables/BUtils';
import type { Iquote } from '@/types';
import { ref, watch, toRaw, type PropType } from 'vue';
import { appUserStore } from '@/stores/AppUserStore';
const uStore = appUserStore()
import { QuoteStore } from '@/stores/QuoteStore';
const qStore = QuoteStore()
import { appProspectStore } from '@/stores/ProspectStore';
const pStore = appProspectStore()
import BIcon from '@/components/B/BIcon.vue';
import BButton from '@/components/B/BButton.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import ViewQuotePlanDetails from './ViewQuotePlanDetails.vue';

const emit = defineEmits<{
  (e: 'save', payload: Iquote): void
  (e: 'continue', payload: Iquote): void
  (e: 'delete'): void
  (e: 'submit', payload: Iquote): void
  (e: 'force', payload: Iquote): void
  (e: 'close'): void
}>()
// const emit = defineEmits([
//   (e: 'save', updatedQuote: Iquote): void,
// 'update:modelValue', 'save', 'close', 'continue', 'delete', 'submit', 'force'])
const effdatRef = ref()

const props = defineProps({
  popid: {
    type: String,
    required: true
  },
  quote: {
    type: Object as PropType<Iquote | null>,
    required: false,
    default: null
  }
})

const getRlobList = async () => {
  if (!pStore.prospect) return
  if (!localQuote.value) return
  const savedRlob = localQuote.value.rlob
  await qStore.getRLOBList(localQuote.value)
  // if (localQuote.value.qtype) {
    // console.dir(quoteStore.rlobList)
    const list = qStore.rlobList[localQuote.value.qtype]
    if (list.includes(savedRlob)) {
      localQuote.value.rlob = savedRlob
    } else if (list.length == 1) {
      localQuote.value.rlob = list[0]
    } else {
      localQuote.value.rlob = ''
    }
  // }
}

const quotePlans = ref<any>({})
const quoteAttrs = ref<any>({MED:[], DRU:[], DEN:[], VIS:[]})
const getPlansAndAttributes = () => {
  if (!localQuote.value) return
  quotePlans.value = {}
  quoteAttrs.value = {MED:[], DRU:[], DEN:[], VIS:[]}
  // Call the API to get details... This is async, so the
  // dialog will open with empty data (from above) and then
  // get populated after the async promise completes
  console.log("Getting plans and attribute")
  qStore.getPlanList(localQuote.value)
  qStore.getPlansForQuote(localQuote.value).then((data:any) => {
    quotePlans.value = data.resp.plans || {}
    quoteAttrs.value = data.resp.attrs || {MED:[], DRU:[], DEN:[], VIS:[]}
    console.log("Set plans and attributes")
  })
}


// A new ref is needed so we can use v-model without
// affecting the passed in Quote. When the time right to
// do so, we will call methods to emit the changes back
// to the parent - or possibly just make the backend update
// calls directly?
// structuredClone is used to make the local copy
const localQuote = ref(structuredClone(toRaw(props.quote)))
// Check if / when the parent quote changes
watch(() => props.quote, (newValue) => {
  console.log("Props quote watcher hit")
  localQuote.value = structuredClone(toRaw(newValue))
  if (localQuote.value && localQuote.value.status != 'NEW') {
    getPlansAndAttributes()
  }
}, { deep: true })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const saveChanges = () => {
  // emit('update:modelValue', structuredClone(localQuote.value))
}


</script>

<template>
    <dialog :id="props.popid">
    <div v-if="localQuote">
      <div v-if="localQuote.id < 0"
          class="titlebar"
        >New {{ B.codeToText.qtype(localQuote.qtype) }} Quote</div>
      <div v-else-if="localQuote.status == 'INPROG'"
          class="titlebar"
        >Edit {{ B.codeToText.qtype(localQuote.qtype)}} Quote #{{ localQuote.id }}</div>
      <div v-else
          class="titlebar"
        >Viewing {{ B.codeToText.qtype(localQuote.qtype)}} Quote #{{ localQuote.id }}</div>
      <div style="position: absolute; top: .5em; right: .5em;" class="info">
        Status: <BIcon :icon="B.statusIcon(localQuote.status)"/>{{ B.codeToText.quoteStatus(localQuote.status) }}
      </div>
      <form @submit.stop.prevent="emit('save', localQuote)">
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
            <tr v-if="localQuote.status != 'NEW'"><th>Product:</th><td colspan="3" class="info">{{ B.codeToText.rlob(localQuote.rlob) }} ({{ localQuote.rlob }})</td></tr>
            <tr v-if="localQuote.status != 'NEW'"><th>Effective:</th><td colspan="3" class="info">{{ B.format.effdat(localQuote.effdat) }}</td></tr>
            <template v-if="localQuote.status == 'NEW'">
              <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
              <tr>
                <th :style="{color:localQuote.descr == '' ? 'red' : ''}">Name:</th>
                <td colspan="3"><input :readonly="uStore.isUserReadOnly()" v-model="localQuote.descr" style="width: 25em;" autofocus required></td>
              </tr>
              <tr>
                <th :style="{color: localQuote.effdat ? '': 'red'}">Effective:</th>
                <td>
                  <select :ref="effdatRef" v-model="localQuote.effdat" @change="getRlobList()">
                    <option v-for="n in qStore.number_of_effdates" :key="n" :value="B.firstOfMonth(n+qStore.initial_effdate_offset)">{{ B.format.effdat(B.firstOfMonth(n+qStore.initial_effdate_offset)) }}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th>Funding:</th>
                <td colspan="3">
                  <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="FI" v-model="localQuote.funding"> Fully Insured</label>&nbsp;&nbsp;
                  <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="ASO" v-model="localQuote.funding"> ASO</label>&nbsp;&nbsp;
                  <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="BF" v-model="localQuote.funding"> Balanced</label>
                </td>
              </tr>
              <tr>
                <th>Grandfathered:</th>
                <td><label><input @click="getRlobList()" type="checkbox" v-model="localQuote.grandfathered"> <span class='mini info'
                  >({{localQuote.grandfathered ? 'ONLY' : 'NO'}} Grandfathered plans)</span></label></td>
              </tr>
              <tr>
                <th>Massachusetts:</th>
                <td><label><input @click="getRlobList()" type="checkbox" v-model="localQuote.mass_compliant"> <span class='mini info'
                  >({{localQuote.mass_compliant ? 'ONLY' : 'NO' }} Massachusetts Compliant plans)</span></label></td>
              </tr>
              <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
              <tr class="line-top">
                <th :style="{color: localQuote.rlob == '' ? 'red': ''}">Product:</th>
                <td>
                  <div style="display: flex; flex-direction: column; gap: 0; height: 7.5em;">
                    <span v-if="qStore.working"><div class="spinner"></div>{{ qStore.working }}</span>
                    <span v-if="!qStore.working && qStore.rlobList[localQuote.qtype].length == 0" class="warning">
                      <BIcon icon="#goldenrod face-frown_"/>No available product lines for the selected options.
                        Try with different effective date, Grandfathered or Massachussetts Compliance options.
                    </span>
                    <label v-for="(rlob) in qStore.rlobList[localQuote.qtype]" :key="rlob">
                      <input type="radio" name="rlob_option" v-model="localQuote.rlob" :value="rlob"> {{ B.codeToText.rlob(rlob) }}
                    </label>
                  </div>
                </td>
              </tr>

            </template>
            <template v-else-if="localQuote.status == 'INPROG'">
              <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
              <tr>
                <th :style="{color:localQuote.descr == '' ? 'red' : ''}">Name:</th>
                <td colspan="3"><input :readonly="uStore.isUserReadOnly()" v-model="localQuote.descr" style="width: 25em;" autofocus required></td>
              </tr>
              <tr>
                <th>Design:</th>
                <td colspan="3">
                  <label><input :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="localQuote.nonstd" value='N'> Standard</label>&nbsp;
                  <label><input :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="localQuote.nonstd" value='Y'> Non-Std</label>&nbsp;
                  <label><input :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="localQuote.nonstd" value='C'> Custom</label>
                </td>
              </tr>
              <tr>
                <th>Funding:</th>
                <td colspan="3">
                  <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="FI" v-model="localQuote.funding"> Fully Insured</label>&nbsp;&nbsp;
                  <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="ASO" v-model="localQuote.funding"> ASO</label>&nbsp;&nbsp;
                  <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="BF" v-model="localQuote.funding"> Balanced</label>
                </td>
              </tr>
              <tr v-if="localQuote.qtype == 'MED'">
                <th :style="{color:!localQuote.med_plan ? 'red' : ''}">Medical Plan:</th>
                <td>
                  <select :readonly="uStore.isUserReadOnly()" v-model="localQuote.med_plan" style="width: 7em;" required>
                    <option disabled value="M_NOPLN" style="color:red;">Select...</option>
                    <option v-for="plan in qStore.planList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
                  </select>
                </td>
                <th :style="{color:!localQuote.dru_plan ? 'red' : ''}">Drug Plan:</th>
                <td>
                  <select :readonly="uStore.isUserReadOnly()" v-model="localQuote.dru_plan" style="width: 7em;" required>
                    <option disabled value="R_NOPLN" style="color:red;">Select...</option>
                    <option v-for="plan in qStore.drugPlanList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
                  </select>
                </td>
              </tr>
              <tr v-if="localQuote.qtype == 'DEN'">
                <th :style="{color:!localQuote.den_plan ? 'red' : ''}">Dental Plan:</th>
                <td colspan="3">
                  <select :readonly="uStore.isUserReadOnly()" v-model="localQuote.den_plan" style="width: 7em;" required>
                    <option disabled value="D_NOPLN" style="color:red;">Select...</option>
                    <option v-for="plan in qStore.planList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
                  </select>
                </td>
              </tr>
              <tr v-if="localQuote.qtype == 'VIS'">
                <th :style="{color:!localQuote.vis_plan ? 'red' : ''}">Vision Plan:</th>
                <td colspan="3">
                  <select :readonly="uStore.isUserReadOnly()" v-model="localQuote.den_plan" style="width: 7em;" required>
                    <option disabled value="D_NOPLN" style="color:red;">Select...</option>
                    <option v-for="plan in qStore.planList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
                  </select>
                </td>
              </tr>

            </template>
            <template v-else><!-- Post-INPROG status of any kind -->
              <tr>
                  <th>Design:</th><td class="info">{{ B.codeToText.nonstd(localQuote.nonstd) }}</td>
                  <th>Funding:</th><td class="info">{{ B.codeToText.funding(localQuote.funding) }}</td></tr>
              <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
              <tr>
                <th :style="{color:localQuote.descr == '' ? 'red' : ''}">Name:</th>
                <td colspan="3"><input :readonly="uStore.isUserReadOnly()" v-model="localQuote.descr" style="width: 25em;" autofocus required></td>
              </tr>
              <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
              <tr><td colspan="4">
                <div class="planlist">
                  <template v-if="localQuote.qtype == 'MED' && quoteAttrs && quotePlans">
                    <ViewQuotePlanDetails
                      family="MED"
                      :quote="localQuote"
                      :attrs="quoteAttrs.MED || []"
                      :plncod="localQuote.med_plan"
                      :details="quotePlans[localQuote.med_plan] || {}"></ViewQuotePlanDetails>
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
            </template>

          </tbody>
        </table>
      </form>
      <div v-if="localQuote.status == 'NEW'" class="buttonbar">
        <BButton class="anchor" icon="#red solid x_" @click="emit('close')">Cancel</BButton>&nbsp;
        <BButton
          :disabled="localQuote.effdat == null
            || qStore.working != null
            || localQuote.descr == ''
            || localQuote.rlob == ''" class="modern" @click="emit('continue', localQuote)">Select Plans...</BButton>
      </div>
      <div v-else-if="localQuote.status == 'INPROG'" class="buttonbar">
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

        <BButton class="anchor" icon="#red solid x_" @click="emit('close')">Cancel</BButton>&nbsp;
        <BButton v-if="!uStore.isUserReadOnly()"
          :class="localQuote.status == 'INPROG' ? 'anchor' : 'modern'"
          icon="floppy-disk_"
          @click="emit('save', localQuote)"
          :disabled="qStore.working != null || localQuote.descr == ''">Save Changes</BButton>&nbsp;
        <BConfirm v-if="localQuote.nonstd == 'N' && !uStore.isUserReadOnly()"
          class="modern"
          icon="solid share_"
          heading="Submit Standard Quote"
          pos="T"
          :disabled="qStore.working != null"
          @confirm="emit('submit', localQuote)">Submit?
          <template #message>
            After submitting this quote, you will no longer be able to edit anything other than the name.
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
            After requesting rates for this quote, you will no longer be able to edit anything other than the name.
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
            After submitting this quote for approval, you will no longer be able to edit anything other than the name.
            <p>When the quote is approved and rates are available, the quote will move to Ready status.</p>
          </template>
        </BConfirm>
    </div>

    <div v-else class="buttonbar">
      <BConfirm icon="solid backward-step" v-if="uStore.getUserRightValue('FORCE_INPROG') == 'Y'" style="float:left;" class="anchor" gapright pos="T2R" @confirm="emit('force', localQuote)">
        <template #message>
          <div class="titlebar">Force quote #{{localQuote.id}} to 'In Progress' status?</div>
          <BIcon icon="#red solid octagon_"/><b style="color: red;">This is not something typically done.</b>
          <p>Please be sure you are clear that any documents seen by a prospect and possibly rated
          may no longer be valid if you change plans or any other features of the quote.</p>
        </template>
      </BConfirm>
      <BButton class="anchor" icon="#red solid x_" @click="emit('close')">Cancel</BButton>&nbsp;
      <BButton v-if="!uStore.isUserReadOnly()"
        class="modern"
        icon="floppy-disk_"
        @click="emit('save', localQuote)"
        :disabled="qStore.working != null || localQuote.descr == ''">Save Changes</BButton>&nbsp;
</div>
</div>
</dialog>
</template>

<style lang="css" scoped>
dialog {
  width: 35em;
  position: relative;
}
.planlist {
  height: calc(100vh - 22em);
  width: 100%;
  overflow-y: scroll;
}
</style>
