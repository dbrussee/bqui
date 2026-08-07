<script setup lang="ts">
import { appUserStore } from '../stores/AppUserStore'
const userStore = appUserStore()
import APIIssue from '@/components/APIIssue.vue'
import SettingsPage from './SettingsPage.vue'
import LoginPage from './LoginPage.vue'
import { appPageStore } from '@/stores/PageStore';
import ProspectsPage from './ProspectsPage.vue'
import MessagesPage from './MessagesPage.vue'
const pageStore = appPageStore()
</script>

<template>
  <div v-if="userStore.user">
    <ProspectsPage v-if="pageStore.page == 'PROSPECTS'" />
    <MessagesPage v-if="pageStore.page == 'MSGS'" />
    <SettingsPage v-if="pageStore.page == 'SETTINGS'" />
  </div>
  <div v-else>
    <LoginPage />
  </div>
  <APIIssue v-if="userStore.issue" :issue="userStore.issue"></APIIssue>
</template>

<style scoped></style>
