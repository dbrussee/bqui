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
import APIHistory from '@/components/APIHistory.vue';
import BPopupMenuItem from '@/components/B/BPopupMenuItem.vue';
import BPopupImage from '@/components/B/BPopupImage.vue';
const apiHistoryRef = ref<InstanceType<typeof APIHistory> | null>(null)
const sysmenuRef = ref<InstanceType<typeof BPopupImage> | null>(null)
import { useNewProspectPopup } from "@/popups/NewProspect/useNewProspectPopup";
import { useSearchProspectPopup } from '@/popups/SearchProspect/useSearchProspectPopup';

const fave = (pid: number, isFavorite: boolean) => {
  if (pid) {
    prospStore.setFavorite(pid, isFavorite);
  }
};

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
  userStore.clearRecents();
  pickedRecent.value = "";
  recentPopover.value?.close();
}
const removeMeFromRecents = () => {
  prospStore.removeMeFromRecents().then(() => {
    pickedRecent.value = "";
    recentPopover.value?.close();
  })
}
const cfgFaves = ref({
  width: "25em",
  no_rows_text: 'No bookmarked prospects',
  columns: [
    { id: "pid", heading: "Prosp", width: "4em", flags: "R" },

    { id: "name", heading: "Name", width: "20em" },
  ],
})
const cfgRecents = ref({
  width: "25em",
  no_rows_text: 'No recent prospects',
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
          // const btn = document.getElementById(searchHandler.value.submitButtonId) as HTMLButtonElement
          // btn.focus()
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
  if (!prospStore.prospect) return ""
  if (!prospStore.prospect.id) return "Loading..."
  if (prospStore.prospect.id) return prospStore.prospect.name
  return 'Unknown'
}

function getBookmarkIcon():string {
  if (!userStore.user) return "#silver bookmark_"
  if (!prospStore.prospect) return "#silver bookmark_"
  if (!prospStore.prospect.id) return "#silver bookmark_"
  if (prospStore.isCurrentlyFavorite()) return "#gold solid bookmark_"
  return "#gold bookmark_"
}

const openHistory = () => {
  if (!userStore.user) return
  apiHistoryRef.value?.open()
}

</script>

<template>
  <APIHistory ref="apiHistoryRef"/>
  <div class="container">
    <div style="padding-left: 2.5em; color: white;">
      <BPopupImage ref="sysmenuRef" :disabled="!userStore.user" pos="B2R" heading="System Menu" src="/src/bcbc_logo.png"  style="position: absolute; height: 2.7em; top: .5em; left: .8em;">
        <BPopupMenuItem icon="solid list" @click="openHistory()">API History</BPopupMenuItem>
        <BPopupMenuItem separator="top" icon="solid arrow-right-from-bracket_">
          <BConfirm
            :warning="prospStore.censusDirty ? 'You will lose unsaved census changes!' : ''"
            class="anchor"
            pos="R" @confirm="sysmenuRef?.close(); userStore.logout()">Logout?
            <template #message>
              Log out user '{{ userStore.user?.id }}'
            </template>
          </BConfirm>
        </BPopupMenuItem>
      </BPopupImage>

      <i style="font-size:1.5em">B<b></b>lueQuote</i>
    </div>

    <div>
      <table style="width: 100%;">
        <tbody>
          <tr>
            <td style="text-align: left; color:white;">
              <BIcon v-if="prospStore.prospect" :icon="getBookmarkIcon()"
                @click="fave(prospStore.prospect.id, !prospStore.isCurrentlyFavorite())" />
              {{ getProspectName() }}
            </td>
            <td v-if="userStore.user" style="text-align: right;">
              <BPopup class="anchor anchor-in-header" pos="B" icon="solid list-ul_" ref="recentPopover">Recent
                <template #body>
                  <BTable nofooter
                    heading="Recently Viewed Prospects"
                    :rows="userStore.user.recents"
                    :config="cfgRecents"
                    @pick="(row: any) => pickRecent(row.pid)"
                  />
                  <div class="buttonbar">
                    <BConfirm
                        @confirm="removeMeFromRecents()"
                        :warning="prospStore.censusDirty ? 'You will lose unsaved census changes!' : ''"
                        icon="solid eject"
                        width="30em"
                        pos="L2B"
                        class="anchor"
                        heading="Forget This Prospect"
                        :disabled="!userStore.user.recents || userStore.user.recents.length < 1"
                      >Forget This?
                      <template #message>
                        <ul>
                          <li class="info">Remove the current prospect from your Recents list</li>
                          <li v-if="userStore.user.recents && userStore.user.recents.length > 1" class="info">Load the next most recent prospect in the list.</li>
                          <li v-else class="info">There are no other prospects in your Recents list, so you will need to
                            create a new prospect, search for existing prospects or use your Bookmarks list.
                          </li>
                        </ul>
                        <p>
                          This prospect will <b><u>NOT</u></b> be changed in any way.
                          If it was bookmarked it will still be there, and you can search for and
                          find it again at any time.
                        </p>
                      </template>
                    </BConfirm>&nbsp;

                    <BConfirm
                      @confirm="clearRecents()"
                      icon="solid minimize"
                      class="anchor"
                      :disabled="!userStore.user.recents || userStore.user.recents.length < 2"
                    >Clear Others?
                      <template #message>
                        All but the currently showing prospect will be forgotten. They can
                        still be searched for, and if they are in your bookmarks they
                        will remain there.
                        <p style="color: red">This cannot be undone!</p>
                      </template>
                    </BConfirm>&nbsp;
                    <!-- <BButton icon="#red solid x" class="anchor" @click="clearRecents()">Clear Recnets</BButton> -->
                  </div>
                </template>
              </BPopup>&nbsp;
              <BPopup
                class="anchor anchor-in-header" pos="B" icon="bookmark_" ref="favesPopover">Bookmarks<template #body>
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
                @click="useSearchProspectPopup().openSearch()"
                class="modern"
                icon="solid magnifying-glass_">Search&hellip;</BButton>&nbsp;
              <BButton
                v-if="!userStore.isUserReadOnly()"
                @click="useNewProspectPopup().openNewProspect()"
                class="action"
                icon="square-plus_">New Prospect&hellip;</BButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</template>

<style scoped>
  .container {
    display: grid;
    grid-template-columns: 170px 1fr;
  }
</style>
