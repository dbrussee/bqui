<script setup lang="ts">
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();

</script>

<style scoped></style>

<template>
  <div v-if="userStore.user">
    {{ userStore.user.id }} ({{ userStore.user.fstnam }} {{ userStore.user.lstnam }}) &nbsp;
    <button @click="userStore.logout()">Logout</button>
  </div>
</template>
