<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useId } from 'vue';
import BTable from '@/components/B/BTable.vue';
import BConfirm from '@/components/B/BConfirm.vue';
import BButton from '@/components/B/BButton.vue';
import BPopup from '@/components/B/BPopup.vue';
import { appProspectStore } from "@/stores/ProspectStore";
const prospStore = appProspectStore();
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import UserComponent from '@/components/UserComponent.vue';
import BIcon from '@/components/B/BIcon.vue';


const favesPopover = ref()
const recentPopover = ref()
// const prospect_id = ref("");

const pickedFave = ref("");
const pickedRecent = ref("");
function pickFave(pid: string) {
  prospStore.getProspect(pid, true);
  pickedFave.value = "";
  favesPopover.value?.close();
}
function pickRecent(pid: string) {
  prospStore.getProspect(pid, true);
  pickedRecent.value = "";
  recentPopover.value?.close();
}
function clearRecents() {
  prospStore.clearRecents();
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
    { id: "group_type", heading: "Type", width: "3em", flags: "C", cellclass: "mono"},
    { id: "name", heading: "Name" },
  ],
})


const searchHandler = ref({
  id: useId(),
  submitButtonId: useId(),
  temp: {
    query: ''
  } as any,
  show: () => {
    cfgSearchResults.value.pickedRow = null
    const popup = document.getElementById(searchHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  load: (row:any) => {
    prospStore.getProspect(row.id, true)
    searchHandler.value.abort()
  },
  pick: (row:any) => {
    cfgSearchResults.value.pickedRow = row
  },
  search: () => {
    cfgSearchResults.value.pickedRow = null
    prospStore.searchProspects(searchHandler.value.temp.query).then(() => {
      if (prospStore.searchResults.length > 0) {
        const dlg = document.getElementById(searchHandler.value.id)
        const tbox = dlg?.querySelector("input") as HTMLInputElement
        tbox.select()
        tbox.focus()
        if (prospStore.searchResults.length == 1) {
          cfgSearchResults.value.pickedRow = prospStore.searchResults[0]
          const btn = document.getElementById(searchHandler.value.submitButtonId) as HTMLButtonElement
          btn.focus()
        }
      }
    })
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
        <BPopup class="anchor" pos="B2R" style="color: white" icon="solid list-ul_" ref="recentPopover">Recent
          <template #body>
            <BTable nofooter
              :rows="userStore.user.recents"
              :config="cfgRecents"
              @pick="(row: any) => pickRecent(row.pid)"
            />
            <div v-if="userStore.user.recents && userStore.user.recents.length > 0" class="buttonbar">
              <span v-if="prospStore.censusDirty" style="float:left; color:red">You will lose unsaved census changes!</span>
              <BConfirm icon="#red solid x" class="anchor" @confirm="clearRecents()">Clear List
                <template #message>
                  Permanently clear your recent prospects?
                  <p style="color: red">This cannot be undone!</p>
                </template>
              </BConfirm>&nbsp;
              <!-- <BButton icon="#red solid x" class="anchor" @click="clearRecents()">Clear Recnets</BButton> -->
            </div>
          </template>
        </BPopup>&nbsp;
        <BPopup class="anchor" pos="B2R" style="color: white" icon="bookmark_" ref="favesPopover">Bookmarked
          <template #body>
            <BTable nofooter
              :rows="userStore.user.faves"
              :config="cfgFaves"
              @pick="(row: any) => pickFave(row.pid)"
            />
            <span v-if="prospStore.censusDirty" style="color:red">You will lose unsaved census changes!</span>
          </template>

        </BPopup>&nbsp;
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
        <tr><th><BIcon icon="solid magnifying-glass"/>Search Text:</th>
            <td><input name="searchQuery" style="width: 30em;" v-model="searchHandler.temp.query"><BButton>Search</BButton></td></tr>
      </tbody>
    </table>
    </form>
    <BTable nofooter :config="cfgSearchResults" :rows="prospStore.searchResults"
      @pick="(row) => searchHandler.pick(row)"
      @dblpick="(row) => searchHandler.load(row)"
    />
    <div class="buttonbar">
      <span v-if="prospStore.censusDirty" style="float:left; color:red">You will lose unsaved census changes!</span>
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
