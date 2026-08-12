<script setup lang="ts">
import { appUserStore } from "../stores/AppUserStore";
import UserConfirm from "./UserConfirm.vue";
const userStore = appUserStore();

</script>

<style scoped></style>

<template>
  <div v-if="userStore.user">
    {{ userStore.user.id }} ({{ userStore.user.fstnam }} {{ userStore.user.lstnam }}) &nbsp;
    <UserConfirm class="B2L" @confirm="userStore.logout()" linktext="Logout&hellip;"/>
  </div>
</template>
