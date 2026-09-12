<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { QuoteStore } from '@/stores/QuoteStore';
const quoteStore = QuoteStore()
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
const emit = defineEmits(["save","delete","abort"])
import BConfirm from '@/components/B/BConfirm.vue';
</script>

<template>
  <div class="titlebar">Edit {{ B.codeToText.nonstd(quoteStore.quote.nonstd) }} {{ B.codeToText.qtype(quoteStore.quote.qtype)}} Quote #{{ quoteStore.quote.id }}</div>
  <form>
    <table class="form-table">
      <tbody>
        <tr><th style="width:6.5em;">Created:</th><td class="info">{{ B.format.ts(quoteStore.quote.crttms) }} by {{ quoteStore.quote.crtusr }}</td></tr>
        <tr v-if="quoteStore.quote.crttms != quoteStore.quote.updtms || quoteStore.quote.crtusr != quoteStore.quote.updusr">
          <th>Updated:</th><td class="info">{{ B.format.ts(quoteStore.quote.updtms) }} by {{ quoteStore.quote.updusr }}</td>
        </tr>

        <tr><td colspan="2"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>

        <tr><th>Effective:</th><td class="info">{{ B.format.effdat(quoteStore.quote.effdat) }}</td></tr>
        <tr><th>Staus:</th><td class="info">{{ B.codeToText.quoteStatus(quoteStore.quote.status) }}</td></tr>
        <tr><th>Funding:</th><td class="info">{{ B.codeToText.funding(quoteStore.quote.funding) }}</td></tr>
        <!-- <tr><th>Grandfathered:</th><td>Unknown</td></tr>
        <tr><th>Massachusetts:</th><td>Unknown</td></tr> -->
        <tr><th>Product:</th><td class="info">{{ quoteStore.rlobs[quoteStore.quote.rlob].descr }} ({{ quoteStore.quote.rlob }})</td></tr>

        <tr><td colspan="2"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>

        <tr>
          <th><b v-if="quoteStore.quote.descr == ''" style="color: red;">* </b>Name:</th>
          <td><input v-model="quoteStore.quote.descr" style="width: 25em;" autofocus required></td>
        </tr>

        <tr v-if="quoteStore.quote.status != 'INPROG'">
          <th>Design:</th>
          <td class="info">{{ B.codeToText.nonstd(quoteStore.quote.nonstd) }}</td>
        </tr>
        <!-- Non-In Progress Non-Editable plan coded-->
        <tr v-if="quoteStore.quote.status != 'INPROG' && quoteStore.quote.qtype == 'MED'">
          <th>MED Plan:</th>
          <td class="info">{{ quoteStore.quote.med_plan}}</td>
        </tr>
        <tr v-if="quoteStore.quote.status != 'INPROG' &&  quoteStore.quote.qtype == 'MED'">
          <th>DRU Plan:</th>
          <td class="info">{{ quoteStore.quote.dru_plan}}</td>
        </tr>
        <tr v-if="quoteStore.quote.status != 'INPROG' &&  quoteStore.quote.qtype == 'VIS'">
          <th>VIS Plan:</th>
          <td class="info">{{ quoteStore.quote.vis_plan}}</td>
        </tr>
        <tr v-if="quoteStore.quote.status != 'INPROG' &&  quoteStore.quote.qtype == 'DEN'">
          <th>DEN Plan:</th>
          <td class="info">{{ quoteStore.quote.den_plan}}</td>
        </tr>

        <!-- In Progress editable plan coded-->
        <tr v-if="quoteStore.quote.status == 'INPROG'">
          <th>Design:</th>
          <td>
            <label><input type='radio' name="nonstd_value" v-model="quoteStore.quote.nonstd" value='N'> Standard</label>&nbsp;
            <label><input type='radio' name="nonstd_value" v-model="quoteStore.quote.nonstd" value='Y'> Non-Std</label>&nbsp;
            <label><input type='radio' name="nonstd_value" v-model="quoteStore.quote.nonstd" value='C'> Custom</label>
          </td>
        </tr>
        <tr v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.qtype == 'MED'">
          <th><b v-if="!quoteStore.quote.med_plan" style="color: red;">* </b>MED Plan:</th>
          <td><input v-model="quoteStore.quote.med_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
        <tr v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.qtype == 'MED'">
          <th><b v-if="!quoteStore.quote.dru_plan" style="color: red;">* </b>DRU Plan:</th>
          <td><input v-model="quoteStore.quote.dru_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
        <tr v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.qtype == 'DEN'">
          <th><b v-if="!quoteStore.quote.den_plan" style="color: red;">* </b>DEN Plan:</th>
          <td><input v-model="quoteStore.quote.den_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
        <tr v-if="quoteStore.quote.status == 'INPROG' && quoteStore.quote.qtype == 'VIS'">
          <th><b v-if="!quoteStore.quote.vis_plan" style="color: red;">* </b>VIS Plan:</th>
          <td><input v-model="quoteStore.quote.vis_plan" style="width: 7em;" maxlength="7" required></td>
        </tr>
      </tbody>
    </table>
  </form>
  <div class="buttonbar">
    <BConfirm v-if="quoteStore.quote.status == 'INPROG'" style="float: left;" class="anchor gapright" @confirm="emit('delete')"
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
    <BButton class="anchor" icon="#red solid x_" @click="emit('abort')">Cancel</BButton>&nbsp;
    <BButton @click="emit('save')" :disabled="quoteStore.quote.descr == ''" class="modern">Save</BButton>
  </div>
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
