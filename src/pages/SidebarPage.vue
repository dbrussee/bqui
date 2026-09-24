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
const prospStore = appProspectStore();
// import { QuoteStore } from "@/stores/QuoteStore";
// const quoteStore = QuoteStore()
import { computed, onRenderTriggered } from "vue";

onRenderTriggered(() => {
  if (userStore.user && userStore.user.recents) {
    if (userStore.user.recents.length > 0) {
      if (!prospStore.prospect) {
        prospStore.getProspect(userStore.user.recents[0].pid);
      }
    }
  }
})

function getProspectID():string {
  if (!prospStore.prospect?.id) return ""
  if (prospStore.prospect.id) return " #" + prospStore.prospect.id
  return ' unknown'
}
function getProspectName():string {
  if (!prospStore.prospect?.id) return "No Prospect"
  if (prospStore.prospWorking != null) return prospStore.prospWorking as string
  if (prospStore.prospect.name) return prospStore.prospect.name
  return 'Unknown '
}
function getProposalsCount():string {
  if (!prospStore.prospect?.id) return "No Prospect"
  // if (quoteStore.working) return quoteStore.working
  if (prospStore.prospect.name) return "None"
  return 'Unknown '
}
function getUnreadMessageCounts():string {
  if (messageStore.working) return messageStore.working
  if (messageStore.messages.length == 0) return "None"
  const unread = messageStore.unreadCount()
  if (unread > 0) {
    const unread_msg = "<span style='color: white; background-color: red; border-radius: 50%; padding: 0 .4em;'>" + unread + "</span>"
    // if (unread == messageStore.messages.length) return unread_msg
    return `Count: ${messageStore.messages.length}, Unread: ${unread_msg}`
  }
  return `Count: ${messageStore.messages.length.toString()}`
}
function getCensusCount():string {
  let msg = "Unknown"
  if (!prospStore.prospect?.id) {
    msg = "No Prospect"
  } else if (prospStore.censusWorking) {
    msg = prospStore.censusWorking
  } else if (prospStore.prospect.census) {
    if (prospStore.prospect.census.length == 0) {
      msg = "None"
    } else {
      let gtotal = 0
      prospStore.prospect.census.forEach((sub:any) => {
        gtotal++
        gtotal += sub.deps.length
      })
      if (gtotal == prospStore.prospect.census.length) {
        msg = 'Subs: ' + gtotal.toString()
      } else {
        msg = `Subs: ${prospStore.prospect.census.length} / Total: ${gtotal}`
      }
    }
  }
  // if (prospectStore.censusDirty) msg += " <i class='fa-solid fa-floppy-disk' style='color: red; font-size: 1.2em;' />"
  return msg
}
const getUserSidebar = computed(():string => {
  return userStore.getUserSetting('sidebar', 'full')
})

</script>

<template>
  <div v-if="userStore.user">
    <SidebarItem @click="pageStore.page = 'PROSPECTS'" :current="pageStore.page == 'PROSPECTS'"
        :mode="getUserSidebar"
        icon="solid shop_"
        :working="prospStore.prospWorking"
        :shortname="`Prospect<span style='font-size: .8em;'>${ getProspectID() }</span>`"
        :longname="getProspectName()" />
    <SidebarItem @click="pageStore.page = 'PROPOSALS'" :current="pageStore.page == 'PROPOSALS'"
        :mode="getUserSidebar"
        icon="file-pdf_"
        shortname="Proposals"
        :longname="getProposalsCount()" />
    <SidebarItem @click="pageStore.page = 'CENSUS'" :current="pageStore.page == 'CENSUS'"
        :mode="getUserSidebar"
        :icon="prospStore.censusDirty ? '#red solid people-group_' : 'solid people-group_'"
        :working="prospStore.censusWorking"
        shortname="Census"
        :longname="getCensusCount()" />
    <SidebarItem @click="pageStore.page = 'MSGS'" :current="pageStore.page == 'MSGS'"
        :mode="getUserSidebar"
        :badge="messageStore.unreadCount()"
        icon="envelope_"
        :working="messageStore.working"
        shortname="Messages"
        :longname="getUnreadMessageCounts()" />
    <SidebarItem @click="pageStore.page = 'SETTINGS'" :current="pageStore.page == 'SETTINGS'"
        :mode="getUserSidebar"
        icon="circle-user_"
        :working="userStore.working"
        :shortname="userStore.user.id"
        :longname="(userStore.user.fstnam + ' ' + userStore.user.lstnam).trim()" />
  </div>
  <data v-else>
    <!-- <SidebarItem>Login</SidebarItem> -->
  </data>
</template>

<style lang="css" scoped>
</style>
