<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from "@/components/B/BTable.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appStore } from "@/stores/AppStore";
const app = appStore()
import { B } from "@/composables/BUtils.ts";
import BAnchor from "@/components/B/BAnchor.vue";

const rolesConfig = {
  // height: "calc(100vh - 17em)",
  height: "7em",
  width: "25em",
  columns: [
    { id: "role", heading: "Role", flags: "C", width: "4em"},
    { id: "descr", heading: "Description" }
  ]
}

const rightsConfig = {
  // height: "calc(100vh - 9em)",
  height: "calc(100vh - 21em)",
  width: "25em",
  pickedRow: null as any,
  columns: [
    { id: "descr", heading: "Activity Description" },
    { id: "value", heading: "Value", flags: "C", width: "5em" },
    { id: "source", heading: "Source" },
  ]
}

const decodeSource = (source:string, td:any):void => {
  if (!td) return
  const cell = td as HTMLTableCellElement
  if (source == "@USER") {
    cell.innerHTML = "User";
  } else if (source == "@DFLT") {
    cell.innerHTML = "";
  } else {
    cell.innerHTML = "<i>" + source + "</i>";
  }
}
const rightsRows = Object.entries(
  userStore.user.rights as Record<string, { value: unknown; source: string }>,
).map(([key, values]) => ({
  id: key,
  ...values,
}))

const getRightsDescription = (row:any, td:any):void => {
  if (!td) return
  const cell = td as HTMLTableCellElement
  const right = app.config.rights.find((r:any) => r.code == row.id)
  let descr = row.id // Right code
  if (right) descr = right.descr
  if (row.value == "N") cell.style.color = "red"
  // if (row.value == "Y") cell.style.color = "green"
  cell.innerHTML = descr
}

const agencyDetails = () => {
  if (!userStore.user.agency_id || userStore.user.agency_id == -1) return "No agency assigned"
  if (userStore.user.agency_descr == '') return `Unknown agency (${userStore.user.agency_id})`
  return `${userStore.user.agency_descr} (${userStore.user.agency_id})`
}
// console.dir(rightsRows)
</script>

<template>
  <table style="width: 100%">
    <tbody>
    <tr>
      <td style="vertical-align: top; padding-right: 2em; width: 50%;">
        <table class="form-table" style="margin-bottom: 1em;">
          <tbody>
            <tr><th>User ID:</th><td>{{ userStore.user.id }}</td></tr>
            <tr><th>Name:</th><td>{{ userStore.user.lstnam }}, {{ userStore.user.fstnam }}</td></tr>
            <tr><th>Status:</th><td>{{ userStore.user.status }}</td></tr>
            <tr><th>Email:</th><td>{{ userStore.user.email }}</td></tr>
            <tr><th>Agency:</th><td>{{ agencyDetails() }}</td></tr>
            <tr><th>Last Login:</th><td>{{ B.format.ts(userStore.user.lst_login) }}</td></tr>
          </tbody>
        </table>
        <p style="color:orange"><i>Editing of roles / rights will move to the Maintenance app in time</i></p>
      </td>
      <td style="vertical-align: top;">
        <BTable :config="rolesConfig" :rows="userStore.user.config.roles" heading="Assigned Roles">
          <template #column_descr="{row}">
            {{
              app.config.roles.find((role:any) => {
                if (role.code == row) return role
              }).descr
            }}
          </template>
          <template #buttons>
            <BAnchor class="gapright" color="green" icon="solid add">Add Role</BAnchor> |
            <BAnchor disabled icon="@red solid x_">Remove</BAnchor>
          </template>
        </BTable>
        <BTable style="margin-top: 1.2em;" :config="rightsConfig" :rows="rightsRows" @pick="(row:any) => rightsConfig.pickedRow = row" heading="Activity Rights">
          <template #column_descr="{row,td}">
            {{ getRightsDescription(row, td) }}
          </template>
          <template #column_source="{row, td}">
            {{ decodeSource(row.source, td) }}
          </template>
          <template #buttons>
            <BAnchor disabled icon="solid edit_" class="gapright">Set Value...</BAnchor>
          </template>
        </BTable>
      </td>
    </tr>
  </tbody>
  </table>
</template>

<style lang="css" scoped></style>
