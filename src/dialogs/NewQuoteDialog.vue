<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { appProspectStore } from '@/stores/ProspectStore';
const prospStore = appProspectStore()
import { QuoteStore } from '@/stores/QuoteStore';
const quoteStore = QuoteStore()
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import BIcon from '@/components/B/BIcon.vue';
import { ref } from 'vue';
const emit = defineEmits(["continue","abort"])

const effdatRef = ref()

const props = defineProps({
  popupid: { // For confirm popover
    type: String,
    required: true
  },
  qtype: { // For confirm popover
    type: String,
    required: false,
    default: 'MED',
  },
  // rlob: { // For confirm popover
  //   type: String,
  //   required: false,
  //   default: ''
  // },
})

const doContinue = () => {
  emit("continue")
}

const getRlobList = async () => {
  const savedRlob = quoteStore.quote.rlob
  await quoteStore.getRLOBList(prospStore.prospect.id)
  if (quoteStore.quote && props.qtype) {
    // console.dir(quoteStore.rlobList)
    const list = quoteStore.rlobList[props.qtype]
    if (list.includes(savedRlob)) {
      quoteStore.quote.rlob = savedRlob
    } else if (list.length == 1) {
      quoteStore.quote.rlob = list[0]
    } else {
      quoteStore.quote.rlob = ''
    }
  }
}

</script>

<template>
  <dialog :id="popupid">
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
          <select :ref="effdatRef" v-model="quoteStore.quote.effdat" @change="getRlobList()">
            <option v-for="n in quoteStore.number_of_effdates" :key="n" :value="B.firstOfMonth(n+quoteStore.initial_effdate_offset)">{{ B.format.effdat(B.firstOfMonth(n+quoteStore.initial_effdate_offset)) }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>Funding:</th>
        <td>
          <label><input @click="getRlobList()" type="radio" name="funding_option" value="FI" v-model="quoteStore.quote.funding"> Fully Insured</label>&nbsp;&nbsp;
          <label><input @click="getRlobList()" type="radio" name="funding_option" value="ASO" v-model="quoteStore.quote.funding"> ASO</label>&nbsp;&nbsp;
          <label><input @click="getRlobList()" type="radio" name="funding_option" value="BF" v-model="quoteStore.quote.funding"> Balanced</label>
        </td>
      </tr>
      <tr>
        <th>Grandfathered:</th>
        <td><label><input @click="getRlobList()" type="checkbox" v-model="quoteStore.quote.grandfathered"> <span class='mini info'
          >({{quoteStore.quote.grandfathered ? 'ONLY' : 'NO'}} Grandfathered plans)</span></label></td>
      </tr>
      <tr>
        <th>Massachusetts:</th>
        <td><label><input @click="getRlobList()" type="checkbox" v-model="quoteStore.quote.mass_compliant"> <span class='mini info'
          >({{quoteStore.quote.mass_compliant ? 'ONLY' : 'NO' }} Massachusetts Compliant plans)</span></label></td>
      </tr>
      <tr class="line-top" v-if="props.qtype">
        <th :style="{color: quoteStore.quote.rlob == '' ? 'red': ''}">Product:</th>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0; height: 7.5em;">
            <span v-if="quoteStore.working"><div class="spinner"></div>{{ quoteStore.working }}</span>
            <span v-if="!quoteStore.working && quoteStore.rlobList[props.qtype].length == 0" class="warning">
              <BIcon icon="#goldenrod face-frown"/>No available product lines</span>
            <label v-for="(rlob) in quoteStore.rlobList[props.qtype]" :key="rlob">
              <input type="radio" name="rlob_option" v-model="quoteStore.quote.rlob" :value="rlob"> {{ B.codeToText.rlob(rlob) }}
            </label>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  </form>
  <div class="buttonbar">
    <BButton class="anchor" icon="#red solid x_" @click="emit('abort')">Cancel</BButton>&nbsp;
    <BButton
      :disabled="quoteStore.quote.effdat == ''
        || quoteStore.working != null
        || quoteStore.quote.descr == ''
        || quoteStore.quote.rlob == ''" class="modern" @click="doContinue()">Select Plans...</BButton>
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
.warning {
  color: goldenrod;
}
</style>
