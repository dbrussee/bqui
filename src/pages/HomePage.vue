<script setup lang="ts">
import { ref } from 'vue'
import { appUserStore } from '../stores/AppUser'
const userStore = appUserStore()
const uid = ref('')
const loginuid = ref('')

async function login() {
  if (loginuid.value != '') {
    await userStore.login(loginuid.value)
    console.dir(userStore.loggedInUser)
  }
}
async function getUser() {
  if (uid.value != '') {
    await userStore.getUser(uid.value)
    console.dir(userStore.user)
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
    fractionalSecondDigits: 3,
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
          <div v-if="userStore.loggedInUser">
            Logged In: {{ userStore.loggedInUser.fstnam }} {{ userStore.loggedInUser.lstnam }}<br />
            Your email is: {{ userStore.loggedInUser.email }}<br />
            Last Login: {{ ts(userStore.loggedInUser.lst_login) }}<br />
            Roles: {{ userStore.loggedInUser.config.roles }}
          </div>
          <div v-else>Not logged in</div>
        </td>
        <td style="vertical-align: top; padding-left: 10px">
          <input v-model="uid" placeholder="Enter User ID" />
          <button @click="getUser()">Load</button><br />
          <div v-if="userStore.user">
            Name: {{ userStore.user.fstnam }} {{ userStore.user.lstnam }}<br />
            Your email is: {{ userStore.user.email }}<br />
            Last Login: {{ ts(userStore.user.lst_login) }}<br />
            Roles: {{ userStore.user.config.roles }}
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="userStore.user">
    <!-- Logged in as: {{ userStore.loggedInUser.fstnam }} {{ userStore.loggedInUser.lstnam }}<br />
    Took: {{ userStore.meta.times.ms }}ms -->
  </div>
  <h2>Messages</h2>
  <!-- <div v-for="msg in fetcher.json.messages" :key="msg.id">
    {{ msg.text }}
  </div> -->
</template>

<style scoped></style>
