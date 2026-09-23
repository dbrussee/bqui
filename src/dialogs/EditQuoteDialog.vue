<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { QuoteStore } from '@/stores/QuoteStore';
const quoteStore = QuoteStore()
import { appUserStore } from '@/stores/AppUserStore';
const userStore = appUserStore()
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
  <dialog :id="props.popupid">
  <div class="titlebar">Edit {{ B.codeToText.qtype(quoteStore.quote.qtype)}} Quote #{{ quoteStore.quote.id }}</div>
  <form @submit.stop.prevent="emit('save')">
    <table class="form-table">
      <tbody>
        <tr><th style="width:6.5em;">Created:</th><td colspan="3" class="info">{{ B.format.ts(quoteStore.quote.crttms) }} by {{ quoteStore.quote.crtusr }}</td></tr>
        <tr v-if="quoteStore.quote.crttms != quoteStore.quote.updtms || quoteStore.quote.crtusr != quoteStore.quote.updusr">
          <th>Updated:</th><td colspan="3" class="info">{{ B.format.ts(quoteStore.quote.updtms) }} by {{ quoteStore.quote.updusr }}</td>
        </tr>

        <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>

        <tr><th>Product:</th><td colspan="3" class="info">{{ B.codeToText.rlob(quoteStore.quote.rlob) }} ({{ quoteStore.quote.rlob }})</td></tr>
        <tr><th>Effective:</th><td class="info">{{ B.format.effdat(quoteStore.quote.effdat) }}</td>
            <th>Status:</th><td class="info">
              <BIcon :icon="B.statusIcon(quoteStore.quote.status)"/>{{ B.codeToText.quoteStatus(quoteStore.quote.status) }}
            </td></tr>
        <tr v-if="quoteStore.quote.status != 'INPROG'">
            <th>Design:</th><td class="info">{{ B.codeToText.nonstd(quoteStore.quote.nonstd) }}</td>
            <th>Funding:</th><td class="info">{{ B.codeToText.funding(quoteStore.quote.funding) }}</td></tr>
        <!-- <tr><th>Grandfathered:</th><td>Unknown</td></tr>
        <tr><th>Massachusetts:</th><td>Unknown</td></tr> -->

        <tr v-if="quoteStore.quote.status == 'INPROG'"><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>

        <!-- Non-In Progress Non-Editable plan coded-->
        <tr v-if="quoteStore.quote.status != 'INPROG' && quoteStore.quote.qtype == 'MED'">
          <th>Medical Plan:</th>
          <td class="info">{{ quoteStore.quote.med_plan}}</td>
          <th>Drug Plan:</th>
          <td class="info">{{ quoteStore.quote.dru_plan}}</td>
        </tr>
        <tr v-if="quoteStore.quote.status != 'INPROG' &&  quoteStore.quote.qtype == 'VIS'">
          <th>Vision Plan:</th>
          <td colspan="3" class="info">{{ quoteStore.quote.vis_plan}}</td>
        </tr>
        <tr v-if="quoteStore.quote.status != 'INPROG' &&  quoteStore.quote.qtype == 'DEN'">
          <th>Dental Plan:</th>
          <td colspan="3" class="info">{{ quoteStore.quote.den_plan}}</td>
        </tr>

        <tr>
          <th :style="{color:quoteStore.quote.descr == '' ? 'red' : ''}">Name:</th>
          <td colspan="3"><input v-model="quoteStore.quote.descr" style="width: 25em;" autofocus required></td>
        </tr>

        <!-- In Progress editable plan coded-->
        <tr v-if="quoteStore.quote.status == 'INPROG'">
          <th>Design:</th>
          <td colspan="3">
            <label><input type='radio' name="nonstd_value" v-model="quoteStore.quote.nonstd" value='N'> Standard</label>&nbsp;
            <label><input type='radio' name="nonstd_value" v-model="quoteStore.quote.nonstd" value='Y'> Non-Std</label>&nbsp;
            <label><input type='radio' name="nonstd_value" v-model="quoteStore.quote.nonstd" value='C'> Custom</label>
          </td>
        </tr>
        <tr v-if="quoteStore.quote.status == 'INPROG'">
          <th>Funding:</th>
          <td colspan="3">
            <label><input type="radio" name="funding_option" value="FI" v-model="quoteStore.quote.funding"> Fully Insured</label>&nbsp;&nbsp;
            <label><input type="radio" name="funding_option" value="ASO" v-model="quoteStore.quote.funding"> ASO</label>&nbsp;&nbsp;
            <label><input type="radio" name="funding_option" value="BF" v-model="quoteStore.quote.funding"> Balanced</label>
          </td>
        </tr>
        <tr v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.qtype == 'MED'">
          <th :style="{color:!quoteStore.quote.med_plan ? 'red' : ''}">Medical Plan:</th>
          <td><input v-model="quoteStore.quote.med_plan" style="width: 7em;" maxlength="7" required></td>
          <th :style="{color:!quoteStore.quote.dru_plan ? 'red' : ''}">Drug Plan:</th>
          <td><input v-model="quoteStore.quote.dru_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
        <tr v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.qtype == 'DEN'">
          <th :style="{color:!quoteStore.quote.den_plan ? 'red' : ''}">Dental Plan:</th>
          <td colspan="3"><input v-model="quoteStore.quote.den_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
        <tr v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.qtype == 'VIS'">
          <th :style="{color:!quoteStore.quote.vis_plan ? 'red' : ''}">Vision Plan:</th>
          <td colspan="3"><input v-model="quoteStore.quote.vis_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
      </tbody>
    </table>
  </form>
  <div class="buttonbar">
    <BConfirm v-if="quoteStore.quote.status == 'INPROG'" style="float: left;" class="anchor" gapright @confirm="emit('delete')"
      pos="T2R"
      tabindex="-1"
      heading="Permanently Delete Quote"
      icon="trash-can_">Delete...
      <template #message>
        Since this quote has a status of 'In Progress',
        you are allowed to permanently delete it. However:
        <span style="color: red">NOTE: This action cannot be undone!</span>
        <p>Are you sure you want to delete this quote?</p>
      </template>
    </BConfirm>
    <BConfirm v-if="userStore.getUserRightValue('FORCE_INPROG') == 'Y' && quoteStore.quote.status != 'INPROG'" style="float:left;" class="anchor" gapright pos="T2R" @confirm="emit('force')">π
      <template #message>
        <div class="titlebar">Force quote #{{quoteStore.quote?.id}} to 'In Progress' status?</div>
        <BIcon icon="#red solid octagon_"/><b style="color: red;">This is not something typically done.</b>
        <p>Please be sure you are clear that any documents seen by a prospect and possibly rated
        may no longer be valid if you change plans or any other features of the quote.</p>
      </template>
    </BConfirm>

    <BButton class="anchor" icon="#red solid x_" @click="emit('abort')">Cancel</BButton>&nbsp;
    <BButton
      :class="quoteStore.quote.status == 'INPROG' ? 'anchor' : 'modern'"
      icon="floppy-disk_"
      @click="emit('save')"
      :disabled="quoteStore.working != null || quoteStore.quote.descr == ''">Save Changes</BButton>&nbsp;
    <BConfirm v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.nonstd == 'N'"
      class="modern"
      icon="solid share_"
      heading="Submit Standard Quote"
      pos="T"
      :disabled="quoteStore.working != null"
      @confirm="emit('submit')">Submit?
      <template #message>
        After submitting this quote, you will no longer be able to edit anything other than the name.
      </template>
    </BConfirm>
    <BConfirm v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.nonstd == 'Y'"
      class="modern"
      icon="solid coins_"
      heading="Non-Standard Quote Submission"
      pos="T"
      :disabled="quoteStore.working != null"
      @confirm="emit('submit')">Request Rates?
      <template #message>
        After requesting rates for this quote, you will no longer be able to edit anything other than the name.
        <p>Once rates are available, the quote will move to Ready status.</p>
      </template>
    </BConfirm>
    <BConfirm v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.nonstd == 'C'"
      class="modern"
      icon="solid user-check_"
      heading="Custom Quote Submission"
      pos="T"
      :disabled="quoteStore.working != null"
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
