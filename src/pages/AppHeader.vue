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
const cfgFaves = {
  width: "25em",
  columns: [
    { id: "pid", heading: "Prosp", width: "4em", flags: "R" },

    { id: "name", heading: "Name", width: "20em" },
  ],
};
const cfgRecents = {
  width: "25em",
  columns: [
    { id: "pid", heading: "Prosp", width: "4em", flags: "R" },
    { id: "name", heading: "Name", width: "20em" },
  ],
};

const searchHandler = ref({
  id: useId(),
  temp: {
    searchtext: ''
  } as any,
  edit: () => {
    const popup = document.getElementById(searchHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  save: () => {
    prospectStore.createProspect(searchHandler.value.temp)
    const popup = document.getElementById(searchHandler.value.id) as HTMLDialogElement
    popup?.close()
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

      </span>

    </div>
    <div class="meta-area">
    </div>
  </div>

  <dialog :id="searchHandler.id">
    <div class="titlebar">New Prospect</div>
    <table class="form-table">
      <tbody>
        <tr><th>Group Name:</th><td><input style="width: 30em;" v-model="searchHandler.temp.name"></td></tr>
        <tr><th>Contact:</th><td><input style="width: 30em;" v-model="searchHandler.temp.contact"></td></tr>
        <tr><th>Email:</th><td><input style="width: 30em;" v-model="searchHandler.temp.email"></td></tr>
        <tr><th>Phone:</th><td><input style="width: 12em;" v-model="searchHandler.temp.phone"></td></tr>
        <tr><th>Subscribers:</th><td><input style="width: 5em;" v-model="searchHandler.temp.subs_estimate"> <span class="info">(estimate)</span></td></tr>
        <tr><th>Address:</th><td><input style="width: 30em;" v-model="searchHandler.temp.addr1"></td></tr>
        <tr><th></th><td><input style="width: 30em;" v-model="searchHandler.temp.addr2"></td></tr>
        <tr><th></th><td>
          <input style="width: 12em; margin-right: .3em;" v-model="searchHandler.temp.city">
          <input style="width: 3em; margin-right: .3em;" v-model="searchHandler.temp.state_cd">
          <input style="width: 6em;" v-model="searchHandler.temp.zip_cd">
        </td></tr>
        <tr><th>Enroll Date:</th><td><input style="width: 10em;" v-model="searchHandler.temp.enroll_date"></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <BButton class="anchor" icon="#red solid x" @click="searchHandler.abort()">Cancel</BButton>&nbsp;
            <BButton class="action" icon="square-plus_" @click="searchHandler.save()">Create Prospect</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
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
