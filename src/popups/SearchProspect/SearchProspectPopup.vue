<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BButton from '@/components/B/BButton.vue'
import BTable from '@/components/B/BTable.vue'
import BIcon from '@/components/B/BIcon.vue'

import { appProspectStore } from '@/stores/ProspectStore'
const prospStore = appProspectStore()
import { ref } from 'vue'
import { useSearchProspectPopup } from './useSearchProspectPopup'
const { popRef, closeSearch, loadProspect } = useSearchProspectPopup()

const query = ref("")
const queryTextRef = ref(null)

const cfgSearchResults = ref({
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
  pick: (row:any) => {
    cfgSearchResults.value.pickedRow = row
  },
  search: () => {
    cfgSearchResults.value.pickedRow = null
    prospStore.searchProspects(query.value).then(() => {
      if (prospStore.searchResults.length > 0) {
        const tbox = (queryTextRef.value! as HTMLInputElement)
        tbox.select()
        tbox.focus()
        if (prospStore.searchResults.length == 1) {
          cfgSearchResults.value.pickedRow = prospStore.searchResults[0]
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
              <td><input ref="queryTextRef" style="width: 30em;" v-model="query"><BButton>Search</BButton></td></tr>
        </tbody>
      </table>
      <BTable nofooter :config="cfgSearchResults" :rows="prospStore.searchResults"
        @pick="(row:any) => searchHandler.pick(row)"
        @dblpick="() => loadProspect(cfgSearchResults.pickedRow.id)"
      />
      <div class="buttonbar">
        <span v-if="prospStore.censusDirty" style="float:left; color:red">You will lose unsaved census changes!</span>
        <BButton class="anchor gapright" icon="#red solid x" @click="closeSearch()">Cancel</BButton>
        <BButton type="submit" :disabled="!cfgSearchResults.pickedRow" class="modern" icon="solid check">Load</BButton>
      </div>
    </form>
  </dialog>
</template>
