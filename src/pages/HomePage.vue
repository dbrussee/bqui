<script setup lang="ts">
import { ref } from 'vue'
import { appUserStore } from '../stores/AppUser'
const userStore = appUserStore()
import { appMessageStore } from '../stores/Messages'
const messageStore = appMessageStore()
import { countersStore } from '../stores/Counters'
const counters = countersStore()
const uid = ref('')
const loginuid = ref('')

async function login() {
  if (loginuid.value != '') {
    await userStore.login(loginuid.value)
    console.dir(userStore.user)
    await messageStore.getMessages(loginuid.value)
    console.dir(messageStore.messages)
  }
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
          <button @click="login()">Login</button><br />
          <div v-if="userStore.user">
            Logged In: {{ userStore.user.fstnam }} {{ userStore.user.lstnam }}<br />
            Your email is: {{ userStore.user.email }}<br />
            Last Login: {{ ts(userStore.user.lst_login) }}<br />
            Roles: {{ userStore.user.config.roles }}
          </div>
          <div v-else>Not logged in</div>
        </td>
        <td style="vertical-align: top; padding-left: 10px">
          <input v-model="uid" placeholder="Enter Other User ID" />
          <button @click="getOtherUser()">Load</button><br />
          <div v-if="userStore.otherUser">
            Name: {{ userStore.otherUser.fstnam }} {{ userStore.otherUser.lstnam }}<br />
            Your email is: {{ userStore.otherUser.email }}<br />
            Last Login: {{ ts(userStore.otherUser.lst_login) }}<br />
            Roles: {{ userStore.otherUser.config.roles }}
          </div>
        </td>
        <td style="vertical-align: top; text-align: right">
          API: ({{ counters.apiCalls.active }} active, {{ counters.apiCalls.success }} success,
          {{ counters.apiCalls.error }} error)
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="userStore.user">
    <h3>Messages</h3>
    <div v-for="msg in messageStore.messages" :key="msg.id">
      Sent: {{ ts(msg.sentat) }}<br />
      <b>{{ msg.subject }}</b
      ><br />
      <i>{{ msg.msgtxt }}</i>
      <hr />
    </div>
    <h3>Rights</h3>
    <div v-for="(value, key) in userStore.user.rights" :key="key">
      {{ key }}: {{ value.value }} ({{ value.source }})
    </div>
  </div>
</template>

<style scoped></style>
