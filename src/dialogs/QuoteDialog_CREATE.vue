<script setup lang="ts">
import { inject } from 'vue'
import type { Ref } from 'vue'
import { B } from '@/composables/BUtils';
import BButton from '@/components/B/BButton.vue';
import type { Iquote } from '@/types';
import { appUserStore } from '@/stores/AppUserStore';
const uStore = appUserStore()
import { QuoteStore } from '@/stores/QuoteStore';
const qStore = QuoteStore()
import { appProspectStore } from '@/stores/ProspectStore';
const pStore = appProspectStore()
import BIcon from '@/components/B/BIcon.vue';
const localQuote = inject<Ref<Iquote> | null>('sharedLocalQuote', null)

  const emit = defineEmits<{
  (e: 'continue', payload: Iquote): void
  (e: 'close'): void
}>()

const getRlobList = async () => {
  if (!pStore.prospect) return
  if (!localQuote?.value) return
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

const handleContinue = () => {
  emit('continue', localQuote!.value)
}

</script>
<template v-if="localQuote && effdatRef">
  <table class="form-table" style="width: 100%">
    <tbody>
      <tr><td colspan="4"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
      <tr>
        <th :style="{color:localQuote.descr == '' ? 'red' : ''}">Name:</th>
        <td colspan="3"><input :readonly="uStore.isUserReadOnly()" v-model="localQuote.descr" style="width: 25em;" autofocus required></td>
      </tr>
      <tr>
        <th :style="{color: localQuote.effdat ? '': 'red'}">Effective:</th>
        <td>
          <select v-model="localQuote.effdat" @change="getRlobList()">
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
              <BIcon icon="#red face-frown_"/>There are no available product lines for the selected options.
                Try again with different Effective date, Funding, Grandfathered or Massachussetts Compliance options.
            </span>
            <label v-for="(rlob) in qStore.rlobList[localQuote.qtype]" :key="rlob">
              <input type="radio" name="rlob_option" v-model="localQuote.rlob" :value="rlob"> {{ B.codeToText.rlob(rlob) }}
            </label>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="buttonbar">
    <BButton class="anchor" icon="#red solid x_" @click="emit('close')">Close</BButton>&nbsp;
    <BButton
      :disabled="localQuote.effdat == null
        || qStore.working != null
        || localQuote.descr == ''
        || localQuote.rlob == ''" class="modern" @click="handleContinue">Select Plans...</BButton>
  </div>

</template><style lang="css" scoped>
</style>
