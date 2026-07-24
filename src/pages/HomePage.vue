<script setup lang="ts">
import { ref } from 'vue'
import { appUserStore } from '../stores/AppUser'
const userStore = appUserStore()
import { appMessageStore } from '../stores/Messages'
const messageStore = appMessageStore()
import { countersStore } from '../stores/Counters'
import APIIssue from '@/components/APIIssue.vue'
import UserComponent from '@/components/UserComponent.vue'
const counters = countersStore()
const uid = ref('')
const loginuid = ref('')

async function login() {
  logout()
  if (loginuid.value != '') {
    await userStore.login(loginuid.value)
    console.dir(userStore.user)
    // await messageStore.getMessages(loginuid.value)
    // console.dir(messageStore.messages)
  }
}
function logout() {
  userStore.logout()
  messageStore.messages.length = 0
}
async function getOtherUser() {
  if (uid.value != '') {
    await userStore.getOtherUser(uid.value)
    console.dir(userStore.otherUser)
  }
}

const ts = (d: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: 'numeric',
    // fractionalSecondDigits: 3,
  }).format(new Date(d).getTime())
}
</script>

<template>
  <table style="width: 100%">
    <tbody>
      <tr>
        <td style="vertical-align: top; width: 30%">
          <input v-model="loginuid" placeholder="Enter User ID" />
          <button @click="login()">Login</button>
        </td>
        <td style="vertical-align: top; padding-left: 10px">
          <input v-model="uid" placeholder="Enter Other User ID" />
          <button @click="getOtherUser()">Load</button><br />
          <div v-if="userStore.otherUser">
            Name: {{ userStore.otherUser.fstnam }} {{ userStore.otherUser.lstnam }}<br />
            Your email is: {{ userStore.otherUser.email }}<br />
            Last Login: {{ ts(userStore.otherUser.lst_login) }}
          </div>
        </td>
        <td style="vertical-align: top; text-align: right">
          API: ({{ counters.apiCalls.active }} active, {{ counters.apiCalls.success }} success,
          {{ counters.apiCalls.error }} error)
        </td>
      </tr>
    </tbody>
  </table>
  <UserComponent/>
  <div v-if="userStore.user">
    <b>Messages</b>
    &nbsp;<button :disabled="!userStore.user" @click="messageStore.getMessages()">
      Load
    </button>
    <div v-for="msg in messageStore.messages" :key="msg.id">
      Sent: {{ ts(msg.sentat) }}<br />
      <b>{{ msg.subject }}</b
      ><br />
      <i>{{ msg.msgtxt }}</i>
      <hr />
    </div>
    <br />
    <b>Roles:</b> {{ userStore.user.config.roles }}
    <br />
    <b>Rights</b>
    <div v-for="(value, key) in userStore.user.rights" :key="key">
      {{ key }}: {{ value.value }}<span v-if="value.source != '@DFLT'"> ({{ value.source }})</span>
    </div>
  </div>
  <APIIssue :issue="userStore.issue"></APIIssue>
</template>

<style scoped></style>
