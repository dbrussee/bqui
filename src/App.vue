<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue'
import MainPage from './pages/MainPage.vue'
import NewProspectPopup from './popups/NewProspect/NewProspectPopup.vue';
import SearchProspectPopup from './popups/SearchProspect/SearchProspectPopup.vue';
import { appStore } from './stores/AppStore.ts';
appStore().initialize()

</script>

<style scoped></style>

<template>
  <MainPage />
  <ToastContainer />
  <NewProspectPopup />
  <SearchProspectPopup />

</template>
