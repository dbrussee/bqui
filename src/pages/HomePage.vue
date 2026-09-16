<script setup lang="ts">
import { appUserStore } from '../stores/AppUserStore'
const userStore = appUserStore()
// import APIIssue from '@/components/APIIssue.vue'
import { appPageStore } from '@/stores/PageStore';
const pageStore = appPageStore()
import SettingsPage from './SettingsPage.vue'
import LoginPage from './LoginPage.vue'
import ProspectsPage from './ProspectsPage.vue'
import ProposalsPage from './ProposalsPage.vue';
import MessagesPage from './MessagesPage.vue'
import CensusPage from './CensusPage.vue';


</script>

<template>
  <div v-if="userStore.user">
    <KeepAlive><ProspectsPage v-if="pageStore.page == 'PROSPECTS'" /></KeepAlive>
    <CensusPage v-if="pageStore.page == 'CENSUS'" />
    <MessagesPage v-if="pageStore.page == 'MSGS'" />
    <SettingsPage v-if="pageStore.page == 'SETTINGS'" />
    <ProposalsPage v-if="pageStore.page == 'PROPOSALS'" />
  </div>
  <div v-else>
    <LoginPage />
  </div>
</template>

<style scoped></style>
