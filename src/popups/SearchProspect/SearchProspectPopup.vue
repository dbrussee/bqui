<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BButton from '@/components/B/BButton.vue'
import BPopup from '@/components/B/BPopup.vue'
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

const statusPicker = ref()

// const query = ref("")
const queryTextRef = ref(null)

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
        // const tbox = (queryTextRef.value! as HTMLInputElement)
        // tbox.select()
        // tbox.focus()
        if (pStore.searchResults.length == 1) {
          cfgSearchResults.value.pickedRow = pStore.searchResults[0]
        }
      }
    })
  }
})
const setSearchStatus = (code:string):void => {
  pStore.searchParameters.status = code
  statusPicker.value?.close()
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
  <dialog ref="popRef">
    <div class="titlebar"><BIcon icon="solid filter_"/>{{  headingText() }}
      <span style="font-size: 1rem;"><BButton class="anchor" @click="pStore.clearSearchParameters()" icon="solid rotate-left"/></span>
    </div>
    <form @submit.prevent="searchHandler.search()">
      <table class="form-table centerme">
        <tbody>
          <tr>
            <th><BIcon icon="solid magnifying-glass"/>Search Text:</th>
            <td><input autofocus ref="queryTextRef" style="width: 30em;" v-model="pStore.searchParameters.query"><BButton>Search</BButton></td>
          </tr>
          </tbody>
        </table>
        <table class="form-table centerme">
          <tbody>
            <tr>
              <th v-if="uStore.user?.rights.SEARCH_SCOPE.value == 'AGENCY'">Agent:</th>
              <td v-if="uStore.user?.rights.SEARCH_SCOPE.value == 'AGENCY'">
                <select v-model="pStore.searchParameters.agent" style="width: 12em;">
                  <option value="">any</option>
                  <option :value="uStore.user?.id">{{ uStore.user?.lstnam }}, {{ uStore.user?.fstnam }} (me)</option>
                  <option v-for="u of uStore.user?.agency_users" :key="u.id" :value="u.id">{{ u.lstnam }}, {{ u.fstnam }}</option>
                </select>
              </td>
              <th>&nbsp;Min:</th><td><input v-model="pStore.searchParameters.min" placeholder="1" style="width:4em;"/></td>
              <th>&nbsp;Max:</th><td><input v-model="pStore.searchParameters.max" placeholder="999999" style="width:4em;"/></td>
              <th>&nbsp;Eff:</th><td><input v-model="pStore.searchParameters.eff" placeholder="any" style="width:6em;"/></td>
              <th>&nbsp;Status:</th><td style="width: 10em;">
                <BPopup ref="statusPicker" class="anchor" :icon="B.statusIcon(pStore.searchParameters.status)" pos="L2B" heading="Status Filter">{{B.codeToText.quoteStatus(pStore.searchParameters.status)}}
                  <template #body>
                    <p><BButton prevent @click="setSearchStatus('ANY')" class="anchor" :icon="B.statusIcon('ANY')">{{B.codeToText.quoteStatus("ANY")}}</BButton></p>
                    <hr style="margin-top: .2em; margin-bottom: .2em;"/>
                    <p><BButton prevent @click="setSearchStatus('INPROG')" class="anchor" :icon="B.statusIcon('INPROG')">{{B.codeToText.quoteStatus("INPROG")}}</BButton></p>
                    <p><BButton prevent @click="setSearchStatus('PENDING')" class="anchor" :icon="B.statusIcon('PENDING')">{{B.codeToText.quoteStatus("PENDING")}}</BButton></p>
                    <p><BButton prevent @click="setSearchStatus('RATEREQ')" class="anchor" :icon="B.statusIcon('RATEREQ')">{{B.codeToText.quoteStatus("RATEREQ")}}</BButton></p>
                    <p><BButton prevent @click="setSearchStatus('READY')" class="anchor" :icon="B.statusIcon('READY')">{{B.codeToText.quoteStatus("READY")}}</BButton></p>
                    <p><BButton prevent @click="setSearchStatus('ENROLLED')" class="anchor" :icon="B.statusIcon('ENROLLED')">{{B.codeToText.quoteStatus("ENROLLED")}}</BButton></p>
                    <p><BButton prevent @click="setSearchStatus('EXPIRED')" class="anchor" :icon="B.statusIcon('EXPIRED')">{{B.codeToText.quoteStatus("EXPIRED")}}</BButton></p>
                  </template>
                </BPopup>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    <BTable :config="cfgSearchResults" :rows="pStore.searchResults" />
    <div class="buttonbar">
      <span v-if="pStore.censusDirty" style="float:left; color:red">You will lose unsaved census changes!</span>
      <BButton class="anchor" gapright icon="#red solid x" @click="closeSearch()">Cancel</BButton>
      <BButton type="button" @click="loadProspect(cfgSearchResults.pickedRow.id)" :disabled="!cfgSearchResults.pickedRow" class="modern" icon="solid check">Load</BButton>
    </div>
  </dialog>
</template>
