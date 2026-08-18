<script setup lang="ts">
import { appProspectStore } from "../stores/ProspectStore";
const prospectStore = appProspectStore();
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { B } from "@/composables/BUtils";
import InfoBox from "./InfoBox.vue";
import FA from "./FA.vue";
import BPopup from "./BPopup.vue";

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

</script>

<style scoped></style>

<template>
  <div v-if="prospectStore.prospect.id">
    Prospect ID: {{ prospectStore.prospect.id }}
    <InfoBox class="R2B" title="Prospect Details">
      <ul>
        <li>Agent of Record: {{ prospectStore.prospect.agent_id }}</li>
        <li>Subscribers:
          <ul>
            <li>Estimate: {{ prospectStore.prospect.subs_estimate }}</li>
            <li>Census: <span style='color: red;'>None</span></li>
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
    [
    <FA :icon="isCurrentlyFavorite() ? 'solid heart' : 'regular heart'"
     @click="fave(prospectStore.prospect.id, !isCurrentlyFavorite())"
     :style="{cursor: 'pointer', color: isCurrentlyFavorite() ? 'crimson' : 'gray'}" />

    <BPopup ref="editProspectPopup" :title="'Edit Prospect ' + prospectStore.prospect.id" class="CENTER" manual
      linkicon="edit" linktext=""
      :buttons="[
        {icon:'solid x', text:'Cancel', class:'anchor', iconcolor: 'red', action:() => {
          prospectStore.getProspect(prospectStore.prospect.id)
          return true
        }},
        {icon:'solid users', text:'Save Prospect', class:'modern', action:() => {
          if (prospectStore.prospect.name == '') return false
          prospectStore.updateProspect(prospectStore.prospect)
          return true
        }}
      ]"
      >
      <table class="form-table">
        <tbody>
          <tr><th>Group Name:</th><td><input style="width: 30em;" v-model="prospectStore.prospect.name"></td></tr>
          <tr><th>Contact:</th><td><input style="width: 30em;" v-model="prospectStore.prospect.contact"></td></tr>
          <tr><th>Email:</th><td><input style="width: 30em;" v-model="prospectStore.prospect.email"></td></tr>
          <tr><th>Phone:</th><td><input style="width: 12em;" v-model="prospectStore.prospect.phone"></td></tr>
          <tr><th>Subscribers:</th><td><input style="width: 5em;" v-model="prospectStore.prospect.subs_estimate"> <span class="info">(estimate)</span></td></tr>
          <tr><th>Address:</th><td><input style="width: 30em;" v-model="prospectStore.prospect.addr1"></td></tr>
          <tr><th></th><td><input style="width: 30em;" v-model="prospectStore.prospect.addr2"></td></tr>
          <tr><th></th><td>
            <input style="width: 12em; margin-right: .3em;" v-model="prospectStore.prospect.city">
            <input style="width: 3em; margin-right: .3em;" v-model="prospectStore.prospect.state_cd">
            <input style="width: 6em;" v-model="prospectStore.prospect.zip_cd">
          </td></tr>
          <tr><th>Enroll Date:</th><td><input style="width: 10em;" v-model="prospectStore.prospect.enroll_date"></td></tr>
        </tbody>
      </table>
    </BPopup>]
    <p />
    {{ prospectStore.prospect.name }}<br />
    &nbsp;{{ prospectStore.prospect.addr1 }}<br />
    <template v-if="prospectStore.prospect.addr2">&nbsp;{{ prospectStore.prospect.addr2 }}<br /></template>
    &nbsp;{{ prospectStore.prospect.city }}, {{ prospectStore.prospect.state_cd }}&nbsp;
    {{ prospectStore.prospect.zip_cd }} ({{ prospectStore.prospect.county ? prospectStore.prospect.county : 'No County' }})
  </div>
  <div v-else>
    <div v-if="prospectStore.isLoading">
      Loading...
    </div>
    <div v-if="prospectStore.issue?.severity == 'FATAL'" style="color: maroon;">
      <FA style="color: red;" icon="solid bug_" />{{ prospectStore.issue.message }}
    </div>
    <div v-if="prospectStore.issue?.severity == 'INFO'" style="color: sienna;">
      <FA style="color: sienna;" icon="solid circle-exclamation_" />{{ prospectStore.issue.message }}
    </div>
  </div>
</template>
