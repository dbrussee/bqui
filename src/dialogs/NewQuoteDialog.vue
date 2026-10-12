<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { appProspectStore } from '@/stores/ProspectStore';
const pStore = appProspectStore()
import { QuoteStore } from '@/stores/QuoteStore';
const qStore = QuoteStore()
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
  if (!pStore.prospect) return
  const savedRlob = qStore.quote.rlob
  await qStore.getRLOBList(pStore.prospect.id)
  if (qStore.quote && props.qtype) {
    // console.dir(quoteStore.rlobList)
    const list = qStore.rlobList[props.qtype]
    if (list.includes(savedRlob)) {
      qStore.quote.rlob = savedRlob
    } else if (list.length == 1) {
      qStore.quote.rlob = list[0]
    } else {
      qStore.quote.rlob = ''
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
        <th :style="{color: qStore.quote.descr == '' ? 'red': ''}">Name:</th>
        <td><input v-model="qStore.quote.descr" style="width: 25em;" autofocus required></td>
      </tr>
      <tr>
        <th :style="{color: qStore.quote.effdat ? '': 'red'}">Effective:</th>
        <td>
          <select :ref="effdatRef" v-model="qStore.quote.effdat" @change="getRlobList()">
            <option v-for="n in qStore.number_of_effdates" :key="n" :value="B.firstOfMonth(n+qStore.initial_effdate_offset)">{{ B.format.effdat(B.firstOfMonth(n+qStore.initial_effdate_offset)) }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <th>Funding:</th>
        <td>
          <label><input @click="getRlobList()" type="radio" name="funding_option" value="FI" v-model="qStore.quote.funding"> Fully Insured</label>&nbsp;&nbsp;
          <label><input @click="getRlobList()" type="radio" name="funding_option" value="ASO" v-model="qStore.quote.funding"> ASO</label>&nbsp;&nbsp;
          <label><input @click="getRlobList()" type="radio" name="funding_option" value="BF" v-model="qStore.quote.funding"> Balanced</label>
        </td>
      </tr>
      <tr>
        <th>Grandfathered:</th>
        <td><label><input @click="getRlobList()" type="checkbox" v-model="qStore.quote.grandfathered"> <span class='mini info'
          >({{qStore.quote.grandfathered ? 'ONLY' : 'NO'}} Grandfathered plans)</span></label></td>
      </tr>
      <tr>
        <th>Massachusetts:</th>
        <td><label><input @click="getRlobList()" type="checkbox" v-model="qStore.quote.mass_compliant"> <span class='mini info'
          >({{qStore.quote.mass_compliant ? 'ONLY' : 'NO' }} Massachusetts Compliant plans)</span></label></td>
      </tr>
      <tr class="line-top" v-if="props.qtype">
        <th :style="{color: qStore.quote.rlob == '' ? 'red': ''}">Product:</th>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0; height: 7.5em;">
            <span v-if="qStore.working"><div class="spinner"></div>{{ qStore.working }}</span>
            <span v-if="!qStore.working && qStore.rlobList[props.qtype].length == 0" class="warning">
              <BIcon icon="#goldenrod face-frown"/>No available product lines</span>
            <label v-for="(rlob) in qStore.rlobList[props.qtype]" :key="rlob">
              <input type="radio" name="rlob_option" v-model="qStore.quote.rlob" :value="rlob"> {{ B.codeToText.rlob(rlob) }}
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
      :disabled="qStore.quote.effdat == null
        || qStore.working != null
        || qStore.quote.descr == ''
        || qStore.quote.rlob == ''" class="modern" @click="doContinue()">Select Plans...</BButton>
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
