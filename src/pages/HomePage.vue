<script setup lang="ts">
import { appUserStore } from '../stores/AppUserStore'
const userStore = appUserStore()
import { appPageStore } from '@/stores/PageStore';
const pageStore = appPageStore()
import { appProspectStore } from '@/stores/ProspectStore';
const pStore = appProspectStore()
import SettingsPage from './SettingsPage.vue'
import LoginPage from './LoginPage.vue'
import ProspectsPage from './ProspectsPage.vue'
import ProposalsPage from './ProposalsPage.vue';
import MessagesPage from './MessagesPage.vue'
import CensusPage from './CensusPage.vue';
import DashboardPage from './DashboardPage.vue';
import { watch } from 'vue';


watch(
  [() => pageStore.page, () => pStore.prospect],
  ([newPage, newProspect]) => {
    // Check to ensure the prospect object and ID exist before setting title
    let prospText = ""
    if (newProspect && newProspect.name) {
      prospText = ` - ${newProspect.name}`
    }

    let pageText = ""
    switch(newPage) {
      case 'DASHBOARD': pageText = " 🗓️"; break
      case 'PROSPECTS': pageText = " ⌂"; break
      case 'CENSUS': pageText = " 🧑‍🧑‍🧒‍🧒"; break
      case 'MSGS': pageText = " ✉"; break
      case 'SETTINGS': pageText = " ⚙️"; break
      case 'PROPOSALS': pageText = " 🤝"; break
    }
    pageText = "" // Ignore for now, just show the prospect name in the title
    document.title = `BlueQuote${pageText}${prospText}`
  },
  { immediate: true, deep: true }
)


</script>

<template>
  <div v-if="userStore.user">
    <DashboardPage v-if="pageStore.page == 'DASHBOARD'" />
    <ProspectsPage v-if="pageStore.page == 'PROSPECTS'" />
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
