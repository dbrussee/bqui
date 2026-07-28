<script setup lang="ts">
import { ref } from 'vue'
import { appUserStore } from '../stores/AppUserStore'
const userStore = appUserStore()
import { appMessageStore } from '../stores/MessagesStore'
const messageStore = appMessageStore()
import { appProspectStore } from '@/stores/ProspectStore'
const prospectStore = appProspectStore()
import { countersStore } from '../stores/CountersStore'
import APIIssue from '@/components/APIIssue.vue'
import UserComponent from '@/components/UserComponent.vue'
import ProspectComponent from '@/components/prospectComponent.vue'
const counters = countersStore()
const loginuid = ref('')
const prospect_id = ref('')
const pickedFave = ref('')
const pickedRecent = ref('')

const which_tab = ref('MSG')

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

function pickFave() {
  which_tab.value='PROSP'
  prospectStore.getProspect(pickedFave.value)
  pickedFave.value = ''
}
function pickRecent() {
  which_tab.value='PROSP'
  prospectStore.getProspect(pickedRecent.value)
  pickedRecent.value = ''
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
        <td style="vertical-align: top; text-align: right">
          API: ({{ counters.apiCalls.active }} active, {{ counters.apiCalls.success }} success,
          {{ counters.apiCalls.error }} error)
        </td>
      </tr>
    </tbody>
  </table>
  <UserComponent>Nobody logged in</UserComponent>
  <div v-if="userStore.user">
    <label><input type='radio' @click="which_tab = 'PROSP'" :checked="which_tab=='PROSP'" name='disp_tab'><b>Prospect</b >
      &nbsp;<select v-model="pickedFave" @change="pickFave()">
        <option value="" selected>Select a favorite...</option>
        <option v-for="fave in userStore.user.faves" :key="fave.pid" :value="fave.pid">{{ fave.name }}</option>
      </select>
      &nbsp;<select v-model="pickedRecent" @change="pickRecent()">
        <option value="" selected>Select a recent...</option>
        <option v-for="recent in userStore.user.recents" :key="recent.pid" :value="recent.pid">{{ recent.name }}</option>
      </select>

      &nbsp;<input v-model="prospect_id" placeholder="Prospect ID" />
      &nbsp;<button @click="which_tab='PROSP'; prospectStore.getProspect(prospect_id)">Load</button>
    </label>&nbsp;&nbsp;
    <label><input type='radio' @click="which_tab = 'MSG'" :checked="which_tab=='MSG'" name='disp_tab'><b>Messages</b >
      &nbsp;<button @click="which_tab='MSG'; messageStore.getMessages()">Load</button>
    </label>&nbsp;&nbsp;
    <label><input type='radio' @click="which_tab = 'RIGHTS'" :checked="which_tab=='RIGHTS'" name='disp_tab'><b>Rights</b >
    </label>&nbsp;&nbsp;

    <div v-if="userStore.user && which_tab == 'MSG'">
      <div v-for="msg in messageStore.messages" :key="msg.id">
        Sent: {{ ts(msg.sentat) }}<br />
        <b>{{ msg.subject }}</b
        ><br />
        <i>{{ msg.msgtxt }}</i>
        <hr />
      </div>
    </div>
    <div v-if="userStore.user && which_tab == 'RIGHTS'">
      <b>Roles:</b> {{ userStore.user.config.roles }}
      <br />
      <b>Rights</b>
      <div v-for="(value, key) in userStore.user.rights" :key="key">
        {{ key }}: {{ value.value }}<span v-if="value.source != '@DFLT'"> ({{ value.source }})</span>
      </div>
    </div>
    <div v-if="userStore.user.id != undefined && which_tab == 'PROSP'">
      <ProspectComponent>No prospect loaded</ProspectComponent>
    </div>
  </div>
  <APIIssue :issue="userStore.issue"></APIIssue>
</template>

<style scoped></style>
