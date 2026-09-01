<script setup lang="ts">
import { ref } from "vue";
import { appUserStore } from "../stores/AppUserStore";
import BIcon from "@/components/B/BIcon.vue";
const userStore = appUserStore();

const loginuid = ref("");
const loginpwd = ref("");


</script>

<template>
  <form @submit.prevent="userStore.login(loginuid, loginpwd)">
    <table class="centerme form-table" style="margin-top: 15vh">
      <tbody>
        <tr>
          <th>Username:</th>
          <td><input name="loginName" autofocus type="text" v-model="loginuid" /></td>
        </tr>
        <tr>
          <th>Password:</th>
          <td><input name="loginPass" type="password" autocomplete="" v-model="loginpwd" /></td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: right">
            <button :disabled="userStore.isLoading" type="submit">Login</button>
          </td>
        </tr>
      </tbody>
    </table>
  </form>
  <div v-if="userStore.isLoading">
    Loading...
  </div>
  <div v-if="userStore.issue?.severity == 'FATAL'" style="color: maroon;">
    <BIcon icon="#red solid bug" /> {{ userStore.issue.message }}
  </div>
  <div v-if="userStore.issue?.severity == 'INFO'" style="color: sienna;">
    <BIcon icon="#sienna solid circle-exclamation" /> {{ userStore.issue.message }}
  </div>
</template>

<style lang="css" scoped></style>
