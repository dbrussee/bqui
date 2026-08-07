<script setup lang="ts">
import { ref } from "vue";
import { appUserStore } from "../stores/AppUserStore";
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
          <td><input autofocus type="text" v-model="loginuid" /></td>
        </tr>
        <tr>
          <th>Password:</th>
          <td><input type="password" autocomplete="" v-model="loginpwd" /></td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: right">
            <button type="submit">Login</button>
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>

<style lang="css" scoped></style>
