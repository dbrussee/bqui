<script setup lang="ts">
import { ref } from "vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appProspectStore } from "@/stores/ProspectStore";
const prospectStore = appProspectStore();
import ProspectComponent from "@/components/prospectComponent.vue";

const prospect_id = ref("");
const pickedFave = ref("");
const pickedRecent = ref("");
function pickFave() {
  prospectStore.getProspect(pickedFave.value);
  pickedFave.value = "";
}
function pickRecent() {
  prospectStore.getProspect(pickedRecent.value);
  pickedRecent.value = "";
}

</script>
<template>
  &nbsp;<select v-model="pickedFave" @change="pickFave()">
    <option value="" selected>Select a favorite...</option>
    <option v-for="fave in userStore.user.faves" :key="fave.pid" :value="fave.pid">
      {{ fave.name }}
    </option>
  </select>
  &nbsp;<select v-model="pickedRecent" @change="pickRecent()">
    <option value="" selected>Select a recent...</option>
    <option v-for="recent in userStore.user.recents" :key="recent.pid" :value="recent.pid">
      {{ recent.name }}
    </option>
  </select>

  &nbsp;<input v-model="prospect_id" placeholder="Prospect ID" /> &nbsp;<button
    @click="prospectStore.getProspect(prospect_id)"
  >
    Load
  </button>
  <br />
  <ProspectComponent v-if="prospectStore.prospect" />
</template>
<style lang="css" scoped></style>
