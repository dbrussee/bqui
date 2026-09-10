<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useId } from 'vue';
import { appUserStore } from '@/stores/AppUserStore.ts';
const userStore = appUserStore()
import BTable from './B/BTable.vue';
import BButton from './B/BButton.vue';
import { B } from '@/composables/BUtils.ts';
import BIcon from './B/BIcon.vue';

const cfgHistory = ref({
  pickedRow: null as any,
  height: "50vh",
  columns: [
    { id: "ts", heading: "Timestamp", width: "12em" },
    { id: "category", heading: "", width: "2em", flags: "C" },
    // { id: "body", heading: "Body", width: "2em", flags: "C" },
    // { id: "issue", heading: "Err", width: "2em", flags: "C" },
    { id: "response.meta.request.httpMethod", heading: "", width: "4em", flags: "R"},
    { id: "endpoint", heading: "Endpoint", width: "35em" },
  ]
})
const popid = useId()
const bodyPopid = useId()

const open = () => {
  const popup = document.getElementById(popid) as HTMLDialogElement
  popup?.showModal()
  userStore.getAPIHistory()
}
const abort = () => {
  const popup = document.getElementById(popid) as HTMLDialogElement
  popup?.close()
}

defineExpose({
  open, abort
})

const showBodyPopup = () => {
  const row = cfgHistory.value.pickedRow
  if (!row) return
  if (!row.body && !row.response) return
  // if (row.body.length == 0) return
  const popup = document.getElementById(bodyPopid) as HTMLDialogElement
  popup?.showModal()
}
const pickHistoryRow = (row:any):void => {
  cfgHistory.value.pickedRow = row
}
const getPickedRowBody = ():string => {
  const row = cfgHistory.value.pickedRow
  if (row && row.body) {
    const body = row.body as string
    if (body.startsWith("{") || body.startsWith("[")) {
      return JSON.stringify(JSON.parse(body), null, 2)
    } else if (body.length == 0) {
      return "Nothing found in the API boday"
    } else {
      return body
    }
  }
  return "No API boday"
}

const getPickedRowError = ():string => {
  const row = cfgHistory.value.pickedRow
  if (row) {
    // delete issue.host.ip
    return JSON.stringify(row.response, null, 2)
  }
  return ""
}

const setTimestamp = (row:any, td:any):void => {
  if (!row || !td) return
  td.innerHTML = B.format.ts(row.ts)
  if (row.endpoint.indexOf("/login") >= 0 || row.endpoint.indexOf("/relogin") >= 0) {
    const cell = td as HTMLTableCellElement
    const tr = cell.closest("tr") as HTMLTableRowElement
    tr.style.borderBottom = "3px solid sienna"
  }
}
// const getResultCodex = (row:any, td:any) => {
//   if (!row || !td) return
//   const code = row.category.split("-")[1].trim()
//   if (code == "ERROR") {
//     const cell = td as HTMLTableCellElement
//     cell.style.color = "red"
//   }
//   return code
// }
const getResultIcon = (row:any):string => {
  if (!row) return ""
  const code = row.category.split("-")[1].trim()
  if (code == "ERROR") {
    return "#red solid bug"
  }
  return "" // "#green solid check"
}

const simplifyEndpoint = (row:any) => {
  // Example: GET /bqapi/v2.1/beef
  // Returns: GET /beef
  let endpoint = row.endpoint // GET /bqapi/v2.1/beef
  const space:number = endpoint.indexOf(" ") // 3
  const mth:string = endpoint.substr(0, space) // GET
  endpoint = row.endpoint.substr(space+1) // /bqapi/v2.1/beef
  if (endpoint.indexOf("/bqapi/") == 0) {
    endpoint = endpoint.substring(6) // /v2.1/beef
    if (endpoint.indexOf("/v") == 0) {
      const slash = endpoint.indexOf("/", 1) // location of second slash
      endpoint = endpoint.substring(slash) // /beef
    }
  }
  return endpoint
}

</script>

<template>
  <dialog :id="popid">
    <BTable heading="Recent Backend Call Activity" :config="cfgHistory" :rows="userStore.apiHistory"
    @pick="(row:any) => pickHistoryRow(row)"
    @dblpick="() => showBodyPopup()"
    >
      <template #column_endpoint="{row}">{{ simplifyEndpoint(row) }}</template>
      <template #column_ts="{row,td}">{{ setTimestamp(row, td) }}</template>
      <template #column_body="{row}"><BIcon v-if="row.body && row.body.length > 0" icon="solid code"/></template>
      <template #column_category="{row}"><BIcon :icon="getResultIcon(row)"/></template>
      <template #buttons>
        <BButton
          class="modern"
          icon="solid code_"
          :disabled="!cfgHistory.pickedRow || (!cfgHistory.pickedRow.body && !cfgHistory.pickedRow.response)"
          @click="showBodyPopup()">Show Details
        </BButton>
      </template>
    </BTable>
    <div class="buttonbar">
      <BButton icon="#red solid x_" @click="abort()">Close</BButton>
    </div>
    <dialog :id="bodyPopid" closedBy="any">
      <div v-if="cfgHistory.pickedRow?.body">
        <div class="titlebar">Request Body</div>
        <pre>{{ getPickedRowBody() }}</pre>
      </div>
      <div v-if="cfgHistory.pickedRow?.response" :style="{'margin-top': cfgHistory.pickedRow?.body ? '.5em' : ''}">
        <div class="titlebar">API Response Details</div>
        <pre>{{ getPickedRowError() }}</pre>
      </div>
    </dialog>

  </dialog>
</template>

<style scoped>
/* pre {
  padding: .3em;
  background-color: gainsboro;
} */
</style>
