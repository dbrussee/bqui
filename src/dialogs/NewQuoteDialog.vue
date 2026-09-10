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
  family: { // For confirm popover
    type: String,
    required: false,
    default: 'MED',
    validator(value: string) {
      return ['MED','DEN','VIS','WEL'].includes(value)
    }
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
  <div class="titlebar">New {{ B.codeToText.qtype(props.family) }} Quote</div>
  <form>
  <table class="form-table">
    <tbody>
      <tr>
        <th><b v-if="quoteStore.newQuoteOptions.name == ''" style="color: red;">* </b>Name:</th>
        <td><input v-model="quoteStore.newQuoteOptions.name" style="width: 25em;" autofocus required></td>
      </tr>
      <tr>
        <th><b v-if="quoteStore.newQuoteOptions.effdat == ''" style="color: red;">* </b>Effective:</th>
        <td>
          <select :ref="effdatRef" v-model="quoteStore.newQuoteOptions.effdat">
            <option v-for="n in quoteStore.number_of_effdates" :key="n" :value="B.firstOfMonth(n+quoteStore.initial_effdate_offset)">{{ B.format.effdat(B.firstOfMonth(n+quoteStore.initial_effdate_offset)) }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>Funding:</th>
        <td>
          <label><input type="radio" name="funding_option" value="FI" v-model="quoteStore.newQuoteOptions.funding"> Fully Insured</label>&nbsp;&nbsp;
          <label><input type="radio" name="funding_option" value="ASO" v-model="quoteStore.newQuoteOptions.funding"> ASO</label>&nbsp;&nbsp;
          <label><input type="radio" name="funding_option" value="BF" v-model="quoteStore.newQuoteOptions.funding"> Balanced</label>
        </td>
      </tr>
      <tr>
        <th>Grandfathered:</th>
        <td><label><input type="checkbox" v-model="quoteStore.newQuoteOptions.grandfathered"> <span class='mini info'
          >({{quoteStore.newQuoteOptions.grandfathered ? 'ONLY' : 'NO'}} Grandfathered plans)</span></label></td>
      </tr>
      <tr>
        <th>Massachusetts:</th>
        <td><label><input type="checkbox" v-model="quoteStore.newQuoteOptions.mass_compliant"> <span class='mini info'
          >({{quoteStore.newQuoteOptions.mass_compliant ? 'ONLY' : 'NO' }} Massachusetts Compliant plans)</span></label></td>
      </tr>
      <tr class="line-top">
        <th><b v-if="quoteStore.newQuoteOptions.rlob == ''" style="color: red;">* </b>Product:</th>
        <td style="display: flex; flex-direction: column; gap: 0;">
          <label v-for="(rlob) in quoteStore.rlobList[quoteStore.newQuoteOptions.family]" :key="rlob.rlob">
            <input type="radio" name="rlob_option" v-model="quoteStore.newQuoteOptions.rlob" :value="rlob.rlob"> {{ rlob.descr }}
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
    <BButton :disabled="quoteStore.newQuoteOptions.effdat == '' || quoteStore.newQuoteOptions.name == '' || quoteStore.newQuoteOptions.rlob == ''" class="modern" @click="doContinue()">Select Plans...</BButton>
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
