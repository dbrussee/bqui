<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { QuoteStore } from '@/stores/QuoteStore';
const quoteStore = QuoteStore()
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import { ref } from 'vue';
const emit = defineEmits(["continue","abort"])

const effdatRef = ref()

const props = defineProps({
  id: { // For confirm popover
    type: String,
    required: true
  },
  qtype: { // For confirm popover
    type: String,
    required: false,
    default: 'MED',
  },
  rlob: { // For confirm popover
    type: String,
    required: false,
    default: ''
  },
})

const doContinue = () => {
  emit("continue")
}

</script>

<template>
  <dialog :id="id">
  <div class="titlebar">New {{ B.codeToText.qtype(props.qtype) }} Quote</div>
  <form @submit.stop.prevent="doContinue()">
  <table class="form-table">
    <tbody>
      <tr>
        <th :style="{color: quoteStore.quote.descr == '' ? 'red': ''}">Name:</th>
        <td><input v-model="quoteStore.quote.descr" style="width: 25em;" autofocus required></td>
      </tr>
      <tr>
        <th :style="{color: quoteStore.quote.effdat == '' ? 'red': ''}">Effective:</th>
        <td>
          <select :ref="effdatRef" v-model="quoteStore.quote.effdat">
            <option v-for="n in quoteStore.number_of_effdates" :key="n" :value="B.firstOfMonth(n+quoteStore.initial_effdate_offset)">{{ B.format.effdat(B.firstOfMonth(n+quoteStore.initial_effdate_offset)) }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>Funding:</th>
        <td>
          <label><input type="radio" name="funding_option" value="FI" v-model="quoteStore.quote.funding"> Fully Insured</label>&nbsp;&nbsp;
          <label><input type="radio" name="funding_option" value="ASO" v-model="quoteStore.quote.funding"> ASO</label>&nbsp;&nbsp;
          <label><input type="radio" name="funding_option" value="BF" v-model="quoteStore.quote.funding"> Balanced</label>
        </td>
      </tr>
      <tr>
        <th>Grandfathered:</th>
        <td><label><input type="checkbox" v-model="quoteStore.quote.grandfathered"> <span class='mini info'
          >({{quoteStore.quote.grandfathered ? 'ONLY' : 'NO'}} Grandfathered plans)</span></label></td>
      </tr>
      <tr>
        <th>Massachusetts:</th>
        <td><label><input type="checkbox" v-model="quoteStore.quote.mass_compliant"> <span class='mini info'
          >({{quoteStore.quote.mass_compliant ? 'ONLY' : 'NO' }} Massachusetts Compliant plans)</span></label></td>
      </tr>
      <tr class="line-top">
        <th :style="{color: quoteStore.quote.rlob == '' ? 'red': ''}">Product:</th>
        <td style="display: flex; flex-direction: column; gap: 0;">
          <label v-for="(rlob) in quoteStore.rlobList[quoteStore.quote.qtype]" :key="rlob">
            <input type="radio" name="rlob_option" v-model="quoteStore.quote.rlob" :value="rlob"> {{ B.codeToText.rlob(rlob) }}
          </label>
          <!-- <select v-model="quote.rlob" required>
            <option v-for="(rlob) in rloblist" :key="rlob.rlob"
              :value="rlob.rlob">{{rlob.descr}}</option>
          </select> -->
        </td>
      </tr>
    </tbody>
  </table>
  </form>
  <div class="buttonbar">
    <BButton class="anchor" icon="#red solid x_" @click="emit('abort')">Cancel</BButton>&nbsp;
    <BButton :disabled="quoteStore.quote.effdat == '' || quoteStore.quote.descr == '' || quoteStore.quote.rlob == ''" class="modern" @click="doContinue()">Select Plans...</BButton>
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
