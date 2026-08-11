<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref } from "vue";
import { appProspectStore } from "@/stores/ProspectStore";
const prospectStore = appProspectStore();
import ProspectComponent from "@/components/prospectComponent.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();

const favesPopover = ref()
const recentPopover = ref()

const prospect_id = ref("");
import BTable from "@/components/BTable.vue";
import UserConfirm from "@/components/UserConfirm.vue";
import BPopup from "@/components/BPopup.vue";

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
  columns: [
    { id: "pid", heading: "Prosp#", width: "4em", flags: "R" },
    { id: "name", heading: "Name", width: "20em", formatter: (row:any, td:HTMLTableCellElement) => {
      if (row.pid == 3) td.style.color = 'red'
      return row.name
    } },
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
    <BPopup as="anchor" linktext="History" ref="recentPopover">
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
    </BPopup>&nbsp;
    <BPopup as="anchor" linktext="Faves" ref="favesPopover">
      <BTable
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
    </form>
  </div>
  <ProspectComponent v-if="prospectStore.prospect" />
</template>
<style lang="css" scoped></style>
