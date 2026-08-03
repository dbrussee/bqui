<script setup lang="ts">
import BTable from "@/components/BTable.vue";
import { appMessageStore } from "../stores/MessagesStore";
const messageStore = appMessageStore();

const gridConfig = {
  columns: [
    { id: "id", heading: "ID", width: "50px" },
    // { id: 'sentat', heading: 'Sent At', width: '100px', formatter: (td: HTMLTableCellElement, row: any) => B.ts(row.sentat) },
    { id: "subject", heading: "Subject", width: "200px" },
    { id: "msgtxt", heading: "Message Text" },
  ]
}
</script>
<template>
  <button @click="messageStore.getMessages()">Load Messages</button>
  <p>
    <BTable width="100%" :config="gridConfig" :rows="messageStore.messages"></BTable>
  </p>
</template>
<style lang="css" scoped></style>
