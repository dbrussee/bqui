<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BButton from '@/components/B/BButton.vue'
import BPopup from '@/components/B/BPopup.vue'
import BDropdownMenu from '@/components/B/BDropdownMenu.vue'
import BTable from '@/components/B/BTable.vue'
import BIcon from '@/components/B/BIcon.vue'
import { B } from '@/composables/BUtils'
import { appProspectStore } from '@/stores/ProspectStore'
const pStore = appProspectStore()
import { appUserStore } from '@/stores/AppUserStore'
const uStore = appUserStore()
import { ref } from 'vue'
import { useSearchProspectPopup } from './useSearchProspectPopup'
const { popRef, closeSearch, loadProspect } = useSearchProspectPopup()

const cfgSearchResults = ref({
  onPick: (row:any) => cfgSearchResults.value.pickedRow = row,
  onDblpick: () => loadProspect(cfgSearchResults.value.pickedRow.id),
  width: "55em",
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
    pStore.searchProspects().then(() => {
      if (pStore.searchResults.length > 0) {
        if (pStore.searchResults.length == 1) {
          cfgSearchResults.value.pickedRow = pStore.searchResults[0]
        }
      }
    })
  }
})
const setSearchStatus = (code:string):void => {
  pStore.searchParameters.status = code
  // statusPicker.value?.close()
}
const headingText = ():string => {
  let txt = "Search "
  const scope = uStore.user?.rights.SEARCH_SCOPE.value
  if (scope == "GLOBAL") txt += "All "
  else if (scope == "AGENCY") txt += "Your Agency "
  else txt += "Your "
  txt += "Prospects "
  return txt
}

</script>
<template>
  <dialog ref="popRef" v-if="uStore.user?.id">
    <div class="titlebar"><BIcon icon="solid filter_"/>{{  headingText() }}
      <span style="font-size: 1rem;"><BButton class="anchor" @click="pStore.clearSearchParameters()" icon="solid rotate-left"/></span>
    </div>
    <form @submit.prevent="searchHandler.search()">
      <table class="form-table centerme">
        <tbody>
          <tr>
            <th><BIcon icon="solid magnifying-glass"/>Search Text:</th>
            <td><input autofocus ref="queryTextRef" style="width: 30em;" v-model="pStore.searchParameters.query">
              <BButton type="submit">Search</BButton></td>
          </tr>
        </tbody>
      </table>
      <table class="form-table centerme">
        <tbody>
          <tr>
            <th v-if="uStore.user?.rights.SEARCH_SCOPE.value == 'AGENCY'">Agent:</th>
            <td v-if="uStore.user?.rights.SEARCH_SCOPE.value == 'AGENCY'" style="vertical-align: top; padding-right: 1em;">
              <BDropdownMenu heading="Agency User"
                :options="[
                  {value:'', text:'Any Agent'},
                  {value:uStore.user?.id, text:`${uStore.user?.lstnam}, ${uStore.user?.fstnam} - ${uStore.user?.id} (me)`},
                  '--',
                  ...(uStore.user?.agency_users || []).map(u => ({
                    value: u.id,
                    text: `${u.lstnam}, ${u.fstnam.trim()} - ${u.id}`
                  }))
                ]"
                :value="pStore.searchParameters.agent"
                @change="(val) => pStore.searchParameters.agent=val" />
            </td>
            <th>&nbsp;Min:</th><td><input v-model="pStore.searchParameters.min" placeholder="1" style="width:4em;"/></td>
            <th>&nbsp;Max:</th><td><input v-model="pStore.searchParameters.max" placeholder="999999" style="width:4em;"/></td>
            <th>&nbsp;Eff:</th><td><input v-model="pStore.searchParameters.eff" placeholder="any" style="width:6em;"/></td>
            <th>&nbsp;Status:</th><td style="width: 10em; vertical-align: top;">
              <BDropdownMenu heading="Starting tab"
                :options="[
                  {value:'ANY', text:B.codeToText.quoteStatus('ANY'), icon:B.statusIcon('ANY')},
                  '--',
                  {value:'INPROG', text:B.codeToText.quoteStatus('INPROG'), icon:B.statusIcon('INPROG')},
                  {value:'PENDING', text:B.codeToText.quoteStatus('PENDING'), icon:B.statusIcon('PENDING')},
                  {value:'RATEREQ', text:B.codeToText.quoteStatus('RATEREQ'), icon:B.statusIcon('RATEREQ')},
                  {value:'READY', text:B.codeToText.quoteStatus('READY'), icon:B.statusIcon('READY')},
                  {value:'ENROLLED', text:B.codeToText.quoteStatus('ENROLLED'), icon:B.statusIcon('ENROLLED')},
                  {value:'EXPIRED', text:B.codeToText.quoteStatus('EXPIRED'), icon:B.statusIcon('EXPIRED')},
                ]"
                :value="pStore.searchParameters.status"
                @change="(val) => setSearchStatus(val)" />
            </td>
          </tr>
        </tbody>
      </table>
    </form>
    <BTable :config="cfgSearchResults" :rows="pStore.searchResults" />
    <div class="buttonbar">
      <span v-if="pStore.censusDirty" style="float:left; color:red">You will lose unsaved census changes!</span>
      <BButton type="button" class="anchor" gapright icon="#red solid x" @click="closeSearch()">Cancel</BButton>
      <BButton type="button" @click="loadProspect(cfgSearchResults.pickedRow.id)" :disabled="!cfgSearchResults.pickedRow" class="modern" icon="solid check">Load</BButton>
    </div>
  </dialog>
</template>
