<script setup lang="ts">
import BTable from "@/components/BTable.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
const gridConfig = {
  height: "calc(100vh - 8em)",
  columns: [
    { id: "id", heading: "Right Code" },
    { id: "value", heading: "Value", flags: "C", width: "5em" },
    { id: "source",
      heading: "Source",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      formatter: (row: any, col: any) => {
        if (row.source == "@USER") {
          return "User-Defined";
        } else if (row.source == "@DFLT") {
          return "";
        } else {
          return "Role: <i>" + row.source + "</i>";
        }
      },
    },
  ]
}
const rows = Object.entries(
  userStore.user.rights as Record<string, { value: unknown; source: string }>,
).map(([key, values]) => ({
  id: key,
  ...values,
}));
</script>

<template>
  <b>Roles:</b> {{ userStore.user.config.roles }}
  <p>
    <BTable :config="gridConfig" :rows="rows"></BTable>
  </p>
</template>

<style lang="css" scoped></style>
