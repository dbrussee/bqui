<script setup lang="ts">
import { appProspectStore } from "../stores/ProspectStore";
const prospectStore = appProspectStore();
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { B } from "@/composables/BUtils";
import InfoBox from "./InfoBox.vue";

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
    Prospect ID: {{ prospectStore.prospect.id }}
    <InfoBox>
      <ul>
        <li>
          {{ prospectStore.prospect.subs_estimate }}
          {{ B.plural(prospectStore.prospect.subs_estimate, " Subscriber") }} on census
        </li>
        <li>Code: {{ prospectStore.prospect.size_cd }}</li>
        <li>Type: {{ prospectStore.prospect.group_type }}</li>

        <li>
          Created By: {{ prospectStore.prospect.created_by }}
        </li>
        <li>
          Created On: {{ B.ts(prospectStore.prospect.created_ts) }}
        </li>
        <li v-if="prospectStore.prospect.last_quoted_ts">
          Last Quoted: {{ B.ts(prospectStore.prospect.last_quoted_ts) }}
        </li>
        <li v-if="prospectStore.prospect.enrolled_ts">
          Enrolled:
          {{ B.ts(prospectStore.prospect.enrolled_ts) + " as " + prospectStore.prospect.grpnum }}
        </li>
      </ul> </InfoBox
    ><br />
    Name: {{ prospectStore.prospect.name }}<br />
    {{ prospectStore.prospect.addr1 }}<br />
    <span v-if="prospectStore.prospect.addr2">{{ prospectStore.prospect.addr2 }}<br /></span>
    {{ prospectStore.prospect.city }}, {{ prospectStore.prospect.state_cd }}&nbsp;
    {{ prospectStore.prospect.zip_cd }} ({{ prospectStore.prospect.county }})
    <div v-if="isCurrentlyFavorite()">
      <button class="anchor" @click="fave(prospectStore.prospect.id, false)">Un-Favorite</button>
    </div>
    <div v-else>
      <button class="anchor" @click="fave(prospectStore.prospect.id, true)">Favorite</button>
    </div>
  </div>
  <div v-else>
    <slot />
  </div>
</template>
