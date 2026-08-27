<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from "@/components/B/BTable.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appStore } from "@/stores/AppStore";
const app = appStore()

const rolesConfig = {
  height: "6em",
  columns: [
    { id: "role", heading: "Role", flags: "C", width: "4em"},
    { id: "descr", heading: "Description" }
  ]
}

const decodeSource = (source:string):string => {
  if (source == "@USER") {
    return "User-Defined";
  } else if (source == "@DFLT") {
    return "";
  } else {
    return "Role: <i>" + source + "</i>";
  }
}
const rightsConfig = {
  height: "calc(100vh - 13em)",
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
// console.dir(rightsRows)
</script>

<template>
  <BTable nofooter :config="rolesConfig" :rows="userStore.user.config.roles">
    <template #column_descr="{row}">
      {{
        app.config.roles.find((role:any) => {
          if (role.code == row) return role
        }).descr
      }}
    </template>
  </BTable>
  <p>
    <BTable nofooter :config="rightsConfig" :rows="rightsRows" @pick="(row:any) => rightsConfig.pickedRow = row">
      <template #column_descr="{row}">{{
          app.config.rights.find((right:any) => {
            if (right.code == row.id) return right
          }).descr
      }}</template>
      <template #column_source="{row}">
        <span v-html="decodeSource(row.source)"/>
      </template>
    </BTable>
  </p>
</template>

<style lang="css" scoped></style>
