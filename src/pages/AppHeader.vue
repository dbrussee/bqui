<script setup lang="ts">
import UserComponent from '@/components/UserComponent.vue';
import { appUserStore } from '@/stores/AppUserStore';
const userStore = appUserStore()
import { B } from '@/composables/BUtils';
import InfoBox from '@/components/InfoBox.vue';
</script>

<template>
  <div class="container">
    <div class="logo-area">
      <i><b>B</b>lueQuote</i>
    </div>
    <div class="user-area">
      <InfoBox title="This is the logged in user info" v-if="userStore.user" class="B2R">
        <ul>
          <li>ID: {{ userStore.user.id }}</li>
          <li>First Name: {{ userStore.user.fstnam }}</li>
          <li>Last Name: {{ userStore.user.lstnam }}</li>
          <li>Status: {{ userStore.user.status }}</li>
          <li>Email: {{ userStore.user.email }}</li>
          <li>Logged in: {{ B.ts(userStore.user.lst_login) }}</li>
        </ul>
      </InfoBox>

      <UserComponent>Not logged in</UserComponent>
    </div>
    <div class="meta-area">
    </div>
  </div>
</template>

<style scoped>
  .container {
    display: grid;
    grid-template-columns: 200px 1fr 100px;
  }
  .meta-area {
    text-align: right;
    font-size: .7em;
  }
</style>
