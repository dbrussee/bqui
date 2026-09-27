<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue'
import MainPage from './pages/MainPage.vue'
import NewProspectPopup from './popups/NewProspect/NewProspectPopup.vue';
import SearchProspectPopup from './popups/SearchProspect/SearchProspectPopup.vue';
import { appStore } from './stores/AppStore.ts';
import { appUserStore } from './stores/AppUserStore.ts';
const userStore = appUserStore()
appStore().initialize()

const theme = localStorage.getItem("bq-ui-theme")
if (theme) {
  userStore.applyTheme(theme)
}

</script>

<style scoped></style>

<template>
  <MainPage />
  <ToastContainer />
  <NewProspectPopup />
  <SearchProspectPopup />

</template>
