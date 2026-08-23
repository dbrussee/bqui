<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { appProspectStore } from "../stores/ProspectStore.ts";
const prospectStore = appProspectStore();
import { appUserStore } from "../stores/AppUserStore.ts";
const userStore = appUserStore();
import { B } from "@/composables/BUtils";
import InfoBox from "./InfoBox.vue";
import FA from "./FA.vue";
// import BPopup from "./BPopup.vue";
import { useId, ref } from "vue";

const fave = (pid: number, isFavorite: boolean) => {
  prospectStore.setFavorite(pid, isFavorite);
};

const isCurrentlyFavorite = () => {
  if (!userStore.user || !userStore.user.faves || !prospectStore.prospect) return false;
  let rslt = false;
  for (let i = 0; i < userStore.user.faves.length; i++) {
    if (userStore.user.faves[i].pid == prospectStore.prospect.id) {
      rslt = true;
      break;
    }
  }
  return rslt;
}
const prospHandler = ref({
  id: useId(),
  temp: {} as any,
  edit: () => {
    prospHandler.value.temp = {...prospectStore.prospect}
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  save: () => {
    prospectStore.prospect = {...prospHandler.value.temp}
    prospectStore.updateProspect(prospectStore.prospect)
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  },
  abort: () => {
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  }
})
const prospectCSZ = (prosp:any) => {
  let cnty = prosp.county
  if (!cnty) cnty = "<span style='color:silver;'>No County</span>"
  return `${prosp.city}, ${prosp.state_cd}&nbsp; ${prosp.zip_cd} <i style='font-size: .9em'>(${cnty})</i>`
}

</script>

<style scoped>
.prospect_info {
  position: relative;
  min-height: 4.7em;
  /* background-color: pink; */
}
</style>

<template>
  <div class="prospect_info">
  <div v-if="prospectStore.issue?.severity == 'FATAL'">
    <FA color="red" icon="solid bug_">{{ prospectStore.issue.message }}</FA>
  </div>
  <div v-if="prospectStore.issue?.severity == 'INFO'">
    <FA color="sienna" icon="solid circle-exclamation_">{{ prospectStore.issue.message }}</FA>
  </div>

  <div v-if="prospectStore.isLoading">
    Loading...
  </div>
  <div v-if="!prospectStore.issue && !prospectStore.isLoading && !prospectStore.prospect" class="prospect_info">
    &nbsp;<FA icon="solid circle" color="sienna">No prospect loaded</FA>
  </div>
  <div v-if="!prospectStore.issue && !prospectStore.isLoading && prospectStore.prospect" class="prospect_info">
    Prospect ID: {{ prospectStore.prospect.id }}
    <InfoBox class="R2B" title="Prospect Details">
      <ul>
        <li>Agent of Record: {{ prospectStore.prospect.agent_id }}</li>
        <li>Subscribers:
          <ul>
            <li>Estimate: {{ prospectStore.prospect.subs_estimate }}</li>
            <li v-if="!prospectStore.prospect.census || prospectStore.prospect.census.length == 0">Census: <span style='color: red;'>None</span></li>
            <li v-else>Census: {{ prospectStore.prospect.census.length }}</li>
          </ul>
        </li>
        <li>Size Code: {{ prospectStore.prospect.size_cd }}</li>
        <li>Type: {{ prospectStore.prospect.group_type }}</li>
        <li>Created<ul>
          <li>By: {{ prospectStore.prospect.created_by }}</li>
          <li>On: {{ B.ts(prospectStore.prospect.created_ts) }}</li>
        </ul></li>
        <li v-if="prospectStore.prospect.last_quoted_ts">Last Quoted: {{ B.ts(prospectStore.prospect.last_quoted_ts) }}</li>
        <li v-if="prospectStore.prospect.enrolled_ts">Enrolled: {{ B.ts(prospectStore.prospect.enrolled_ts) + " as " + prospectStore.prospect.grpnum }}</li>
      </ul> </InfoBox
    >
    &nbsp;&nbsp;&nbsp;
    <FA tt="Set / Unset Favorite" :icon="isCurrentlyFavorite() ? 'solid heart_' : 'regular heart_'" clickable
      @click="fave(prospectStore.prospect.id, !isCurrentlyFavorite())"
      :color="isCurrentlyFavorite() ? 'darkred' : 'gray'"/>
    <div style="display: flex; align-items: flex-start;">
    <table class="form-table">
      <tbody>
        <tr><td><FA v-if="prospectStore.prospect" clickable @click="prospHandler.edit()" icon="edit_">{{ prospectStore.prospect ? prospectStore.prospect.name : '&nbsp;' }}</FA></td></tr>
        <tr><td>{{ prospectStore.prospect.addr1 }}{{ prospectStore.prospect.addr2 ? ', ' + prospectStore.prospect.addr2 : '' }}</td></tr>
        <tr><td v-html="prospectCSZ(prospectStore.prospect)"></td></tr>
      </tbody>
    </table>
    <table class="form-table" style="margin-left: 2em;">
      <tbody>
        <tr><td>{{prospectStore.prospect.contact}}</td></tr>
        <tr><td><a v-if="prospectStore.prospect.email" style="cursor: pointer"
          :href="'mailto:' + encodeURI(`${prospectStore.prospect.contact} <${prospectStore.prospect.email}>`)">{{prospectStore.prospect.email}}</a></td></tr>
        <tr><td>{{prospectStore.prospect.phone}}</td></tr>
      </tbody>
    </table>

    </div>
    </div>
  </div>

  <dialog v-if="prospectStore.prospect" :id="prospHandler.id">
    <form @submit.prevent="prospHandler.save()">
    <div class="titlebar">
      Edit Prospect {{ prospectStore.prospect.id }}
    </div>
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
            <button class="anchor" style="margin-right: .6em;" @click="prospHandler.abort()"><FA icon="solid x" style="color: red;" />Cancel</button>
            <button type="submit" class="action"><FA icon="floppy-disk_" /> Save Prospect</button>
          </div>
        </td></tr>
      </tbody>
    </table>
    </form>
  </dialog>
</template>
