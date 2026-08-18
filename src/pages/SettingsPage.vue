<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from "@/components/BTable.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appStore } from "@/stores/AppStore";
// import BList from "@/components/BList.vue";
const app = appStore()

console.dir(userStore.user.config)

// const rolesConfig = {
//   height: "5em",
//   heading: "Role",
//   width: "10em",
//   formatter: (row:any) => {
//     const appRole = app.config.roles.find((role:any) => {
//       if (role.code == row) return role
//     })
//     return appRole.descr
//   }
// }
const rolesConfig = {
  height: "6em",
  columns: [
    { id: "", heading: "Role", flags: "C", width: "4em"
      // formatter: (row:any) => {
      //   return row
      // }
     },
    { id: "", heading: "Description",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      formatter: (row:any, col:any) => {
        const appRole = app.config.roles.find((role:any) => {
          if (role.code == row) return role
        })
        return appRole ? appRole.descr : "Unknown"
      }
    }
  ]
}

const rightsConfig = {
  height: "calc(100vh - 13em)",
  columns: [
    // { id: "id", heading: "Right", flags:"C" },
    { id: "", heading: "Right Description",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      formatter: (row:any, col:any) => {
        const appRight = app.config.rights.find((right:any) => {
          if (right.code == row.id) return right
        })
        return appRight ? appRight.descr : "Unknown"
      }
     },
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
const rightsRows = Object.entries(
  userStore.user.rights as Record<string, { value: unknown; source: string }>,
).map(([key, values]) => ({
  id: key,
  ...values,
}));
// const rolesRows = Object.entries(
//   userStore.user.roles as Record<string, { value: unknown; source: string }>,
// ).map(([key, values]) => ({
//   id: key,
//   ...values,
// }));
</script>

<template>
  <BTable :config="rolesConfig" :rows="userStore.user.config.roles" />
  <p>
    <BTable :config="rightsConfig" :rows="rightsRows" />
  </p>
</template>

<style lang="css" scoped></style>
