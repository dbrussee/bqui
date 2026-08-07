<script setup lang="ts">
import SidebarItem from "@/components/SidebarItem.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appPageStore } from "@/stores/PageStore";
const pageStore = appPageStore();
import { appProspectStore } from "@/stores/ProspectStore";
import { ref, onRenderTriggered } from "vue";
const prospectStore = appProspectStore();
import BTable from "@/components/BTable.vue";

const pickedFave = ref("");
const pickedRecent = ref("");
function pickFave(pid: string) {
  prospectStore.getProspect(pid);
  pickedFave.value = "";
  document.getElementById("favesPopover")?.togglePopover();
}
function pickRecent(pid: string) {
  prospectStore.getProspect(pid);
  pickedRecent.value = "";
  document.getElementById("recentPopover")?.togglePopover();
}
const cfgFaves = {
  columns: [
    { id: "pid", heading: "Prosp#", width: "4em", flags: "R" },
    { id: "name", heading: "Name", width: "20em" },
  ],
}
const cfgRecents = {
  columns: [
    { id: "pid", heading: "Prosp#", width: "4em", flags: "R" },
    { id: "name", heading: "Name", width: "20em" },
  ],
}

onRenderTriggered(() => {
  if (userStore.user) {
    if (userStore.user.recents.length > 0) {
      prospectStore.getProspect(userStore.user.recents[0].pid);
    }
  }
})
</script>

<template>
  <div v-if="userStore.user">
    <SidebarItem @click="pageStore.page = 'PROSPECTS'" :current="pageStore.page == 'PROSPECTS'"
      >Prospect{{ prospectStore.prospect && prospectStore.prospect.id ? ' ID: ' + prospectStore.prospect.id : '' }}<br />
      <i>- <button popovertarget="recentPopover" class="anchor">Recent</button> <span style="font-size:.8em;">({{ userStore.user.recents.length }})</span></i><br />
      <i>- <button popovertarget="favesPopover" class="anchor">Faves</button> <span style="font-size:.8em;">({{ userStore.user.faves.length }})</span></i>
      <div popover id="recentPopover" class="popover">
        <div class="popover-content">
          <BTable
            :rows="userStore.user.recents"
            :config="cfgRecents"
            @pick="(row: any) => pickRecent(row.pid)"
          />
        </div>
      </div>
      <div popover id="favesPopover" class="popover">
        <div class="popover-content">
          <BTable
            :rows="userStore.user.faves"
            :config="cfgFaves"
            @pick="(row: any) => pickFave(row.pid)"
          />
        </div>
      </div>
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'MSGS'" :current="pageStore.page == 'MSGS'"
      >Messages</SidebarItem
    >
    <SidebarItem @click="pageStore.page = 'SETTINGS'" :current="pageStore.page == 'SETTINGS'"
      >Settings</SidebarItem
    >
  </div>
  <data v-else>
    <SidebarItem>Login</SidebarItem>
  </data>
</template>

<style lang="css" scoped>
</style>
