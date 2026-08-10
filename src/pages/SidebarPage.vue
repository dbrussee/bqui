<script setup lang="ts">
import SidebarItem from "@/components/SidebarItem.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appPageStore } from "@/stores/PageStore";
const pageStore = appPageStore();
import { appProspectStore } from "@/stores/ProspectStore";
import { onRenderTriggered } from "vue";
const prospectStore = appProspectStore();

onRenderTriggered(() => {
  if (userStore.user && userStore.user.recents) {
    if (userStore.user.recents.length > 0) {
      if (!prospectStore.prospect) {
        prospectStore.getProspect(userStore.user.recents[0].pid);
      }
    }
  }
})
</script>

<template>
  <div v-if="userStore.user">
    <SidebarItem @click="pageStore.page = 'PROSPECTS'" :current="pageStore.page == 'PROSPECTS'"
      >Prospect{{ prospectStore.prospect && prospectStore.prospect.id ? ' ID: ' + prospectStore.prospect.id : '' }}
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'MSGS'" :current="pageStore.page == 'MSGS'"
      >Messages</SidebarItem
    >
    <SidebarItem @click="pageStore.page = 'SETTINGS'" :current="pageStore.page == 'SETTINGS'"
      >Settings</SidebarItem
    >
  </div>
  <data v-else>
    <SidebarItem>Login</SidebarItem>
  </data>
</template>

<style lang="css" scoped>
</style>
