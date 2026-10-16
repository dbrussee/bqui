<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import SidebarItem from "@/components/SidebarItem.vue";
import { appMessageStore } from "@/stores/MessagesStore";
const msgStore = appMessageStore()
import { appUserStore } from "../stores/AppUserStore";
const uStore = appUserStore();
import { appPageStore } from "@/stores/PageStore";
const pageStore = appPageStore();
import { appProspectStore } from "@/stores/ProspectStore";
const pStore = appProspectStore();

function getProspectID():string {
  if (!pStore.prospect?.id) return ""
  if (pStore.prospect.id) return " #" + pStore.prospect.id
  return ' unknown'
}
function getProspectName():string {
  if (!pStore.prospect?.id) return "No Prospect"
  if (pStore.prospWorking != null) return pStore.prospWorking as string
  if (pStore.prospect.name) return pStore.prospect.name
  return 'Unknown '
}
function getProposalsCount():string {
  if (!pStore.prospect?.id) return "No Prospect"
  // if (quoteStore.working) return quoteStore.working
  if (pStore.prospect.name) return "None"
  return 'Unknown '
}
function getUnreadMessageCounts():string {
  if (msgStore.working) return msgStore.working
  if (msgStore.messages.length == 0) return "None"
  const unread = msgStore.unreadCount()
  if (unread > 0) {
    const unread_msg = "<span style='color: white; background-color: red; border-radius: 50%; padding: 0 .4em;'>" + unread + "</span>"
    // if (unread == messageStore.messages.length) return unread_msg
    return `Count: ${msgStore.messages.length}, Unread: ${unread_msg}`
  }
  return `Count: ${msgStore.messages.length.toString()}`
}
function getCensusCount():string {
  let msg = "Unknown"
  if (!pStore.prospect?.id) {
    msg = "No Prospect"
  } else if (pStore.censusWorking) {
    msg = pStore.censusWorking
  } else if (pStore.prospect.census) {
    if (pStore.prospect.census.length == 0) {
      msg = "None"
    } else {
      let gtotal = 0
      pStore.prospect.census.forEach((sub:any) => {
        gtotal++
        gtotal += sub.deps.length
      })
      if (gtotal == pStore.prospect.census.length) {
        msg = 'Subs: ' + gtotal.toString()
      } else {
        msg = `Subs: ${pStore.prospect.census.length} / Total: ${gtotal}`
      }
    }
  }
  // if (prospectStore.censusDirty) msg += " <i class='fa-solid fa-floppy-disk' style='color: red; font-size: 1.2em;' />"
  return msg
}

</script>

<template>
  <div v-if="uStore.user">
    <SidebarItem @click="pageStore.page = 'DASHBOARD'" :current="pageStore.page == 'DASHBOARD'"
        icon="solid chart-simple_"
        :shortname="'Dashboard'" />
    <SidebarItem @click="pageStore.page = 'PROSPECTS'" :current="pageStore.page == 'PROSPECTS'"
        icon="solid shop_"
        :working="pStore.prospWorking"
        :shortname="`Prospect<span style='font-size: .8em;'>${ getProspectID() }</span>`"
        :longname="getProspectName()" />
    <SidebarItem @click="pageStore.page = 'PROPOSALS'" :current="pageStore.page == 'PROPOSALS'"
        icon="file-pdf_"
        shortname="Proposals"
        :longname="getProposalsCount()" />
    <SidebarItem @click="pageStore.page = 'CENSUS'" :current="pageStore.page == 'CENSUS'"
        :icon="pStore.censusDirty ? '#red solid people-group_' : 'solid people-group_'"
        :working="pStore.censusWorking"
        shortname="Census"
        :longname="getCensusCount()" />
    <SidebarItem @click="pageStore.page = 'MSGS'" :current="pageStore.page == 'MSGS'"
        :badge="msgStore.unreadCount()"
        icon="envelope_"
        :working="msgStore.working"
        shortname="Messages"
        :longname="getUnreadMessageCounts()" />
    <SidebarItem @click="pageStore.page = 'SETTINGS'" :current="pageStore.page == 'SETTINGS'"
        icon="circle-user_"
        :working="uStore.working"
        :shortname="uStore.user.id"
        :longname="(uStore.user.fstnam + ' ' + uStore.user.lstnam).trim()" />
  </div>
  <data v-else>
    <!-- <SidebarItem>Login</SidebarItem> -->
  </data>
</template>

<style lang="css" scoped>

</style>
