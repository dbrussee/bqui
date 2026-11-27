<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from "@/components/B/BTable.vue";
import { appUserStore } from "../stores/AppUserStore";
const uStore = appUserStore();
import { appProspectStore } from "@/stores/ProspectStore";
const pStore = appProspectStore()
import { appStore } from "@/stores/AppStore";
const app = appStore()
import { B } from "@/composables/BUtils.ts";
import BAnchor from "@/components/B/BAnchor.vue";
import { ref, useId, computed } from "vue";
import BButton from "@/components/B/BButton.vue";
import BIcon from "@/components/B/BIcon.vue";
import { usePreferredDark } from '@vueuse/core';
import ClipboardIcon from "@/components/ClipboardIcon.vue";
import BConfirm from "@/components/B/BConfirm.vue";
import BInfo from "@/components/B/BInfo.vue";
import BDropdownMenu from "@/components/B/BDropdownMenu.vue";

const isPreferredDark = usePreferredDark()

const roleHandler = {
  popupId: useId(),
  open() { (document.getElementById(roleHandler.popupId) as HTMLDialogElement).showModal() },
  close() { (document.getElementById(roleHandler.popupId) as HTMLDialogElement).close() },
  toggle(code:string) {
    if (uStore.user?.config.roles.indexOf(code) < 0) {
      this.add(code)
    } else {
      this.delete(code)
    }
  },
  add(rolecode:string):void {
    uStore.addRole(rolecode);
    // rolesConfig.value.pickedRow = null
    // this.close()
  },
  delete(rolecode:string) {
    uStore.deleteRole(rolecode) // The row is just the role code
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
      uStore.deleteUserRight(rightCode)
      rightsConfig.value.pickedRow = null
    } else {
      uStore.setUserRightValue(rightCode, value)
      rightsConfig.value.pickedRow = null
    }
    if (rightCode == 'SEARCH_SCOPE') {
      uStore.getDashboard()
    }
    this.close()
  },
  save() {
    const sel = document.querySelector(".SETTINGS_PAGE_SAVE_USER_RIGHT") as HTMLSelectElement
    const rightCode = rightsConfig.value.pickedRow.code
    if (sel.value == '') {
      uStore.deleteUserRight(rightCode)
      rightsConfig.value.pickedRow = null
    } else {
      uStore.setUserRightValue(rightCode, sel.value)
      rightsConfig.value.pickedRow = null
    }
    if (rightCode == 'SEARCH_SCOPE') {
      uStore.getDashboard()
    }
    this.close()
  },
}

const computedRightsList = computed(() => {
  if (!app.config.rights) return []
  const list = Object.entries(app.config.rights).map(([key, innerObj]) => {
    const obj = innerObj as any
    return {
      code: key,
      listpos: obj.listpos,
      descr: app.config.rights[key].descr,
      value: obj.value,
      source: obj.source,
    };
  })
  list.sort((a, b) => a.listpos > b.listpos ? 1 : -1)
  return list
})
const rightsConfig = ref({
  columns: [
    { id: "descr", heading: "Activity Description" },
    { id: "source", heading: "Source", flags: "R" },
    { id: "value", heading: "Value", flags: "C", width: "5em", cellclass: 'mono' },
  ],
  pickedRow: null as any,
  onPick: (row:any) => rightsConfig.value.pickedRow = row,
  onDblpick: () => rightHandler.open(),
  heading: "Activity Rights",
  // height: "calc(100vh - 9em)",
  height: "calc(100vh - 9.5em)",
  width: "calc((100vw - 200px) / 2)"
})

const decodeSource = (configRight:any, setStyle:any, setHtml:any):void => {
  setStyle((cell:HTMLTableCellElement) => {
    if (!cell) return
    const rightCode = configRight.code
    if (!rightCode) setHtml("What?")
    const userRight = uStore.user?.rights[rightCode]
    if (userRight.source == "@USER") {
      cell.style.color = "firebrick"
      cell.style.textShadow = ""
      setHtml("User")
    } else if (userRight.source == "@DFLT") {
      cell.style.color = ""
      cell.style.textShadow = ""
      setHtml("")
    } else {
      cell.style.color = ""
      cell.style.textShadow = ""
      cell.classList.add("mono")
      setHtml(`<i>${userRight.source}</i>`)
    }
  })
}
const decodeValue = (configRight:any):string => {
  const rightCode = configRight.code
  if (!rightCode) return "What?"
  const userRight = uStore.user?.rights[rightCode]
  return userRight.value
}


const agencyDetails = () => {
  if (!uStore.user?.agency_id || uStore.user?.agency_id == -1) return "<span style='color: var(--ui-disabled-text)'>None</span>"
  if (uStore.user?.agency_descr == null) return `<span style='color: red'>Unknown agency (${uStore.user?.agency_id})</span>`
  return `${uStore.user?.agency_descr}`
}

const pickedRightValue = ref<string>('')
const inspectRight = ():string => {
  if (!rightsConfig.value.pickedRow) return ""
  const rightCode = rightsConfig.value.pickedRow.code
  // const userRight = userStore.user.rights[rightCode]
  let html = `Default: ${app.config.rights[rightCode].default_value}`;
  html += "<ul>"
  uStore.user?.config.roles.forEach((myrole:string) => {
    const appRole = app.config.roles[myrole]
    appRole.rights.forEach((rr:any) => {
      if (rr.right == rightCode) {
        html += `<li>Role ${myrole} &gt; ${rr.value}</li>`
      }
    })
  })
  const userRight = uStore.user?.rights[rightCode]
  if (userRight.source == '@USER') {
    pickedRightValue.value = userRight.value
    // html += `<li>User: ${userRight.value}</li>`
  } else {
    pickedRightValue.value = ''
  }

  html += "</ul>"
  return html
}

const getRightLongDescription = ():string => {
  if (!rightsConfig.value.pickedRow) return ""
  const rightCode = rightsConfig.value.pickedRow.code
  return app.config.rights[rightCode].long_descr
}

</script>

<template>
  <table style="width: 100%">
    <tbody>
    <tr>
      <td style="vertical-align: top; padding-right: 2em; width: 50%;">
        <table class="form-table" style="margin-bottom: 1em; width: 100%;">
          <tbody>
            <tr><th>Logged In User:</th><td class="mono">{{ uStore.user?.id }}</td></tr>
            <tr><th>Name:</th><td>{{ uStore.user?.lstnam }}, {{ uStore.user?.fstnam }}</td></tr>
            <tr><th>Status:</th><td>{{ B.codeToText.userStatus(uStore.user?.status) }}</td></tr>
            <tr><th>Email:</th><td>
              <a v-if="uStore.user?.email != ''" style="cursor: pointer"
              :href="'mailto:' + encodeURI(`${uStore.user?.fstnam} ${uStore.user?.lstnam} <${uStore.user?.email}>`)">{{uStore.user?.email}}</a>
              <ClipboardIcon :cliptext="uStore.user?.email"/>
            </td></tr>
            <tr><th>Agency:</th><td :innerHTML="agencyDetails()"/></tr>
            <!-- <tr><th>Last Login:</th><td>{{ B.format.ts(userStore.user?.lst_login) }}</td></tr> -->
            <tr><td colspan="2" style="text-align: center; padding-top: .5em;">
              <BConfirm
                icon="solid arrow-right-from-bracket_"
                :warning="pStore.censusDirty ? 'You will lose unsaved census changes!' : ''"
                class="anchor"
                pos="T" @confirm="uStore.logout()">Logout?
                <template #message>
                  Log out user '{{ uStore.user?.id }}'
                </template>
              </BConfirm>
            </td></tr>
            <tr><td colspan="2"><div class="buttonbar"/></td></tr>
            <tr><th>Theme:</th><td>
              <BDropdownMenu heading="Theme"
                :options="[
                  {value:'', text:`Auto (${isPreferredDark ? 'Dark' : 'Light'})` },
                  '--',
                  {value:'dark', text:'Dark', icon:'solid moon_'},
                  {value:'light', text:'Light', icon:'sun_'},
                ]"
                :value="uStore.getUserSetting('theme','')"
                @change="(val) => uStore.setTheme(val)" />
            </td></tr>
            <tr><th>Starting Tab:</th><td>
              <BDropdownMenu heading="Starting tab"
                :options="[
                  {value:'', text:'Dashboard', icon:'solid chart-simple_'},
                  {value:'PROSPECT', text:'Prospect', icon:'solid shop_'},
                  {value:'CENSUS', text:'Census', icon:'solid people-group_'},
                  {value:'QUOTES', text:'Quotes', icon:'solid quote-right_'},
                  {value:'PROPOSALS', text:'Proposals', icon:'file-pdf_'},
                  {value:'MSGS', text:'Messages', icon:'envelope_'},
                ]"
                :value="uStore.getUserSetting('start_tab','')"
                @change="(val) => uStore.saveUserSetting('start_tab', val, false)" />
            </td></tr>
            <tr><td colspan="2">
              <br/>
              <p style="color:orange"><i>Editing of roles / rights will move to the Maintenance app in time</i></p>
            </td></tr>
            <tr><th>Assigned Roles:</th><td>
              <BButton class="anchor"
              @click="roleHandler.open()"
              icon="solid pen_" />
              <span v-for="(r,i) in uStore.user?.config.roles" :key="r">
                {{ (i as number) > 0 ? ', ' : '' }}<span class="mono">{{ r }}</span>
              </span>
            </td></tr>
          </tbody>
        </table>
      </td>
      <td style="vertical-align: top;">
        <BTable :config="rightsConfig" :rows="computedRightsList">
          <template #column_descr="{row}">{{ row.descr }}</template>
          <template #column_source="{row, setStyle, setHtml}">{{ decodeSource(row, setStyle, setHtml) }}</template>
          <template #column_value="{row}">{{ decodeValue(row) }}</template>
          <template #footer>
            <BAnchor :disabled="!rightsConfig.pickedRow" icon="solid edit_" @click="rightHandler.open()">Set User Override...</BAnchor>
          </template>
        </BTable>
      </td>
    </tr>
  </tbody>
  </table>
  <dialog :id="roleHandler.popupId">
    <div class="titlebar">Assigned Roles
      <BInfo pos="R" width="30em" heading="Role Descriptions">
        <ul>
          <li v-for="(value, key) in app.config.roles" :key="key">
            <b>{{ value.descr }}</b> ({{ key }})<br>{{ value.longdescr }}
          </li>
        </ul>
      </BInfo>
    </div>
    <ul style="list-style:none; padding-left: .5em; margin-top: .4em;">
      <template v-for="(value, key) in app.config.roles" :key="key">
        <li @click="roleHandler.toggle(key as string)" class="anchor" :value="key">
          <span class="anchor">
            <BIcon :icon="uStore.user?.config.roles.indexOf(key) < 0 ? 'square' : 'square-check'">{{ value.descr }}</BIcon>
          </span>
          <span class="info"> ({{ key }})</span>
        </li>
      <!-- <li v-if="userStore.user.config.roles.indexOf(r.code) < 0" class="anchor" @click="roleHandler.add(r.code)" :value="r.code">{{ r.descr }}</li> -->
      </template>
    </ul>
    <div class="buttonbar">
      <BAnchor @click="roleHandler.close()" icon="#red solid x_">Close</BAnchor>
    </div>
  </dialog>

  <dialog :id="rightHandler.popupId" style="width: 30em;">
    <div class="titlebar">Right Code {{ rightsConfig.pickedRow?.code }}</div>
    <p class="info" :innerHTML="getRightLongDescription()"></p>
    <form @submit.prevent="rightHandler.save()">
      <span :innerHTML="inspectRight()"/>
      <div style="margin-top: .3em">
        <span class="anchor" @click="rightHandler.saveOverride(rightsConfig.pickedRow.code, '')"><BIcon :icon="pickedRightValue == '' ? 'circle-dot_' : 'circle_'"/>No Override</span>
      </div>
      <div v-if="rightsConfig.pickedRow" class="form-table" style="margin-top: .5em;">
        This specific user can be assigned a value other than
        the one defined above...
        <p>
          <template v-for="(opt,rn) of app.config.rights[rightsConfig.pickedRow.code].values" :key="opt">
            <span v-if="(rn as number) > 0"> &nbsp; </span
            ><BAnchor
              @click="rightHandler.saveOverride(rightsConfig.pickedRow.code, opt)"
              :icon="pickedRightValue == opt ? 'circle-dot_' : 'circle_'">{{ opt }}</BAnchor>
          </template>
        </p>
      </div>
      <div class="buttonbar">
        <BAnchor @click="rightHandler.close()" icon="#red solid x_">Cancel</BAnchor>
        <!-- <BButton gapleft class="modern" icon="#lime solid check_">Save</BButton> -->
      </div>
    </form>
  </dialog>

</template>

<style lang="css" scoped></style>
