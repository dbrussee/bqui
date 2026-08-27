<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { B } from "@/composables/BUtils";
import { ref, useId } from "vue";
import { appMessageStore } from "../stores/MessagesStore";
import BIcon from "@/components/B/BIcon.vue";
import BConfirm from "@/components/B/BConfirm.vue";
import BButton from "@/components/B/BButton.vue";
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


const msgHandler = ref({
  id: useId(),
  msg: { sendto: "", subject: "", body: "" } as any,
  show: () => {
    const popup = document.getElementById(msgHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  send: () => {
    if (msgHandler.value.msg.sendto == '') return false
    if (msgHandler.value.msg.body == '') return false
    messageStore.sendNewMessage(msgHandler.value.msg.sendto, msgHandler.value.msg.subject, msgHandler.value.msg.body)
    msgHandler.value.msg = { sendto: '', subject: '', body: '' }
    const popup = document.getElementById(msgHandler.value.id) as HTMLDialogElement
    popup?.close()
  },
  delete: () => {
    if (!currentMessage.value) return
    messageStore.deleteMessage(currentMessage.value.id)
    currentMessage.value = null
  },
  abort: () => {
    const popup = document.getElementById(msgHandler.value.id) as HTMLDialogElement
    popup?.close()
  }
})

</script>
<template>
  <div class="drop_menu">
    <BIcon as="anchor" icon="solid rotate-left_" @click="reloadMessageList()">Reload</BIcon>&nbsp;&nbsp;
    <BIcon as="anchor" icon="square-plus_" @click="msgHandler.show()">New Message</BIcon>
    <span style="float: right;" v-if="currentMessage">
      <BConfirm class="anchor" pos="L" icon="#red trash-can_" @confirm="msgHandler.delete()">Delete Message
        <template #message>
          Delete this message?
          <p style='color:red'>This cannot be undone</p>
        </template>
      </BConfirm>&nbsp;
    </span>
  </div>
  <div class="msgcontainer">
    <div class="msgitem" v-for="(message, index) in messageStore.messages" :key="index"
      :class="{current_style: currentMessage && currentMessage.id == message.id}"
      @click="showMessage(index)">
      <BIcon :icon="message.readat ? '#green envelope-open_' : '#red solid envelope_'">{{ message.subject }}</BIcon>
    </div>
  </div>
  <div v-if="currentMessage" class="message">
    <div style="font-size: .9em; padding-bottom: .3em;">
      <span class="message_subject">&lt; {{ currentMessage.subject }} &gt;</span>
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
          <tr v-if="currentMessage.deliveredat">
            <th>Delivered:</th>
            <td>{{ B.ts(currentMessage.deliveredat) }}</td>
          </tr>
          <tr>
            <th>Opened:</th>
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

  <dialog :id="msgHandler.id">
    <div class="titlebar">New Internal Message</div>
    <table class="form-table">
      <tbody>
        <tr><th>Send To:</th><td><input v-model="msgHandler.msg.sendto"></td></tr>
        <tr><th>Subject:</th><td><input style="width: 30em;" v-model="msgHandler.msg.subject"></td></tr>
        <tr><th>Message:</th><td><textarea style="width: 30em; height: 6em;" v-model="msgHandler.msg.body"></textarea></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <BButton class="anchor" @click="msgHandler.abort()" icon="#red solid x">Cancel</BButton>&nbsp;
            <BButton class="action" @click="msgHandler.send()" icon="solid share_">Send Message</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
  </dialog>
</template>
<style lang="css" scoped>
.message_subject {
  font-weight: bold;
  font-size: 1.1em;
  color: var(--form-prompt-color);
  font-style: italic;
}
div.msgcontainer {
  display: inline-block;
  /* margin-top: .3em; */
  width: 15em;
  height: calc(100vh - 9em);
  overflow-y: auto;
  border-right: 3px solid gainsboro;
  padding-right: 3px;
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
  &:nth-child(1) {
    border-top: 1px solid black;
  }
}
div.message {
  display: inline-block;
  padding-left: .3em;
  /* margin-top: .3em; */
  width: calc(100% - 15.5em);
  height: calc(100vh - 9em);
  overflow-y: auto;
}
</style>
