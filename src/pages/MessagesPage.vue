<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { B } from "@/composables/BUtils";
// import BTable from "@/components/BTable.vue";
import { ref } from "vue";
import { appMessageStore } from "../stores/MessagesStore";
import FA from "@/components/FA.vue";
import BPopup from "@/components/BPopup.vue";
const messageStore = appMessageStore();

const newMessagePopup = ref()
const currentMessage = ref<any>(null)
const showMessage = (index:number) => {
  currentMessage.value = messageStore.messages[index]
  messageStore.acknowledge(index)
}

const reloadMessageList = () => {
  currentMessage.value = null
  messageStore.getMessages()
}

const newMessage = ref({
  sendto: "",
  subject: "",
  body: ""
})
</script>
<template>
  <div class="drop_menu">
    <button class="anchor" @click="reloadMessageList()"><FA icon="circle-down_"/>Reload</button>
    &nbsp;
    <BPopup ref="newMessagePopup" title="New Internal Message" class="B2R" manual
      linkicon="square-plus_" linktext="New Message"
      :buttons="[
        {icon:'solid x', text:'Cancel', iconcolor: 'red', class:'anchor', action:() => true},
        {icon:'solid share', text:'Send', class:'modern', action:() => {
          if (newMessage.sendto == '') return false
          if (newMessage.body == '') return false
          messageStore.sendNewMessage(newMessage.sendto, newMessage.subject, newMessage.body)
          return true
        }}
      ]"
      >
      <table class="form-table">
        <tbody>
          <tr><th>Send To:</th><td><input v-model="newMessage.sendto"></td></tr>
          <tr><th>Subject:</th><td><input style="width: 30em;" v-model="newMessage.subject"></td></tr>
          <tr><th>Message:</th><td><textarea style="width: 30em; height: 6em;" v-model="newMessage.body"></textarea></td></tr>
        </tbody>
      </table>
    </BPopup>
  </div>
  <div class="msgcontainer">
    <div class="msgitem" v-for="(message, index) in messageStore.messages" :key="index"
      :class="{current_style: currentMessage && currentMessage.id == message.id}"
      @click="showMessage(index)">
      <FA
        :icon="message.readat ? 'envelope-open_' : 'envelope_'"
        :style="{color: message.readat ? 'green' : 'maroon'}" />{{ message.subject }}
    </div>
  </div>
  <div v-if="currentMessage" class="message">
    <div style="font-size: .9em; padding-bottom: .3em;">
      <b style="margin-bottom: .3em;"><i>{{ currentMessage.subject }}</i></b>
      <table class="form-table" style="margin-left: 1em;">
        <tbody>
          <!-- <tr>
            <th>Subject:</th>
            <td>{{ currentMessage.subject }}</td>
          </tr> -->
          <tr>
            <th>From:</th>
            <td>{{ currentMessage.sender.id }}
                ({{ (currentMessage.sender.fstnam + ' ' + currentMessage.sender.lstnam).trim() }})</td>
          </tr>
          <tr v-if="currentMessage.sentat">
            <th>Sent:</th>
            <td>{{ B.ts(currentMessage.sentat) }}</td>
          </tr>
          <tr>
            <th>Read:</th>
            <td>{{ currentMessage.readat ? B.ts(currentMessage.readat) : "Unread" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr/>
    <pre><p>{{ currentMessage.msgtxt }}</p></pre>
    <!-- <p>{{ JSON.stringify(currentMessage) }}</p> -->
  </div>
  <div v-else class="message info">
    Click any message on the left to see the contents here
  </div>

<!-- <BTable :config="gridConfig" :rows="messageStore.messages"></BTable> -->
</template>
<style lang="css" scoped>
div.msgcontainer {
  display: inline-block;
  margin-top: .3em;
  width: 15em;
  height: calc(100vh - 9em);
  overflow-y: auto;
  background-color: linen;
  border-right: 1px solid gainsboro;
}
div.msgitem {
  padding: .3em;
  border-bottom: 1px solid black;
  border-left: 3px solid transparent;
  cursor: pointer;
  font-size: .9em;
  &:hover {
    border-left-color: dodgerblue;
  }
}
div.message {
  display: inline-block;
  padding-left: .3em;
  margin-top: .3em;
  width: calc(100% - 15.5em);
  height: calc(100vh - 9em);
  overflow-y: auto;
}
</style>
