<script setup lang="ts">
import BConfirm from "./B/BConfirm.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appProspectStore } from "@/stores/ProspectStore";
const prospStore = appProspectStore();


</script>

<style scoped></style>

<template>
  <span v-if="userStore.user">
    {{ userStore.user.id }} ({{ userStore.user.fstnam }} {{ userStore.user.lstnam }}) &nbsp;
    <BConfirm pos="T" @confirm="userStore.logout()">
      Logout&hellip;
      <template #message>
        Log out user '{{ userStore.user.id }}'
        <p v-if="prospStore.censusDirty" style="color:red">You will lose unsaved census changes!</p>
      </template>
    </BConfirm>
  </span>

</template>
