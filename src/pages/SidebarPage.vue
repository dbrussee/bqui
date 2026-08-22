<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import SidebarItem from "@/components/SidebarItem.vue";
import { appMessageStore } from "@/stores/MessagesStore";
const messageStore = appMessageStore()
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

function getProspectID():string {
  if (!prospectStore.prospect) return " no prosp"
  if (prospectStore.isLoading) return " Loading..."
  if (prospectStore.prospect.id) return " ID " + prospectStore.prospect.id
  return ' unknown'
}
function getUnreadMessageCounts():string {
  if (messageStore.messages.length == 0) return "none"
  const unread = messageStore.unreadCount()
  if (unread > 0) {
    const unread_msg = "<span style='color: white; background-color: red; border-radius: 50%; padding: 0 .4em;'>" + unread + "</span>"
    if (unread == messageStore.messages.length) return unread_msg
    return `${unread_msg} / ${messageStore.messages.length}`
  }
  return messageStore.messages.length.toString()
}
function getCensusCount():string {
  let msg = " Unknown"
  if (!prospectStore.prospect) {
    msg = " no prosp"
  } else if (prospectStore.isLoading) {
    msg = " Loading..."
  } else if (prospectStore.prospect.census) {
    if (prospectStore.prospect.census.length == 0) {
      msg = " none"
    } else {
      let gtotal = 0
      prospectStore.prospect.census.forEach((sub:any) => {
        gtotal++
        gtotal += sub.deps.length
      })
      if (gtotal == prospectStore.prospect.census.length) {
        msg = ' ' + gtotal.toString()
      } else {
        msg = ` ${prospectStore.prospect.census.length} / ${gtotal}`
      }
    }
  }
  if (prospectStore.censusDirty) msg += " <i class='fa-solid fa-floppy-disk' style='color: red; font-size: 1.2em;' />"
  return msg
}
</script>

<template>
  <div v-if="userStore.user">
    <SidebarItem @click="pageStore.page = 'PROSPECTS'" :current="pageStore.page == 'PROSPECTS'"
      ><FA icon='building_' />Prospect<span style='font-size: .8em;'>{{ getProspectID() }}</span>
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'CENSUS'" :current="pageStore.page == 'CENSUS'"
      ><FA icon='solid people-group_' />Census: <span style='font-size: .8em;' v-html="getCensusCount()"></span>
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'MSGS'" :current="pageStore.page == 'MSGS'"
      ><FA icon='envelope_' />Messages: <span style="font-size: .8em;" v-html="getUnreadMessageCounts()"/></SidebarItem
    >
    <SidebarItem @click="pageStore.page = 'SETTINGS'" :current="pageStore.page == 'SETTINGS'"
      ><FA icon='solid gear_' />Settings</SidebarItem
    >
  </div>
  <data v-else>
    <SidebarItem>Login</SidebarItem>
  </data>
</template>

<style lang="css" scoped>
</style>
