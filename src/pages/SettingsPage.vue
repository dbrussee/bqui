<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from "@/components/B/BTable.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appStore } from "@/stores/AppStore";
const app = appStore()
import { B } from "@/composables/BUtils.ts";
import BAnchor from "@/components/B/BAnchor.vue";
import { ref, useId, computed } from "vue";
import BButton from "@/components/B/BButton.vue";
import BConfirm from "@/components/B/BConfirm.vue";
import { useDark } from '@vueuse/core';
import ClipboardIcon from "@/components/ClipboardIcon.vue";
const isDark = useDark({
  storageKey: null // 🚫 Disables reading and writing to localStorage
})

// const overrideRef = ref<InstanceType<typeof BPopup> | null>(null)
const roleHandler = {
  popupId: useId(),
  edit: () => {
    const popup = document.getElementById(roleHandler.popupId) as HTMLDialogElement
    popup?.showModal()
  },
  add: (rolecode:string):void => {
    userStore.addRole(rolecode);
    rolesConfig.value.pickedRow = null
    roleHandler.close()
  },
  delete: () => {
    userStore.deleteRole(rolesConfig.value.pickedRow) // The row is just the role code
    rolesConfig.value.pickedRow = null
    roleHandler.close()
  },
  close: () => {
    const popup = document.getElementById(roleHandler.popupId) as HTMLDialogElement
    popup?.close()
  }
}
const rightHandler = {
  popupId: useId(),
  edit: () => {
    // quoteStore.quote = {}
    // if (qtype != quoteHandler.value.lastQtype)
    const popup = document.getElementById(rightHandler.popupId) as HTMLDialogElement
    popup?.showModal()
  },
  save: () => {
    const sel = document.querySelector(".SETTINGS_PAGE_SAVE_USER_RIGHT") as HTMLSelectElement
    if (sel.value == '') {
      userStore.deleteUserRight(rightsConfig.value.pickedRow.code)
      rightsConfig.value.pickedRow = null
    } else {
      userStore.setUserRightValue(rightsConfig.value.pickedRow.code, sel.value)
      rightsConfig.value.pickedRow = null
    }
    rightHandler.close()
  },
  close: () => {
    const popup = document.getElementById(rightHandler.popupId) as HTMLDialogElement
    popup?.close()
  }
}

const rolesConfig = ref({
  // height: "calc(100vh - 17em)",
  height: "7em",
  width: "25em",
  pickedRow: null as any,
  columns: [
    { id: "role", heading: "Role", flags: "C", width: "4em"},
    { id: "descr", heading: "Description" }
  ]
})

const rightsConfig = ref({
  // height: "calc(100vh - 9em)",
  height: "calc(100vh - 21em)",
  width: "25em",
  pickedRow: null as any,
  columns: [
    { id: "descr", heading: "Activity Description" },
    { id: "value", heading: "Value", flags: "C", width: "5em" },
    { id: "source", heading: "Source" },
  ]
})

const decodeSource = (configRight:any, td:any):void => {
  const cell = td as HTMLTableCellElement
  if (!cell) return
  const rightCode = configRight.code
  if (!rightCode) cell.innerHTML = "What?"
  const userRight = userStore.user.rights[rightCode]
  if (userRight.source == "@USER") {
    cell.innerHTML = "User";
  } else if (userRight.source == "@DFLT") {
    cell.innerHTML = "";
  } else {
    cell.innerHTML = '<i>' + userRight.source + "</i>";
  }
}
const decodeValue = (configRight:any):string => {
  const rightCode = configRight.code
  if (!rightCode) return "What?"
  const userRight = userStore.user.rights[rightCode]
  return userRight.value
}


const agencyDetails = () => {
  if (!userStore.user.agency_id || userStore.user.agency_id == -1) return "<span style='color: var(--ui-disabled-text)'>None</span>"
  if (userStore.user.agency_descr == null) return `<span style='color: red'>Unknown agency (${userStore.user.agency_id})</span>`
  return `${userStore.user.agency_descr}`
}

const handlePickRight = (row:any):void => {
  rightsConfig.value.pickedRow = row
}
const handlePickRole = (row:any):void => {
  rolesConfig.value.pickedRow = row
}

const pickedRightValue = ref<string>('')
const inspectRight = ():string => {
  if (!rightsConfig.value.pickedRow) return ""
  const rightCode = rightsConfig.value.pickedRow.code
  // const userRight = userStore.user.rights[rightCode]
  let html = "<ul>"
  html += `<li>Default: ${rightsConfig.value.pickedRow.default_value}</li>`
  userStore.user.config.roles.forEach((myrole:string) => {
    app.config.roles.forEach((appRole:any) => {
      if (appRole.code == myrole) {
        appRole.rights.forEach((rr:any) => {
          if (rr.right == rightCode) {
            html += `<li>Role: ${appRole.code}: ${rr.value}</li>`
          }
        })
      }
    })
  })
  const userRight = userStore.user.rights[rightCode]
  if (userRight.source == '@USER') {
    pickedRightValue.value = userRight.value
    // html += `<li>User: ${userRight.value}</li>`
  } else {
    pickedRightValue.value = ''
  }

  html += "</ul>"
  return html
}

const getUserTheme = computed(():string => {
  const config = userStore.user.config
  if ("settings" in config) {
    if ("theme" in config.settings) {
      // console.log("User Theme:", config.settings.theme)
      return config.settings.theme.toLowerCase()
    }
  }
  return 'auto'
})
const saveTheme = (value:string):void => {
  userStore.saveTheme(value);
}
</script>

<template>
  <table style="width: 100%">
    <tbody>
    <tr>
      <td style="vertical-align: top; padding-right: 2em; width: 50%;">
        <table class="form-table" style="margin-bottom: 1em; width: 100%;">
          <tbody>
            <tr><th>User ID:</th><td>{{ userStore.user.id }}</td></tr>
            <tr><th>Name:</th><td>{{ userStore.user.lstnam }}, {{ userStore.user.fstnam }}</td></tr>
            <tr><th>Status:</th><td>{{ userStore.user.status }}</td></tr>
            <tr><th>Email:</th><td>
              <a v-if="userStore.user.email != ''" style="cursor: pointer"
                :href="'mailto:' + encodeURI(`${userStore.user.fstnam} ${userStore.user.lstnam} <${userStore.user.email}>`)">{{userStore.user.email}}</a>
                <ClipboardIcon :cliptext="userStore.user.email"/>
            </td></tr>
            <tr><th>Agency:</th><td :innerHTML="agencyDetails()"/></tr>
            <tr><th>Last Login:</th><td>{{ B.format.ts(userStore.user.lst_login) }}</td></tr>
            <tr><td colspan="2"><div class="buttonbar"/></td></tr>
            <tr><th>Theme:</th><td>
              <label><input @click="saveTheme('auto')" type='radio' name='user_theme' :checked="getUserTheme == 'auto'" value=''> Auto ({{ isDark ? 'Dark' : 'Light' }})</label>&nbsp;&nbsp;
              <label><input @click="saveTheme('light')" type='radio' name='user_theme' :checked="getUserTheme == 'light'" value='light'> Light</label>&nbsp;&nbsp;
              <label><input @click="saveTheme('dark')" type='radio' name='user_theme' :checked="getUserTheme == 'dark'" value='dark'> Dark</label>
            </td></tr>
          </tbody>
        </table>
        <p style="color:orange"><i>Editing of roles / rights will move to the Maintenance app in time</i></p>
      </td>
      <td style="vertical-align: top;">
        <BTable
            :config="rolesConfig" :rows="userStore.user.config.roles"
            @pick="(row:any) => handlePickRole(row)"
            heading="Assigned Roles">
          <template #column_descr="{row}">
            {{
              app.config.roles.find((role:any) => {
                if (role.code == row) return role
              }).descr
            }}
          </template>
          <template #buttons>
            <BAnchor @click="roleHandler.edit()" icon="solid add" gapright>Add Role...</BAnchor>
            <BConfirm @confirm="roleHandler.delete()"
                class="anchor"
                gapleft
                :disabled="!rolesConfig.pickedRow"
                color="red"
                icon="solid x">Remove?
              <template #message>Remove role '{{ rolesConfig.pickedRow }}?'</template>
            </BConfirm>
          </template>
        </BTable>
        <BTable style="margin-top: 1.2em;"
            :config="rightsConfig" :rows="app.config.rights"
            @pick="(row:any) => handlePickRight(row)"
            @dblpick="() => rightHandler.edit()"
            heading="Activity Rights">
          <template #column_source="{row,td}">{{ decodeSource(row,td) }}</template>
          <template #column_value="{row}">{{ decodeValue(row) }}</template>
          <template #buttons>
            <BAnchor :disabled="!rightsConfig.pickedRow" icon="solid edit_" @click="rightHandler.edit()">Set User Override...</BAnchor>
          </template>
        </BTable>
      </td>
    </tr>
  </tbody>
  </table>
  <dialog :id="roleHandler.popupId">
    <div class="titlebar">Add Role to User</div>
    <span class="info">Click on a role to add it</span>
    <ul style="margin-top: .4em;">
      <template v-for="r of app.config.roles" :key="r.code">
      <li v-if="userStore.user.config.roles.indexOf(r.code) < 0" class="anchor" @click="roleHandler.add(r.code)" :value="r.code">{{ r.descr }}</li>
      </template>
    </ul>
    <div class="buttonbar">
      <BAnchor @click="roleHandler.close()" icon="#red solid x_">Cancel</BAnchor>
    </div>
  </dialog>

  <dialog :id="rightHandler.popupId">
    <div class="titlebar">Right Code {{ rightsConfig.pickedRow?.code }}</div>
    <form @submit.prevent="rightHandler.save()">
      <span :innerHTML="inspectRight()"/>
      <table v-if="rightsConfig.pickedRow" class="form-table" style="margin-top: .5em;">
        <tbody>
          <tr>
            <th>User Override:</th>
            <td>
              <select v-model="pickedRightValue" class="SETTINGS_PAGE_SAVE_USER_RIGHT">
                <option value="">*None*</option>
                <option v-for="opt of rightsConfig.pickedRow.values" :key="opt" :value="opt">{{ opt }}</option>
              </select>&nbsp;
            </td>
          </tr>
        </tbody>
      </table>
      <div class="buttonbar">
        <BAnchor @click="rightHandler.close()" icon="#red solid x_">Cancel</BAnchor>
        <BButton gapleft class="modern" icon="#lime solid check_">Save</BButton>
      </div>
    </form>
  </dialog>

</template>

<style lang="css" scoped></style>
