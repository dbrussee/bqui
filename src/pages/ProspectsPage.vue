<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useId } from "vue";
import { appProspectStore } from "@/stores/ProspectStore";
const prospectStore = appProspectStore();
import ProspectComponent from "@/components/ProspectComponent.vue";
import FA from "@/components/FA.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();

const favesPopover = ref()
const recentPopover = ref()

const prospect_id = ref("");
import BTable from "@/components/BTable.vue";
import BPopup from "@/components/BPopup.vue";
import QuoteListComponent from "@/components/QuoteListComponent.vue";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { id: "name", heading: "Name", width: "20em", formatter: (row:any, td:HTMLTableCellElement) => {
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
    prospectStore.createProspect(prospHandler.value.temp)
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  },
  abort: () => {
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  }
})

</script>
<template>
  <div class="drop_menu">
    <BPopup as="anchor" linkicon="solid list_" linktext="Recent" class="B2R"
      ref="recentPopover"
      :buttons="[
        {
          text: (!userStore.user.recents || userStore.user.recents.length == 0 ? '' : 'Clear History'),
          action: () => clearRecents(),
          confirm: `Are you sure you want to delete history?<p style='color:red;'>It cannot be undone!`
        }
      ]">
      <BTable
        :rows="userStore.user.recents"
        :config="cfgRecents"
        @pick="(row: any) => pickRecent(row.pid)"
      />
    </BPopup>&nbsp;
    <BPopup as="anchor" linkicon="regular heart_" linktext="Favorites" ref="favesPopover" class="B2R">
      <BTable
        :rows="userStore.user.faves"
        :config="cfgFaves"
        @pick="(row: any) => pickFave(row.pid)"
      />
    </BPopup>&nbsp;
    <FA clickable @click="prospHandler.edit()" icon="square-plus_" >New</FA>&nbsp;
    <form
      style="display: inline-block"
      @submit.prevent="prospectStore.getProspect(prospect_id, true)"
    >
      &nbsp;<input v-model="prospect_id" size="8" placeholder="Prosp #" />
      <button type="submit">Load</button>
    </form>&nbsp;
  </div>
  <ProspectComponent v-if="prospectStore.prospect" />

  <QuoteListComponent v-if="prospectStore.prospect" width="calc(100vw - 200px - 2em)" height="calc(100vh - 15em)" style="margin-top: .5em;"/>

  <dialog :id="prospHandler.id">
    <div class="titlebar">New Prospect</div>
    <table class="form-table">
      <tbody>
        <tr><th>Group Name:</th><td><input style="width: 30em;" v-model="prospHandler.temp.name"></td></tr>
        <tr><th>Contact:</th><td><input style="width: 30em;" v-model="prospHandler.temp.contact"></td></tr>
        <tr><th>Email:</th><td><input style="width: 30em;" v-model="prospHandler.temp.email"></td></tr>
        <tr><th>Phone:</th><td><input style="width: 12em;" v-model="prospHandler.temp.phone"></td></tr>
        <tr><th>Subscribers:</th><td><input style="width: 5em;" v-model="prospHandler.temp.subs_estimate"> <span class="info">(estimate)</span></td></tr>
        <tr><th>Address:</th><td><input style="width: 30em;" v-model="prospHandler.temp.addr1"></td></tr>
        <tr><th></th><td><input style="width: 30em;" v-model="prospHandler.temp.addr2"></td></tr>
        <tr><th></th><td>
          <input style="width: 12em; margin-right: .3em;" v-model="prospHandler.temp.city">
          <input style="width: 3em; margin-right: .3em;" v-model="prospHandler.temp.state_cd">
          <input style="width: 6em;" v-model="prospHandler.temp.zip_cd">
        </td></tr>
        <tr><th>Enroll Date:</th><td><input style="width: 10em;" v-model="prospHandler.temp.enroll_date"></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <button @click="prospHandler.abort()" class="anchor" style="margin-right: .5em;"><FA icon="solid x" style="color:red;"/>Cancel</button>
            <button @click="prospHandler.save()" class="action"><FA icon="solid users_"/>Create Prospect</button>
          </div>
        </td></tr>
      </tbody>
    </table>
  </dialog>

</template>
<style lang="css" scoped></style>
