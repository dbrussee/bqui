<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useId } from 'vue';
import BTable from '@/components/B/BTable.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import BButton from '@/components/B/BButton.vue';
import BPopup from '@/components/B/BPopup.vue';
import { appProspectStore } from "@/stores/ProspectStore";
const prospectStore = appProspectStore();
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import UserComponent from '@/components/UserComponent.vue';
import BIcon from '@/components/B/BIcon.vue';


const favesPopover = ref()
const recentPopover = ref()
const prospect_id = ref("");

const pickedFave = ref("");
const pickedRecent = ref("");
function pickFave(pid: string) {
  prospectStore.getProspect(pid, true);
  pickedFave.value = "";
  favesPopover.value?.close();
}
function pickRecent(pid: string) {
  prospectStore.getProspect(pid, true);
  pickedRecent.value = "";
  recentPopover.value?.close();
}
function clearRecents() {
  prospectStore.clearRecents();
  pickedRecent.value = "";
  recentPopover.value?.close();
}
const cfgFaves = ref({
  width: "25em",
  columns: [
    { id: "pid", heading: "Prosp", width: "4em", flags: "R" },

    { id: "name", heading: "Name", width: "20em" },
  ],
})
const cfgRecents = ref({
  width: "25em",
  columns: [
    { id: "pid", heading: "Prosp", width: "4em", flags: "R" },
    { id: "name", heading: "Name", width: "20em" },
  ],
})
const cfgSearchResults = ref({
  width: "45em",
  height: "15em",
  pickedRow: null as any,
  columns: [
    { id: "id", heading: "Prosp", width: "4em", flags: "R" },
    { id: "name", heading: "Name" },
  ],
})


const searchHandler = ref({
  id: useId(),
  temp: {
    query: ''
  } as any,
  show: () => {
    cfgSearchResults.value.pickedRow = null
    const popup = document.getElementById(searchHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  load: (row:any) => {
    prospectStore.getProspect(row.id, true)
    searchHandler.value.abort()
  },
  pick: (row:any) => {
    cfgSearchResults.value.pickedRow = row
  },
  search: () => {
    cfgSearchResults.value.pickedRow = null
    prospectStore.searchProspects(searchHandler.value.temp.query)
  },
  abort: () => {
    const popup = document.getElementById(searchHandler.value.id) as HTMLDialogElement
    popup?.close()
  }
})

</script>

<template>
  <div class="container">
    <div class="logo-area">
      <i><b>B</b>lueQuote</i>
    </div>
    <div class="user-area">
      <UserComponent>Not logged in</UserComponent>

      <span v-if="userStore.user" style="margin-left: 3em;">
        <BPopup as="anchor" style="color: white" linkicon="solid list-ul_" linktext="Recent" class="B2R" ref="recentPopover">
          <BTable nofooter
            :rows="userStore.user.recents"
            :config="cfgRecents"
            @pick="(row: any) => pickRecent(row.pid)"
          />
          <div v-if="userStore.user.recents && userStore.user.recents.length > 0" class="buttonbar">
            <BConfirm icon="#red solid x" class="anchor" @confirm="clearRecents()">Clear Recents
              <template #message>
                Permanently clear your recent prospect?
                <p style="color: red">This cannot be undone!</p>
              </template>
            </BConfirm>&nbsp;
            <!-- <BButton icon="#red solid x" class="anchor" @click="clearRecents()">Clear Recnets</BButton> -->
          </div>
        </BPopup>&nbsp;
        <BPopup as="anchor" style="color: white" linkicon="bookmark_" linktext="Bookmarked" ref="favesPopover" class="B2R">
          <BTable nofooter
            :rows="userStore.user.faves"
            :config="cfgFaves"
            @pick="(row: any) => pickFave(row.pid)"
          />
        </BPopup>&nbsp;
        <form
          style="display: inline-block"
          @submit.prevent="prospectStore.getProspect(prospect_id, true)"
          >
          &nbsp;<input v-model="prospect_id" size="8" placeholder="Prosp #" />
          <button type="submit">Load</button>
        </form>&nbsp;
        <BButton class="modern" icon="solid magnifying-glass_" @click="searchHandler.show()">Search&hellip;</BButton>
      </span>

    </div>
    <div class="meta-area">
    </div>
  </div>

  <dialog :id="searchHandler.id">
    <form @submit.prevent="searchHandler.search()">
    <table class="form-table centerme">
      <tbody>
        <tr><th><BIcon icon="solid magnfying-glass"/>Search Text:</th>
            <td><input style="width: 30em;" v-model="searchHandler.temp.query"><BButton>Search</BButton></td></tr>
      </tbody>
    </table>
    </form>
    <BTable nofooter :config="cfgSearchResults" :rows="prospectStore.searchResults"
      @pick="(row) => searchHandler.pick(row)"
      @dblpick="(row) => searchHandler.load(row)"
    />
    <div class="buttonbar">
      <BButton class="anchor gapright" icon="#red solid x" @click="searchHandler.abort()">Cancel</BButton>
      <BButton :disabled="!cfgSearchResults.pickedRow" class="modern" icon="solid check" @click="searchHandler.load(cfgSearchResults.pickedRow)">Load</BButton>
    </div>
  </dialog>

</template>

<style scoped>
  .container {
    display: grid;
    grid-template-columns: 200px 1fr 100px;
  }
  .meta-area {
    text-align: right;
    font-size: .7em;
  }
</style>
