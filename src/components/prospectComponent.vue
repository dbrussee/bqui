<script setup lang="ts">
import { appProspectStore } from "../stores/ProspectStore";
const prospectStore = appProspectStore();
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { B } from "@/composables/BUtils";
import InfoBox from "./InfoBox.vue";
import FA from "./FA.vue";

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
};
</script>

<style scoped></style>

<template>
  <div v-if="prospectStore.prospect.id">
    <FA :icon="isCurrentlyFavorite() ? 'solid heart' : 'regular heart'"
     @click="fave(prospectStore.prospect.id, !isCurrentlyFavorite())"
     :style="{cursor: 'pointer', color: isCurrentlyFavorite() ? 'crimson' : 'gray'}" />
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
    ><br />
    Name: {{ prospectStore.prospect.name }}<br />
    {{ prospectStore.prospect.addr1 }}<br />
    <span v-if="prospectStore.prospect.addr2">{{ prospectStore.prospect.addr2 }}<br /></span>
    {{ prospectStore.prospect.city }}, {{ prospectStore.prospect.state_cd }}&nbsp;
    {{ prospectStore.prospect.zip_cd }} ({{ prospectStore.prospect.county }})
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
