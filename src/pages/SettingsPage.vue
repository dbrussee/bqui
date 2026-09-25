<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from "@/components/B/BTable.vue";
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appProspectStore } from "@/stores/ProspectStore";
const prospStore = appProspectStore()
import { appStore } from "@/stores/AppStore";
const app = appStore()
import { B } from "@/composables/BUtils.ts";
import BAnchor from "@/components/B/BAnchor.vue";
import { ref, useId, computed } from "vue";
import BButton from "@/components/B/BButton.vue";
import BIcon from "@/components/B/BIcon.vue";
import { useDark } from '@vueuse/core';
import ClipboardIcon from "@/components/ClipboardIcon.vue";
import BConfirm from "@/components/B/BConfirm.vue";

const isDark = useDark({
  storageKey: null // 🚫 Disables reading and writing to localStorage
})

// const overrideRef = ref<InstanceType<typeof BPopup> | null>(null)
const roleHandler = {
  popupId: useId(),
  open() { (document.getElementById(roleHandler.popupId) as HTMLDialogElement).showModal() },
  close() { (document.getElementById(roleHandler.popupId) as HTMLDialogElement).close() },
  toggle(code:string) {
    if (userStore.user.config.roles.indexOf(code) < 0) {
      this.add(code)
    } else {
      this.delete(code)
    }
  },
  add(rolecode:string):void {
    userStore.addRole(rolecode);
    // rolesConfig.value.pickedRow = null
    // this.close()
  },
  delete(rolecode:string) {
    userStore.deleteRole(rolecode) // The row is just the role code
    // rolesConfig.value.pickedRow = null
    // this.close()
  }
}
const rightHandler = {
  popupId: useId(),
  open() { (document.getElementById(this.popupId) as HTMLDialogElement).showModal() },
  close() { (document.getElementById(this.popupId) as HTMLDialogElement).close() },
  saveOverride(rightCode:string, value:string) {
    if (value == '') {
      userStore.deleteUserRight(rightCode)
      rightsConfig.value.pickedRow = null
    } else {
      userStore.setUserRightValue(rightCode, value)
      rightsConfig.value.pickedRow = null
    }
    this.close()
  },
  save() {
    const sel = document.querySelector(".SETTINGS_PAGE_SAVE_USER_RIGHT") as HTMLSelectElement
    if (sel.value == '') {
      userStore.deleteUserRight(rightsConfig.value.pickedRow.code)
      rightsConfig.value.pickedRow = null
    } else {
      userStore.setUserRightValue(rightsConfig.value.pickedRow.code, sel.value)
      rightsConfig.value.pickedRow = null
    }
    this.close()
  },
}

// const rolesConfig = ref({
//   // height: "calc(100vh - 17em)",
//   height: "7em",
//   width: "25em",
//   pickedRow: null as any,
//   columns: [
//     { id: "role", heading: "Role", flags: "C", width: "4em"},
//     { id: "descr", heading: "Description" }
//   ]
// })

const rightsConfig = ref({
  // height: "calc(100vh - 9em)",
  height: "calc(100vh - 10.5em)",
  width: "calc((100vw - 200px) / 2)",
  pickedRow: null as any,
  columns: [
    { id: "descr", heading: "Activity Description" },
    { id: "value", heading: "Value", flags: "C", width: "5em", cellclass: 'mono' },
    { id: "source", heading: "Source", cellclass: 'mono' },
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
            html += `<li>Role ${appRole.code}: ${rr.value}</li>`
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
  return userStore.getUserSetting('theme','auto')
})
</script>

<template>
  <table style="width: 100%">
    <tbody>
    <tr>
      <td style="vertical-align: top; padding-right: 2em; width: 50%;">
        <table class="form-table" style="margin-bottom: 1em; width: 100%;">
          <tbody>
            <tr><th>Logged In User:</th><td class="mono">{{ userStore.user.id }}</td></tr>
            <tr><th>Name:</th><td>{{ userStore.user.lstnam }}, {{ userStore.user.fstnam }}</td></tr>
            <tr><th>Status:</th><td>{{ B.codeToText.userStatus(userStore.user.status) }}</td></tr>
            <tr><th>Email:</th><td>
              <a v-if="userStore.user.email != ''" style="cursor: pointer"
              :href="'mailto:' + encodeURI(`${userStore.user.fstnam} ${userStore.user.lstnam} <${userStore.user.email}>`)">{{userStore.user.email}}</a>
              <ClipboardIcon :cliptext="userStore.user.email"/>
            </td></tr>
            <tr><th>Agency:</th><td :innerHTML="agencyDetails()"/></tr>
            <!-- <tr><th>Last Login:</th><td>{{ B.format.ts(userStore.user.lst_login) }}</td></tr> -->
            <tr><td colspan="2" style="text-align: center; padding-top: .5em;">
              <BConfirm
                icon="solid arrow-right-from-bracket_"
                :warning="prospStore.censusDirty ? 'You will lose unsaved census changes!' : ''"
                class="anchor"
                pos="T" @confirm="userStore.logout()">Logout?
                <template #message>
                  Log out user '{{ userStore.user.id }}'
                </template>
              </BConfirm>
            </td></tr>
            <tr><td colspan="2"><div class="buttonbar"/></td></tr>
            <tr><th>Assigned Roles:</th><td>
              <BButton class="anchor"
              @click="roleHandler.open()"
              icon="solid pen_" />
              <span class="mono">{{ userStore.user.config.roles.join(", ") }}</span>
            </td></tr>
            <tr><th>Theme:</th><td>
              <label><input @click="userStore.saveSetting('theme','auto').then(() => { userStore.applyTheme()})" type='radio' name='user_theme' :checked="getUserTheme == 'auto'" value=''> Auto ({{ isDark ? 'Dark' : 'Light' }})</label>&nbsp;&nbsp;
              <label><input @click="userStore.saveSetting('theme','light').then(() => { userStore.applyTheme()})" type='radio' name='user_theme' :checked="getUserTheme == 'light'" value='light'> Light</label>&nbsp;&nbsp;
              <label><input @click="userStore.saveSetting('theme','dark').then(() => { userStore.applyTheme()})" type='radio' name='user_theme' :checked="getUserTheme == 'dark'" value='dark'> Dark</label>
            </td></tr>
          </tbody>
        </table>
        <p style="color:orange"><i>Editing of roles / rights will move to the Maintenance app in time</i></p>
      </td>
      <td style="vertical-align: top;">
        <BTable :config="rightsConfig" :rows="app.config.rights"
            @pick="(row:any) => handlePickRight(row)"
            @dblpick="() => rightHandler.open()"
            heading="Activity Rights">
          <template #column_source="{row,td}">{{ decodeSource(row,td) }}</template>
          <template #column_value="{row}">{{ decodeValue(row) }}</template>
          <template #buttons>
            <BAnchor :disabled="!rightsConfig.pickedRow" icon="solid edit_" @click="rightHandler.open()">Set User Override...</BAnchor>
          </template>
        </BTable>
      </td>
    </tr>
  </tbody>
  </table>
  <dialog :id="roleHandler.popupId">
    <div class="titlebar">Assigned Roles</div>
    <ul style="list-style:none; padding-left: .5em; margin-top: .4em;">
      <template v-for="r of app.config.roles" :key="r.code">
        <li @click="roleHandler.toggle(r.code)">
          <span class="anchor">
            <BIcon :icon="userStore.user.config.roles.indexOf(r.code) < 0 ? 'square' : 'square-check'">{{ r.descr }}</BIcon>
          </span>
          <span class="info"> ({{ r.code }})</span>
        </li>
      <!-- <li v-if="userStore.user.config.roles.indexOf(r.code) < 0" class="anchor" @click="roleHandler.add(r.code)" :value="r.code">{{ r.descr }}</li> -->
      </template>
    </ul>
    <div class="buttonbar">
      <BAnchor @click="roleHandler.close()" icon="#red solid x_">Close</BAnchor>
    </div>
  </dialog>

  <dialog :id="rightHandler.popupId">
    <div class="titlebar">Right Code {{ rightsConfig.pickedRow?.code }}</div>
    <form @submit.prevent="rightHandler.save()">
      <span :innerHTML="inspectRight()"/>
      <table v-if="rightsConfig.pickedRow" class="form-table" style="margin-top: .5em;">
        <tbody>
          <tr>
            <th colspan="2">User Override:</th>
          </tr>
          <tr>
            <td colspan="2">
              <ul style="list-style:none; padding-left: .5em;">
                <li class="anchor"
                  @click="rightHandler.saveOverride(rightsConfig.pickedRow.code, '')"><BIcon :icon="pickedRightValue == '' ? 'circle-dot_' : 'circle_'"/>No Override</li>
                <li class="anchor" v-for="opt of rightsConfig.pickedRow.values" :key="opt"
                  @click="rightHandler.saveOverride(rightsConfig.pickedRow.code, opt)"
                  ><BIcon :icon="pickedRightValue == opt ? 'circle-dot_' : 'circle_'"/>{{ opt }}</li>
              </ul>
              <!-- <select v-model="pickedRightValue" class="SETTINGS_PAGE_SAVE_USER_RIGHT" :size="rightsConfig.pickedRow.values.length + 1">
                <option value="">*None*</option>
                <option v-for="opt of rightsConfig.pickedRow.values" :key="opt" :value="opt">{{ opt }}</option>
              </select>&nbsp; -->
            </td>
          </tr>
        </tbody>
      </table>
      <div class="buttonbar">
        <BAnchor @click="rightHandler.close()" icon="#red solid x_">Cancel</BAnchor>
        <!-- <BButton gapleft class="modern" icon="#lime solid check_">Save</BButton> -->
      </div>
    </form>
  </dialog>

</template>

<style lang="css" scoped></style>
