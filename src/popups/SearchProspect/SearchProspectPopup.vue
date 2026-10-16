<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BButton from '@/components/B/BButton.vue'
import BTable from '@/components/B/BTable.vue'
import BIcon from '@/components/B/BIcon.vue'

import { appProspectStore } from '@/stores/ProspectStore'
const pStore = appProspectStore()
import { ref } from 'vue'
import { useSearchProspectPopup } from './useSearchProspectPopup'
const { popRef, closeSearch, loadProspect } = useSearchProspectPopup()

// const query = ref("")
const queryTextRef = ref(null)

const cfgSearchResults = ref({
  onPick: (row:any) => cfgSearchResults.value.pickedRow = row,
  onDblpick: () => loadProspect(cfgSearchResults.value.pickedRow.id),
  width: "45em",
  height: "15em",
  pickedRow: null as any,
  columns: [
    { id: "id", heading: "Prosp", width: "4em", flags: "R" },
    { id: "group_type", heading: "Type", width: "3em", flags: "C", cellclass: "mono"},
    { id: "name", heading: "Name" },
  ],
})

const searchHandler = ref({
  search: () => {
    cfgSearchResults.value.pickedRow = null
    pStore.searchProspects(pStore.searchQuery).then(() => {
      if (pStore.searchResults.length > 0) {
        const tbox = (queryTextRef.value! as HTMLInputElement)
        tbox.select()
        tbox.focus()
        if (pStore.searchResults.length == 1) {
          cfgSearchResults.value.pickedRow = pStore.searchResults[0]
        }
      }
    })
  }
})

</script>
<template>
  <dialog ref="popRef">
    <form @submit.prevent="searchHandler.search()">
      <table class="form-table centerme">
        <tbody>
          <tr><th><BIcon icon="solid magnifying-glass"/>Search Text:</th>
              <td><input ref="queryTextRef" style="width: 30em;" v-model="pStore.searchQuery"><BButton>Search</BButton></td></tr>
        </tbody>
      </table>
      <BTable :config="cfgSearchResults" :rows="pStore.searchResults" />
      <div class="buttonbar">
        <span v-if="pStore.censusDirty" style="float:left; color:red">You will lose unsaved census changes!</span>
        <BButton class="anchor" gapright icon="#red solid x" @click="closeSearch()">Cancel</BButton>
        <BButton type="button" @click="loadProspect(cfgSearchResults.pickedRow.id)" :disabled="!cfgSearchResults.pickedRow" class="modern" icon="solid check">Load</BButton>
      </div>
    </form>
  </dialog>
</template>
