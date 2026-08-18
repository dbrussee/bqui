<script setup lang="ts">
import { ref } from 'vue';
type Message = {
  sendto: string
  body: string

}
// const props = defineProps<{
//   message: Message
// }>()

const msg = ref<Message>({
  sendto: "",
  body: ""
})
</script>

<template>
  <div class="title">New Internal Message</div>
  <table class="form-table">
    <tbody>
      <tr><th>Send To:</th><td><input v-model="msg.sendto"></td></tr>
      <tr><th>Message:</th><td><textarea v-model="msg.body"></textarea></td></tr>
    </tbody>
  </table>
</template>

<style lang="css" scoped>
.title {
  font-weight: bold;
  padding-bottom: .3em;
  margin-bottom: .3em;
  border-bottom: 1px solid black;
}
</style>
