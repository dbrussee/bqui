<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useId } from 'vue';
import { appUserStore } from '@/stores/AppUserStore.ts';
const uStore = appUserStore()
import BTable from './B/BTable.vue';
import BButton from './B/BButton.vue';
import { B } from '@/composables/BUtils.ts';
import BIcon from './B/BIcon.vue';

const cfgHistory = ref({
  heading: "Recent Backend Call Activity",
  onPick: (row:any) => cfgHistory.value.pickedRow = row,
  onDblpick: () => showBodyPopup(),
  pickedRow: null as any,
  height: "50vh",
  columns: [
    { id: "ts", heading: "Timestamp", width: "fit-content", cellclass:'mono mini' },
    { id: "category", heading: "", width: "2em", flags: "C", cellclass:'mono mini' },
    // { id: "body", heading: "Body", width: "2em", flags: "C" },
    // { id: "issue", heading: "Err", width: "2em", flags: "C" },
    { id: "response.meta.request.httpMethod", heading: "", width: "4em", flags: "R", cellclass:'mono mini'},
    { id: "endpoint", heading: "Endpoint", width: "35em", cellclass:'mono mini' },
  ]
})
const popid = useId()
const bodyPopid = useId()

const open = () => {
  const popup = document.getElementById(popid) as HTMLDialogElement
  popup?.showModal()
  uStore.getAPIHistory()
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
  B.popup.showModal(bodyPopid)
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

const setTimestamp = (row:any, setStyle:any, setHtml:any):void => {
  if (!row) return
  setStyle((td:HTMLTableCellElement) => {
    if (row.endpoint.indexOf("/login") >= 0 || row.endpoint.indexOf("/relogin") >= 0) {
      const tr = td.closest("tr") as HTMLTableRowElement
      tr.style.borderBottom = "3px solid sienna"
    }
  })
  setHtml(B.format.ts(row.ts))
}
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

const reQueryAPI = () => {
  let filter:'ALL' | 'ERROR' = uStore.lastAPIFilter
  filter = (filter as string == 'ALL' ? 'ERROR' : 'ALL')
  uStore.getAPIHistory(filter)
}

</script>

<template>
  <dialog :id="popid">
    <BTable :config="cfgHistory" :rows="uStore.apiHistory">
      <template #column_endpoint="{row}">{{ simplifyEndpoint(row) }}</template>
      <template #column_ts="{row, setStyle, setHtml}">{{ setTimestamp(row, setStyle, setHtml) }}</template>
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
      <label class="gapright"><input type="checkbox" :checked="uStore.lastAPIFilter == 'ERROR'" @click="reQueryAPI()"> Only Errors</label>
      <BButton icon="#red solid x_" @click="abort()">Close</BButton>
    </div>
    <dialog :id="bodyPopid" closedBy="any">
      <div style="position: relative; overflow-y: scroll; height: calc(100vh - 8em);">
      <div v-if="cfgHistory.pickedRow?.body">
        <div class="titlebar">Request Body</div>
        <pre>{{ getPickedRowBody() }}</pre>
      </div>
      <div v-if="cfgHistory.pickedRow?.response" :style="{'margin-top': cfgHistory.pickedRow?.body ? '.5em' : ''}">
        <div class="titlebar">API Fetch Details</div>
        <pre>{{ getPickedRowError() }}</pre>
      </div>
      </div>
      <div class="buttonbar">
        <BButton icon="#red solid x_" @click="B.popup.close(bodyPopid)">Close</BButton>
      </div>
    </dialog>

  </dialog>
</template>

<style scoped>
.mini {
  font-size: .75em;
}
/* pre {
  padding: .3em;
  background-color: gainsboro;
} */
</style>
