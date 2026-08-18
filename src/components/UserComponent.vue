<script setup lang="ts">
import { appUserStore } from "../stores/AppUserStore";
import UserConfirm from "./UserConfirm.vue";
const userStore = appUserStore();

</script>

<style scoped></style>

<template>
  <span v-if="userStore.user">
    {{ userStore.user.id }} ({{ userStore.user.fstnam }} {{ userStore.user.lstnam }}) &nbsp;
    <UserConfirm class="B2L theme_light" @confirm="userStore.logout()" linktext="Logout&hellip;">
      Log out as '{{ userStore.user.id }}'?
    </UserConfirm>
  </span>
</template>
