<script setup lang="ts">
import { ref } from "vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();

const loginuid = ref('')
async function login() {
  logout()
  if (loginuid.value != '') {
    await userStore.login(loginuid.value)
    // console.dir(userStore.user)
  }
}
function logout() {
  userStore.logout()
}

</script>

<style scoped></style>

<template>
  <div v-if="userStore.user">
    {{ userStore.user.id }} ({{ userStore.user.fstnam }} {{ userStore.user.lstnam }}) &nbsp;
    <button @click="userStore.logout()">Logout</button>
  </div>
  <div v-else>
    <input v-model="loginuid" placeholder="Enter User ID" />
    <button @click="login()">Login</button>
  </div>
</template>
