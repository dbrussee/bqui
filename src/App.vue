<script setup lang="ts">
import MainPage from './pages/MainPage.vue'
import { appStore } from './stores/AppStore.ts';
appStore().initialize()

</script>

<style scoped></style>

<template>
  <MainPage />
</template>
