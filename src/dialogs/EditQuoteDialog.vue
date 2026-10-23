<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { QuoteStore } from '@/stores/QuoteStore';
const qStore = QuoteStore()
import { appUserStore } from '@/stores/AppUserStore';
const uStore = appUserStore()
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import BIcon from '@/components/B/BIcon.vue';

const emit = defineEmits(["save","delete","abort","submit","force"])


const props = defineProps({
  popupid: { // For confirm popover
    type: String,
    required: true
  },
})

</script>

<template>
  <dialog :id="props.popupid" style="position:relative">
  <div v-if="qStore.quote.id < 0" class="titlebar">Edit New {{ B.codeToText.qtype(qStore.quote.qtype)}} Quote</div>
  <div v-else class="titlebar">Edit {{ B.codeToText.qtype(qStore.quote.qtype)}} Quote #{{ qStore.quote.id }}</div>
  <div style="position: absolute; top: .5em; right: .5em;" class="info">
    Status: <BIcon :icon="B.statusIcon(qStore.quote.status)"/>{{ B.codeToText.quoteStatus(qStore.quote.status) }}
  </div>
  <form @submit.stop.prevent="emit('save')">
    <table class="form-table">
      <tbody>
        <template v-if="qStore.quote.id >= 0">
        <tr>
          <th style="width:6.5em;">Created:</th>
          <td colspan="3" class="info">{{ B.format.ts(qStore.quote.crttms) }} by {{ qStore.quote.crtusr }}</td>
        </tr>
        <tr v-if="qStore.quote.crttms != qStore.quote.updtms">
          <th>Updated:</th>
          <td colspan="3" class="info">{{ B.format.ts(qStore.quote.updtms) }} by {{ qStore.quote.updusr }}</td>
        </tr>

        <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
        </template>

        <tr><th>Prospect:</th><td colspan="3" class="info">{{ qStore.quote.prospect_name }} ({{ qStore.quote.prospect_id }})</td></tr>
        <tr><th>Product:</th><td colspan="3" class="info">{{ B.codeToText.rlob(qStore.quote.rlob) }} ({{ qStore.quote.rlob }})</td></tr>
        <tr><th>Effective:</th><td colspan="3" class="info">{{ B.format.effdat(qStore.quote.effdat) }}</td></tr>
        <tr v-if="qStore.quote.status != 'INPROG'">
            <th>Design:</th><td class="info">{{ B.codeToText.nonstd(qStore.quote.nonstd) }}</td>
            <th>Funding:</th><td class="info">{{ B.codeToText.funding(qStore.quote.funding) }}</td></tr>
        <!-- <tr><th>Grandfathered:</th><td>Unknown</td></tr>
        <tr><th>Massachusetts:</th><td>Unknown</td></tr> -->

        <tr v-if="qStore.quote.status == 'INPROG'"><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>

        <!-- Non-In Progress Non-Editable plan coded-->
        <tr v-if="qStore.quote.status != 'INPROG' && qStore.quote.qtype == 'MED'">
          <th>Medical Plan:</th>
          <td class="info">{{ qStore.quote.med_plan}}</td>
          <th>Drug Plan:</th>
          <td class="info">{{ qStore.quote.dru_plan}}</td>
        </tr>
        <tr v-if="qStore.quote.status != 'INPROG' &&  qStore.quote.qtype == 'VIS'">
          <th>Vision Plan:</th>
          <td colspan="3" class="info">{{ qStore.quote.vis_plan}}</td>
        </tr>
        <tr v-if="qStore.quote.status != 'INPROG' &&  qStore.quote.qtype == 'DEN'">
          <th>Dental Plan:</th>
          <td colspan="3" class="info">{{ qStore.quote.den_plan}}</td>
        </tr>

        <tr>
          <th :style="{color:qStore.quote.descr == '' ? 'red' : ''}">Name:</th>
          <td colspan="3"><input :readonly="uStore.isUserReadOnly()" v-model="qStore.quote.descr" style="width: 25em;" autofocus required></td>
        </tr>

        <!-- In Progress editable plan coded-->
        <tr v-if="qStore.quote.status == 'INPROG'">
          <th>Design:</th>
          <td colspan="3">
            <label><input :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="qStore.quote.nonstd" value='N'> Standard</label>&nbsp;
            <label><input :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="qStore.quote.nonstd" value='Y'> Non-Std</label>&nbsp;
            <label><input :disabled="uStore.isUserReadOnly()" type='radio' name="nonstd_value" v-model="qStore.quote.nonstd" value='C'> Custom</label>
          </td>
        </tr>
        <tr v-if="qStore.quote.status == 'INPROG'">
          <th>Funding:</th>
          <td colspan="3">
            <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="FI" v-model="qStore.quote.funding"> Fully Insured</label>&nbsp;&nbsp;
            <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="ASO" v-model="qStore.quote.funding"> ASO</label>&nbsp;&nbsp;
            <label><input :disabled="uStore.isUserReadOnly()" type="radio" name="funding_option" value="BF" v-model="qStore.quote.funding"> Balanced</label>
          </td>
        </tr>
        <tr v-if="qStore.quote.status == 'INPROG' && qStore.quote.qtype == 'MED'">
          <th :style="{color:!qStore.quote.med_plan ? 'red' : ''}">Medical Plan:</th>
          <td>
            <select :readonly="uStore.isUserReadOnly()" v-model="qStore.quote.med_plan" style="width: 7em;" maxlength="7" required>
              <option disabled value="M_NOPLN" style="color:red;">Select...</option>
              <option v-for="plan in qStore.planList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
            </select>
          </td>
          <th :style="{color:!qStore.quote.dru_plan ? 'red' : ''}">Drug Plan:</th>
          <td>
            <select :readonly="uStore.isUserReadOnly()" v-model="qStore.quote.dru_plan" style="width: 7em;" maxlength="7" required>
              <option disabled value="R_NOPLN" style="color:red;">Select...</option>
              <option v-for="plan in qStore.drugPlanList" :key="plan" :value="plan.plncod">{{ plan.plncod }}</option>
            </select>
          </td>
        </tr>
        <tr v-if="qStore.quote.status == 'INPROG' && qStore.quote.qtype == 'DEN'">
          <th :style="{color:!qStore.quote.den_plan ? 'red' : ''}">Dental Plan:</th>
          <td colspan="3"><input :readonly="uStore.isUserReadOnly()" v-model="qStore.quote.den_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
        <tr v-if="qStore.quote.status == 'INPROG' && qStore.quote.qtype == 'VIS'">
          <th :style="{color:!qStore.quote.vis_plan ? 'red' : ''}">Vision Plan:</th>
          <td colspan="3"><input :readonly="uStore.isUserReadOnly()" v-model="qStore.quote.vis_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
      </tbody>
    </table>
  </form>
  <div class="buttonbar">
    <BConfirm v-if="uStore.getUserRightValue('QUOTE_DELETE') == 'Y' && qStore.quote.status == 'INPROG'" style="float: left;" class="anchor" gapright @confirm="emit('delete')"
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
    <BConfirm v-if="uStore.getUserRightValue('FORCE_INPROG') == 'Y' && qStore.quote.status != 'INPROG'" style="float:left;" class="anchor" gapright pos="T2R" @confirm="emit('force')">π
      <template #message>
        <div class="titlebar">Force quote #{{qStore.quote?.id}} to 'In Progress' status?</div>
        <BIcon icon="#red solid octagon_"/><b style="color: red;">This is not something typically done.</b>
        <p>Please be sure you are clear that any documents seen by a prospect and possibly rated
        may no longer be valid if you change plans or any other features of the quote.</p>
      </template>
    </BConfirm>

    <BButton class="anchor" icon="#red solid x_" @click="emit('abort')">Cancel</BButton>&nbsp;
    <BButton v-if="!uStore.isUserReadOnly()"
      :class="qStore.quote.status == 'INPROG' ? 'anchor' : 'modern'"
      icon="floppy-disk_"
      @click="emit('save')"
      :disabled="qStore.working != null || qStore.quote.descr == ''">Save Changes</BButton>&nbsp;
    <BConfirm v-if="qStore.quote.status == 'INPROG' && qStore.quote.nonstd == 'N' && !uStore.isUserReadOnly()"
      class="modern"
      icon="solid share_"
      heading="Submit Standard Quote"
      pos="T"
      :disabled="qStore.working != null"
      @confirm="emit('submit')">Submit?
      <template #message>
        After submitting this quote, you will no longer be able to edit anything other than the name.
      </template>
    </BConfirm>
    <BConfirm v-if="qStore.quote.status == 'INPROG' && qStore.quote.nonstd == 'Y' && !uStore.isUserReadOnly()"
      class="modern"
      icon="solid coins_"
      heading="Non-Standard Quote Submission"
      pos="T"
      :disabled="qStore.working != null"
      @confirm="emit('submit')">Request Rates?
      <template #message>
        After requesting rates for this quote, you will no longer be able to edit anything other than the name.
        <p>Once rates are available, the quote will move to Ready status.</p>
      </template>
    </BConfirm>
    <BConfirm v-if="qStore.quote.status == 'INPROG' && qStore.quote.nonstd == 'C' && !uStore.isUserReadOnly()"
      class="modern"
      icon="solid user-check_"
      heading="Custom Quote Submission"
      pos="T"
      :disabled="qStore.working != null"
      @confirm="emit('submit')">Request Approval?
      <template #message>
        After submitting this quote for approval, you will no longer be able to edit anything other than the name.
        <p>When the quote is approved and rates are available, the quote will move to Ready status.</p>
      </template>
    </BConfirm>

  </div>
  </dialog>
</template>

<style lang="css" scoped>
tr.line-top {
  border-top: 1px solid black;
  margin-top: .2em;
  td {
    padding-top: .2em;
  }
}
</style>
