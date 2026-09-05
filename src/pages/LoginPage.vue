<script setup lang="ts">
import { ref } from "vue";
import { appUserStore } from "../stores/AppUserStore";
import BIcon from "@/components/B/BIcon.vue";
const userStore = appUserStore();

const loginuid = ref("");
const loginpwd = ref("");


</script>

<template>
  <div class="centerme message warning" v-if="!userStore.isLoading">
    This system is for authorized users only. Unauthorized access or use is
    prohibited and subject to criminal and civil penalties.
    All activity may be monitored and recorded.
  </div>
  <form @submit.prevent="userStore.login(loginuid, loginpwd)" v-if="!userStore.isLoading">
    <table class="centerme form-table" style="margin-top: 1em;">
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
  <div class="message loading" v-if="userStore.isLoading">
    <div class="spinner" style="height: 1em; width: 1em;"></div>&nbsp;Logging In...
  </div>
  <div v-if="userStore.issue?.severity == 'FATAL'" style="color: maroon;">
    <BIcon icon="#red solid bug" /> {{ userStore.issue.message }}
  </div>
  <div v-if="userStore.issue?.severity == 'INFO'" style="color: sienna;">
    <BIcon icon="#sienna solid circle-exclamation" /> {{ userStore.issue.message }}
  </div>
</template>

<style lang="css" scoped>
.message {
  margin-top: 15vh;
  width: 30em;
  font-size: 0.8em;
  padding: 1em;
}
.warning {
  color: maroon;
}
.loading {
  font-size: 1.5em;
  text-align: center;
}
</style>
