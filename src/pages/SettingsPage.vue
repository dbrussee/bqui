<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from "@/components/B/BTable.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appStore } from "@/stores/AppStore";
const app = appStore()
import { B } from "@/composables/BUtils.ts";

const rolesConfig = {
  height: "calc(100vh - 17em)",
  columns: [
    { id: "role", heading: "Role", flags: "C", width: "4em"},
    { id: "descr", heading: "Description" }
  ]
}

const decodeSource = (source:string, td:any):void => {
  if (!td) return
  const cell = td as HTMLTableCellElement
  if (source == "@USER") {
    cell.innerHTML = "User-Defined";
  } else if (source == "@DFLT") {
    cell.innerHTML = "";
  } else {
    cell.innerHTML = "Role: <i>" + source + "</i>";
  }
}
const rightsConfig = {
  height: "calc(100vh - 9em)",
  pickedRow: null as any,
  columns: [
    { id: "descr", heading: "Right Description" },
    { id: "value", heading: "Value", flags: "C", width: "5em" },
    { id: "source", heading: "Source" },
  ]
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
// console.dir(rightsRows)
</script>

<template>
  <table>
    <tbody>
    <tr>
      <td style="vertical-align: top; padding-right: 2em;">
        <table class="form-table" style="margin-bottom: 1em;">
          <tbody>
            <tr><th>User ID:</th><td>{{ userStore.user.id }}</td></tr>
            <tr><th>First Name:</th><td>{{ userStore.user.fstnam }}</td></tr>
            <tr><th>Last Name:</th><td>{{ userStore.user.lstnam }}</td></tr>
            <tr><th>Status:</th><td>{{ userStore.user.status }}</td></tr>
            <tr><th>Email:</th><td>{{ userStore.user.email }}</td></tr>
            <tr><th>Logged in:</th><td>{{ B.format.ts(userStore.user.lst_login) }}</td></tr>
          </tbody>
        </table>
        <BTable nofooter :config="rolesConfig" :rows="userStore.user.config.roles" heading="Assigned Roles">
          <template #column_descr="{row}">
            {{
              app.config.roles.find((role:any) => {
                if (role.code == row) return role
              }).descr
            }}
          </template>
        </BTable>
      </td>
      <td style="vertical-align: top;">
        <p>
          <BTable nofooter :config="rightsConfig" :rows="rightsRows" @pick="(row:any) => rightsConfig.pickedRow = row" heading="Action Rights">
            <template #column_descr="{row,td}">
              {{ getRightsDescription(row, td) }}
            </template>
            <template #column_source="{row, td}">
              {{ decodeSource(row.source, td) }}
            </template>
          </BTable>
        </p>
      </td>
    </tr>
  </tbody>
  </table>
</template>

<style lang="css" scoped></style>
