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
import BIcon from '@/components/B/BIcon.vue';
import BInfo from '@/components/B/BInfo.vue';
import { B } from '@/composables/BUtils.ts';

const prospHandler = ref({
  id: useId(),
  temp: {
    id: -1, grpnum: null, name: "", dba: null, agent_id: "",
    addr1: "", addr2: "", city: "", state_cd: "NC", zip_cd: "", county: null,
    size_cd: "", group_type: "", subs_estimate: 1,
    created_ts: "", created_by: "",
    last_quoted_ts: null, enrolled_ts: null,
    contact: "", phone: "", email: "",
    enroll_date: (() => {
      const d = new Date()
      d.setMonth(d.getMonth() + 3)
      d.setDate(1)
      return d.toLocaleDateString()
    })()
  } as any,
  edit: () => {
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  save: () => {
    prospStore.createProspect(prospHandler.value.temp)
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  },
  abort: () => {
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  }
})
const fave = (pid: number, isFavorite: boolean) => {
  if (pid) {
    prospStore.setFavorite(pid, isFavorite);
  }
};

const isCurrentlyFavorite = () => {
  if (!userStore.user || !userStore.user.faves || !prospStore.prospect.id) return false;
  let rslt = false;
  for (let i = 0; i < userStore.user.faves.length; i++) {
    if (userStore.user.faves[i].pid == prospStore.prospect.id) {
      rslt = true;
      break;
    }
  }
  return rslt;
}


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

function getProspectName():string {
  if (!prospStore.prospect) return "no prosp"
  if (prospStore.isLoading) return "Loading..."
  if (prospStore.prospect.id) return prospStore.prospect.name
  return 'Unknown'
}

function getBookmarkIcon():string {
  if (!userStore.user) return "#silver bookmark_"
  if (!prospStore.prospect) return "#silver bookmark_"
  if (!prospStore.prospect.id) return "#silver bookmark_"
  if (isCurrentlyFavorite()) return "#gold solid bookmark_"
  return "#gold bookmark_"
}

</script>

<template>
  <div class="container">
    <div class="logo-area">
      <i><b>B</b>lueQuote</i>
    </div>
    <div class="user-areaX">

      <table style="width: 100%;">
        <tbody>
          <tr>
            <td style="text-align: left;">
              <BIcon tt="Toggle Bookmark" :icon="getBookmarkIcon()"
                @click="fave(prospStore.prospect.id, !isCurrentlyFavorite())" />
              {{ getProspectName() }}
              <BInfo v-if="prospStore.prospect" pos="B" :heading="`Prospect ${prospStore.prospect.id} Details`">
                {{ prospStore.prospect.name }}
                <ul>
                  <li>Agent of Record: {{ prospStore.prospect.agent_id }}</li>
                  <li>Eligible: {{ prospStore.prospect.subs_estimate }} <i>(estimate)</i>
                    <ul>
                      <li v-if="!prospStore.prospect.census || prospStore.prospect.census.length == 0">Census: <span style='color: red;'>None</span></li>
                      <li v-else>Census: {{ prospStore.prospect.census.length }}</li>
                    </ul>
                  </li>
                  <li>Size Code: {{ prospStore.prospect.size_cd }}, Type: {{ prospStore.prospect.group_type }}</li>
                  <li>Created By: {{ prospStore.prospect.created_by }}<ul>
                    <li>On: {{ B.format.ts(prospStore.prospect.created_ts) }}</li>
                  </ul></li>
                  <li v-if="prospStore.prospect.last_quoted_ts">Last Quoted: {{ B.format.ts(prospStore.prospect.last_quoted_ts) }}</li>
                  <li v-if="prospStore.prospect.enrolled_ts">Enrolled: {{ B.format.ts(prospStore.prospect.enrolled_ts) + " as " + prospStore.prospect.grpnum }}</li>
                </ul> </BInfo
              >
            </td>
            <td v-if="userStore.user" style="text-align: right;">
              <BPopup class="anchor" pos="B" style="color: white" icon="solid list-ul_" ref="recentPopover">Recent
                <template #body>
                  <BTable nofooter
                    heading="Recently Accessed Prospects"
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
              <BPopup
                class="anchor" pos="B" style="color: white" icon="bookmark_" ref="favesPopover">Bookmarked<template #body>
                  <BTable nofooter
                    heading="Bookmarked Prospects"
                    :rows="userStore.user.faves"
                    :config="cfgFaves"
                    @pick="(row: any) => pickFave(row.pid)"
                  />
                  <span v-if="prospStore.censusDirty" style="color:red">You will lose unsaved census changes!</span>
                </template>
              </BPopup>&nbsp;
              <BButton
                class="modern" icon="solid magnifying-glass_" @click="searchHandler.show()">Search&hellip;</BButton>&nbsp;<BButton
                @click="prospHandler.edit()" class="action" icon="square-plus_">New Prospect&hellip;</BButton>
            </td>
          </tr>
        </tbody>
      </table>
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

  <dialog :id="prospHandler.id">
    <div class="titlebar">New Prospect</div>
    <table class="form-table">
      <tbody>
        <tr><th>Group Name:</th><td><input name="grpname" style="width: 30em;" v-model="prospHandler.temp.name"></td></tr>
        <tr><th>Contact:</th><td><input name="grpcontact" style="width: 30em;" v-model="prospHandler.temp.contact"></td></tr>
        <tr><th>Email:</th><td><input name="grpemail" style="width: 30em;" v-model="prospHandler.temp.email"></td></tr>
        <tr><th>Phone:</th><td><input name="grpphone" style="width: 12em;" v-model="prospHandler.temp.phone"></td></tr>
        <tr><th>Eligible:</th><td><input name="estimate" style="width: 5em;" v-model="prospHandler.temp.subs_estimate"> <span class="info">(estimate)</span></td></tr>
        <tr><th>Address:</th><td><input name="grpaddr1" style="width: 30em;" v-model="prospHandler.temp.addr1"></td></tr>
        <tr><th></th><td><input name="grpaddr2" style="width: 30em;" v-model="prospHandler.temp.addr2"></td></tr>
        <tr><th></th><td>
          <input name="grpcity" style="width: 12em; margin-right: .3em;" v-model="prospHandler.temp.city">
          <input name="grpstate" style="width: 3em; margin-right: .3em;" v-model="prospHandler.temp.state_cd">
          <input name="grpzip" style="width: 6em;" v-model="prospHandler.temp.zip_cd">
        </td></tr>
        <tr><th>Enroll Date:</th><td><input name="enrollDate" style="width: 10em;" v-model="prospHandler.temp.enroll_date"></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <BButton class="anchor" icon="#red solid x" @click="prospHandler.abort()">Cancel</BButton>&nbsp;
            <BButton class="action" icon="square-plus_" @click="prospHandler.save()">Create Prospect</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
  </dialog>

</template>

<style scoped>
  .container {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
</style>
