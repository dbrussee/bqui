<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { B } from "@/composables/BUtils";
// import BTable from "@/components/BTable.vue";
import { ref } from "vue";
import { appMessageStore } from "../stores/MessagesStore";
import FA from "@/components/FA.vue";
const messageStore = appMessageStore();

const currentMessage = ref<any>(null)
const showMessage = (index:number) => {
  currentMessage.value = messageStore.messages[index]
  messageStore.acknowledge(index)
}

const reloadMessageList = () => {
  currentMessage.value = null
  messageStore.getMessages()
}
</script>
<template>
  <button @click="reloadMessageList()"><FA ver="solid" icon="arrow-rotate-left"/> Reload</button>
  <br/>
  <div class="msgcontainer">
    <div class="msgitem" v-for="(message, index) in messageStore.messages" :key="index"
      :class="{current_style: currentMessage && currentMessage.id == message.id}"
      @click="showMessage(index)">
      <FA v-if="message.readat" icon="envelope-open" style="color: green;"></FA>
      <FA v-else icon="envelope" style="color: maroon;"></FA>
      {{ message.subject }}</div>
  </div>
  <div v-if="currentMessage" class="message">
    <div style="font-size: .9em; padding-bottom: .3em;">
      <b><i>{{ currentMessage.subject }}</i></b>
      <table class="form-table">
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
          <tr>
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
    <p>{{ currentMessage.msgtxt }}</p>
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
