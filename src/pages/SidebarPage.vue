<script setup lang="ts">
import SidebarItem from "@/components/SidebarItem.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appPageStore } from "@/stores/PageStore";
const pageStore = appPageStore();
</script>

<template>
  <div v-if="userStore.user">
    <SidebarItem
      @click="pageStore.page = 'PROSPECTS'"
      :current="pageStore.page == 'PROSPECTS'"
      >Prospects</SidebarItem
    >
    <SidebarItem
      @click="pageStore.page = 'MSGS'"
      :current="pageStore.page == 'MSGS'"
      >Messages</SidebarItem
    >
    <SidebarItem
      @click="pageStore.page = 'SETTINGS'"
      :current="pageStore.page == 'SETTINGS'"
      >Settings</SidebarItem
    >
  </div>
</template>

<style lang="css" scoped></style>
