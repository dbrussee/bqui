<script setup lang="ts">
import SidebarItem from "@/components/SidebarItem.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appPageStore } from "@/stores/PageStore";
const pageStore = appPageStore();
import { appProspectStore } from "@/stores/ProspectStore";
import { onRenderTriggered } from "vue";
import FA from "@/components/FA.vue";
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
      ><FA icon='shop' ver="solid" /> Prospect: {{ prospectStore.prospect && prospectStore.prospect.id ? ' ID: ' + prospectStore.prospect.id : ' none' }}
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'MSGS'" :current="pageStore.page == 'MSGS'"
      ><FA icon='envelope' /> Messages</SidebarItem
    >
    <SidebarItem @click="pageStore.page = 'SETTINGS'" :current="pageStore.page == 'SETTINGS'"
      ><FA icon='sliders' ver="solid" /> Settings</SidebarItem
    >
  </div>
  <data v-else>
    <SidebarItem>Login</SidebarItem>
  </data>
</template>

<style lang="css" scoped>
</style>
