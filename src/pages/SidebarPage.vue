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
import BIcon from "@/components/B/BIcon.vue";
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
  if (!prospectStore.prospect) return ""
  if (prospectStore.isLoading) return " Loading..."
  if (prospectStore.prospect.id) return " ID " + prospectStore.prospect.id
  return ' unknown'
}
function getProspectName():string {
  if (!prospectStore.prospect) return "No Prospect"
  if (prospectStore.isLoading) return "Loading..."
  if (prospectStore.prospect.name) return prospectStore.prospect.name
  return 'Unknown '
}
function getProposalsCount():string {
  if (!prospectStore.prospect) return "No Prospect"
  if (prospectStore.isLoading) return "Loading..."
  if (prospectStore.prospect.name) return "None"
  return 'Unknown '
}
function getUnreadMessageCounts():string {
  if (messageStore.messages.length == 0) return "None"
  const unread = messageStore.unreadCount()
  if (unread > 0) {
    const unread_msg = "<span style='color: white; background-color: red; border-radius: 50%; padding: 0 .4em;'>" + unread + "</span>"
    if (unread == messageStore.messages.length) return unread_msg
    return `Count: ${messageStore.messages.length}, Unread: ${unread_msg}`
  }
  return `Count: ${messageStore.messages.length.toString()}`
}
function getCensusCount():string {
  let msg = "Unknown"
  if (!prospectStore.prospect) {
    msg = "No Prospect"
  } else if (prospectStore.isLoading) {
    msg = "Loading..."
  } else if (prospectStore.prospect.census) {
    if (prospectStore.prospect.census.length == 0) {
      msg = "None"
    } else {
      let gtotal = 0
      prospectStore.prospect.census.forEach((sub:any) => {
        gtotal++
        gtotal += sub.deps.length
      })
      if (gtotal == prospectStore.prospect.census.length) {
        msg = 'Subs: ' + gtotal.toString()
      } else {
        msg = `Subs: ${prospectStore.prospect.census.length} / Total: ${gtotal}`
      }
    }
  }
  // if (prospectStore.censusDirty) msg += " <i class='fa-solid fa-floppy-disk' style='color: red; font-size: 1.2em;' />"
  return msg
}
</script>

<template>
  <div v-if="userStore.user">
    <SidebarItem @click="pageStore.page = 'PROSPECTS'" :current="pageStore.page == 'PROSPECTS'"
      ><BIcon as="icon" icon='solid shop_' />Prospect<span style='font-size: .8em;'>{{ getProspectID() }}</span>
      <p style='font-size: .8em;'>{{ getProspectName() }}</p>
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'CENSUS'" :current="pageStore.page == 'CENSUS'"
      ><BIcon as="icon" icon='solid people-group_' />Census<BIcon v-if="prospectStore.censusDirty" icon='#red solid _floppy-disk' />
      <p style='font-size: .8em;' v-html="getCensusCount()"></p>
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'PROPOSALS'" :current="pageStore.page == 'PROPOSALS'"
      ><BIcon as="icon" icon='file-pdf_' />Proposals
      <p style="font-size: .8em;" v-html="getProposalsCount()"></p>
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'MSGS'" :current="pageStore.page == 'MSGS'"
      ><BIcon as="icon" icon='envelope_' />Messages
      <p style="font-size: .8em;" v-html="getUnreadMessageCounts()"></p>
    </SidebarItem>
    <SidebarItem @click="pageStore.page = 'SETTINGS'" :current="pageStore.page == 'SETTINGS'"
      ><BIcon as="icon" icon='circle-user_' />Profile: <span style="font-size: .8em;">{{ userStore.user.id }}</span>
      <p style="font-size: .8em;">{{ (userStore.user.fstnam + ' ' + userStore.user.lstnam).trim() }}</p>
    </SidebarItem>
  </div>
  <data v-else>
    <SidebarItem>Login</SidebarItem>
  </data>
</template>

<style lang="css" scoped>
</style>
