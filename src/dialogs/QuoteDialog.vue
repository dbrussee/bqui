<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { B } from '@/composables/BUtils';
import type { Iquote } from '@/types';
import { ref, watch, type PropType, provide } from 'vue';
import { QuoteStore } from '@/stores/QuoteStore';
const qStore = QuoteStore()
import { appProspectStore } from '@/stores/ProspectStore.ts';
const pStore = appProspectStore()
import { appUserStore } from '@/stores/AppUserStore.ts';
const uStore = appUserStore()
import BIcon from '@/components/B/BIcon.vue';
import QuoteDialog_CREATE from './QuoteDialog_CREATE.vue';
import QuoteDialog_INPROG from './QuoteDialog_INPROG.vue';
import QuoteDialog_VIEW from './QuoteDialog_VIEW.vue';

const emit = defineEmits<{
  (e: 'save', payload: Iquote): void
  (e: 'name', payload: Iquote): void
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

const internalHandler = {
  close: () => {
    emit('close')
  },
  save: async (q:Iquote) => {
    localQuote.value = JSON.parse(JSON.stringify(q))
    if (localQuote.value.id < 0) {
      qStore.quote = {...localQuote.value}
      const newQuote = await qStore.createQuote() as Iquote
      // useToast().addToast(`Quote ${q.id} created`, "success")
      emit('save', newQuote)
    } else {
      const updatedQuote = await qStore.updateQuote(localQuote.value) as Iquote
      if (updatedQuote) {
        qStore.quote = {...localQuote.value}
        pStore.refreshQuote(updatedQuote as Iquote)
        // useToast().addToast(`Quote ${q.id} saved`, "success")
        emit('save', updatedQuote)
      }
    }
  },
  continue: (q:Iquote) => {
    localQuote.value = JSON.parse(JSON.stringify(q))
    if (!uStore.user) return
    localQuote.value.status = 'INPROG'
    localQuote.value.crtusr = uStore.user.id
    localQuote.value.updusr = uStore.user.id
    getPlansAndAttributes()
  },
  force: async (q:Iquote) => {
    localQuote.value = JSON.parse(JSON.stringify(q))
    localQuote.value.status = 'INPROG'
    const updatedQuote = await qStore.updateQuote(localQuote.value)
    if (updatedQuote) {
      qStore.quote = {...localQuote.value}
      pStore.refreshQuote(updatedQuote as Iquote)
      emit('force', updatedQuote)
    }
  },
  submit: async (q:Iquote) => {
    localQuote.value = JSON.parse(JSON.stringify(q))
        switch(localQuote.value.nonstd) {
      case 'N':
        localQuote.value.status = 'READY'
        break
      case 'Y':
        localQuote.value.status = 'RATEREQ'
        break
      case 'C':
        localQuote.value.status = 'PENDING'
        break
    }
    if (localQuote.value.id < 0) {
      qStore.quote = {...localQuote.value}
      const newQuote = await qStore.createQuote()
      emit('submit', newQuote)
    } else {
      const updatedQuote = await qStore.updateQuote(localQuote.value)
      if (updatedQuote) {
        pStore.refreshQuote(updatedQuote)
        emit('submit', updatedQuote)
      }
    }
  },
  name: async (q:Iquote) => {
    const updatedQuote = await qStore.saveQuoteName(q.id, q.descr) as Iquote
    if (updatedQuote) {
      pStore.refreshQuote(updatedQuote as Iquote)
      emit('name', updatedQuote)
    }
  },
  delete: () => {
    if (!localQuote.value) return
    qStore.deleteQuote(localQuote.value)

    emit('delete')
  }
}

</script>

<template>
  <dialog :id="props.popid">
    <div v-if="localQuote">
      <div v-if="localQuote.status == 'NEW'"
          class="titlebar"
        >New {{ B.codeToText.qtype(localQuote.qtype) }} Quote</div>
      <div v-else-if="localQuote.id < 0"
          class="titlebar"
        >New {{ B.codeToText.qtype(localQuote.qtype)}} Quote for {{ B.format.effdat(localQuote.effdat) }}</div>
      <div v-else
          class="titlebar"
        >{{ B.codeToText.qtype(localQuote.qtype)}} Quote #{{ localQuote.id }} for {{ B.format.effdat(localQuote.effdat) }}</div>
      <div style="position: absolute; top: .5em; right: .5em;" class="info">
        Status: <BIcon :icon="B.statusIcon(localQuote.status)"/>{{ B.codeToText.quoteStatus(localQuote.status) }}
      </div>
      <QuoteDialog_CREATE v-if="localQuote.status == 'NEW'"
        @close="internalHandler.close"
        @continue="internalHandler.continue" />
      <QuoteDialog_INPROG v-else-if="localQuote.status == 'INPROG'"
        @close="internalHandler.close"
        @delete="internalHandler.delete"
        @submit="internalHandler.submit"
        @name="internalHandler.name"
        @save="internalHandler.save" />
      <QuoteDialog_VIEW v-else
        @close="internalHandler.close"
        @force="internalHandler.force"
        @name="internalHandler.name" />
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
