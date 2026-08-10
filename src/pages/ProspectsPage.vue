<script setup lang="ts">
import { ref, useId } from "vue";
import { appProspectStore } from "@/stores/ProspectStore";
const prospectStore = appProspectStore();
import ProspectComponent from "@/components/prospectComponent.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();

const favesPopover = useId();
const recentPopover = useId();

const prospect_id = ref("");
import BTable from "@/components/BTable.vue";
import UserConfirm from "@/components/UserConfirm.vue";

const pickedFave = ref("");
const pickedRecent = ref("");
function pickFave(pid: string) {
  prospectStore.getProspect(pid, true);
  pickedFave.value = "";
  document.getElementById(favesPopover)?.togglePopover();
}
function pickRecent(pid: string) {
  prospectStore.getProspect(pid, true);
  pickedRecent.value = "";
  document.getElementById(recentPopover)?.togglePopover();
}
function clearRecents() {
  prospectStore.clearRecents();
  pickedRecent.value = "";
  document.getElementById(recentPopover)?.togglePopover();
}
const cfgFaves = {
  columns: [
    { id: "pid", heading: "Prosp#", width: "4em", flags: "R" },
    { id: "name", heading: "Name", width: "20em" },
  ],
};
const cfgRecents = {
  columns: [
    { id: "pid", heading: "Prosp#", width: "4em", flags: "R" },
    { id: "name", heading: "Name", width: "20em" },
  ],
};
</script>
<template>
  <div class="drop_menu">
    <button :popovertarget="recentPopover" class="anchor">History</button>&nbsp;
    <button :popovertarget="favesPopover" class="anchor">Faves</button>&nbsp;
    <div popover :id="recentPopover" class="popover">
      <div class="popover-content">
        <BTable
          :rows="userStore.user.recents"
          :config="cfgRecents"
          @pick="(row: any) => pickRecent(row.pid)"
        />
        <UserConfirm
          as_anchor
          v-if="userStore.user.recents && userStore.user.recents.length > 0"
          @confirm="clearRecents()"
          >Clear History&hellip;</UserConfirm
        >
      </div>
    </div>
    <div popover :id="favesPopover" class="popover">
      <div class="popover-content">
        <BTable
          :rows="userStore.user.faves"
          :config="cfgFaves"
          @pick="(row: any) => pickFave(row.pid)"
        />
      </div>
    </div>
    <form
      style="display: inline-block"
      @submit.prevent="prospectStore.getProspect(prospect_id, true)"
    >
      &nbsp;<input v-model="prospect_id" size="8" placeholder="Prosp #" />
      <button type="submit">Load</button>
    </form>
  </div>
  <ProspectComponent v-if="prospectStore.prospect" />
</template>
<style lang="css" scoped></style>
