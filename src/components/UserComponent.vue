<script setup lang="ts">
import BConfirm from "./B/BConfirm.vue";
import { appUserStore } from "../stores/AppUserStore";
const uStore = appUserStore();
import { appProspectStore } from "@/stores/ProspectStore";
const pStore = appProspectStore();


</script>

<style scoped></style>

<template>
  <span v-if="uStore.user">
    {{ uStore.user.id }} ({{ uStore.user.fstnam }} {{ uStore.user.lstnam }}) &nbsp;
    <BConfirm pos="T" @confirm="uStore.logout()">
      Logout&hellip;
      <template #message>
        Log out user '{{ uStore.user.id }}'
        <p v-if="pStore.censusDirty" style="color:red">You will lose unsaved census changes!</p>
      </template>
    </BConfirm>
  </span>

</template>
