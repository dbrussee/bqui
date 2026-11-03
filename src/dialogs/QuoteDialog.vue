<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { B } from '@/composables/BUtils';
import type { Iquote } from '@/types';
import { ref, watch, type PropType, provide } from 'vue';
import { QuoteStore } from '@/stores/QuoteStore';
const qStore = QuoteStore()
import BIcon from '@/components/B/BIcon.vue';
import QuoteDialog_CREATE from './QuoteDialog_CREATE.vue';
import QuoteDialog_INPROG from './QuoteDialog_INPROG.vue';
import QuoteDialog_VIEW from './QuoteDialog_VIEW.vue';

const emit = defineEmits<{
  (e: 'save', payload: Iquote): void
  (e: 'continue', payload: Iquote): void
  (e: 'delete'): void
  (e: 'submit', payload: Iquote): void
  (e: 'force', payload: Iquote): void
  (e: 'close'): void
}>()

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

// A new ref is needed so we can use v-model without
// affecting the passed in Quote. When the time right to
// do so, we will call methods to emit the changes back
// to the parent - or possibly just make the backend update
// calls directly?
const localQuote = ref(JSON.parse(JSON.stringify(props.quote)))
provide('sharedLocalQuote', localQuote)

const quotePlans = ref<any>({})
provide('sharedQuotePlans', quotePlans)
const quoteAttrs = ref<any>({MED:[], DRU:[], DEN:[], VIS:[]})
provide('sharedQuoteAttrs', quoteAttrs)
const allPlans = ref<any>({})
provide('sharedAllPlans', allPlans)
const getPlansAndAttributes = async () => {
  if (!localQuote.value) return
  // quotePlans.value = {}
  // quoteAttrs.value = {MED:[], DRU:[], DEN:[], VIS:[]}
  // Call the API to get details... This is async, so the
  // dialog will open with empty data (from above) and then
  // get populated after the async promise completes
  allPlans.value = await qStore.getPlanList(localQuote.value)
  const data = await qStore.getPlansForQuote(localQuote.value)
  quotePlans.value = data.plans || {}
  quoteAttrs.value = data.attrs || {MED:[], DRU:[], DEN:[], VIS:[]}
}
provide('sharedGetPlansAndAttributes', getPlansAndAttributes)

// Check if / when the parent quote changes
watch(() => props.quote, (newValue) => {
  if (!newValue) return // Nothing to set to
  if (!localQuote.value) { // No current... load it
    localQuote.value = newValue
  } else if (localQuote.value.id != newValue.id) { // New is different that old
    localQuote.value = newValue
  } else if (localQuote.value.status != newValue.status) { // Same ID, new status
    localQuote.value = newValue
  } else if (localQuote.value.nonstd != newValue.nonstd) { // Same ID, new status
    localQuote.value = newValue
  }
  // Always load new attributes
  if (localQuote.value.status != 'NEW') getPlansAndAttributes()

}, { deep: true })



const handleSave = (q:Iquote) => {
  localQuote.value = JSON.parse(JSON.stringify(q))
  emit('save', localQuote.value)
}
const handleSubmit = (q:Iquote) => {
  localQuote.value = JSON.parse(JSON.stringify(q))
  emit('submit', localQuote.value)
}
const handleForce = (q:Iquote) => {
  localQuote.value = JSON.parse(JSON.stringify(q))
  emit('force', localQuote.value)
}
const handleContinue = (q:Iquote) => {
  localQuote.value = JSON.parse(JSON.stringify(q))
  emit('continue', localQuote.value)
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
        >Edit {{ B.codeToText.qtype(localQuote.qtype)}} Quote #{{ localQuote.id }}&nbsp;&nbsp;&nbsp; Effective: {{ B.format.effdat(localQuote.effdat) }}</div>
      <div v-else
          class="titlebar"
        >Viewing {{ B.codeToText.qtype(localQuote.qtype)}} Quote #{{ localQuote.id }}&nbsp;&nbsp;&nbsp; Effective: {{ B.format.effdat(localQuote.effdat) }}</div>
      <div style="position: absolute; top: .5em; right: .5em;" class="info">
        Status: <BIcon :icon="B.statusIcon(localQuote.status)"/>{{ B.codeToText.quoteStatus(localQuote.status) }}
      </div>
      <!-- <form @submit.prevent="handleSave"> -->
        <QuoteDialog_CREATE v-if="localQuote.status == 'NEW'"
          @close="emit('close')"
          @continue="handleContinue" />
        <QuoteDialog_INPROG v-else-if="localQuote.status == 'INPROG'"
          @close="emit('close')"
          @delete="emit('delete')"
          @submit="handleSubmit"
          @save="handleSave" />
        <QuoteDialog_VIEW v-else
          @close="emit('close')"
          @force="handleForce"
          @save="handleSave" />
      <!-- </form> -->

  </div>
</dialog>

</template>

<style lang="css" scoped>
dialog {
  width: 40em;
  position: relative;
}
.planlist {
  height: calc(100vh - 22em);
  width: 100%;
  overflow-y: scroll;
}
</style>
