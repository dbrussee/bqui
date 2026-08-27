<script setup lang="ts">
import BInfo from "./B/BInfo.vue";
import { B } from "@/composables/BUtils.ts";
import BConfirm from "./B/BConfirm.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();


</script>

<style scoped></style>

<template>
  <span v-if="userStore.user">
    <BInfo heading="Logged in user info" v-if="userStore.user" pos="B2R">
      <ul>
        <li>ID: {{ userStore.user.id }}</li>
        <li>First Name: {{ userStore.user.fstnam }}</li>
        <li>Last Name: {{ userStore.user.lstnam }}</li>
        <li>Status: {{ userStore.user.status }}</li>
        <li>Email: {{ userStore.user.email }}</li>
        <li>Logged in: {{ B.ts(userStore.user.lst_login) }}</li>
      </ul>
    </BInfo>

    {{ userStore.user.id }} ({{ userStore.user.fstnam }} {{ userStore.user.lstnam }}) &nbsp;
    <BConfirm pos="B2L" @confirm="userStore.logout()">
      Logout&hellip;
      <template #message>Log out user '{{ userStore.user.id }}'</template>
    </BConfirm>
  </span>

</template>
