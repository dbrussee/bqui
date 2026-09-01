<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { appProspectStore } from "../stores/ProspectStore.ts";
const prospectStore = appProspectStore();
import { appUserStore } from "../stores/AppUserStore.ts";
const userStore = appUserStore();
import { B } from "@/composables/BUtils";
import { useId, ref } from "vue";
import BIcon from "./B/BIcon.vue";
import BButton from "./B/BButton.vue";
import BInfo from "./B/BInfo.vue";

const fave = (pid: number, isFavorite: boolean) => {
  prospectStore.setFavorite(pid, isFavorite);
};

const isCurrentlyFavorite = () => {
  if (!userStore.user || !userStore.user.faves || !prospectStore.prospect) return false;
  let rslt = false;
  for (let i = 0; i < userStore.user.faves.length; i++) {
    if (userStore.user.faves[i].pid == prospectStore.prospect.id) {
      rslt = true;
      break;
    }
  }
  return rslt;
}
const prospHandler = ref({
  id: useId(),
  temp: {} as any,
  edit: () => {
    prospHandler.value.temp = {...prospectStore.prospect}
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  save: () => {
    prospectStore.prospect = {...prospHandler.value.temp}
    prospectStore.updateProspect(prospectStore.prospect)
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  },
  abort: () => {
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.close()
  }
})
const prospectCSZ = (prosp:any) => {
  let cnty = prosp.county
  if (!cnty) cnty = "<span style='color:silver;'>No County</span>"
  return `${prosp.city}, ${prosp.state_cd}&nbsp; ${prosp.zip_cd} <i style='font-size: .9em'>(${cnty})</i>`
}

</script>

<style scoped>
.prospect_info {
  position: relative;
  min-height: 4.7em;
  /* background-color: pink; */
}
</style>

<template>
  <!-- <div class="prospect_info"> -->
  <div v-if="prospectStore.issue?.severity == 'FATAL'">
    <BIcon icon="#red solid bug_">{{ prospectStore.issue.message }}</BIcon>
  </div>
  <div v-if="prospectStore.issue?.severity == 'INFO'">
    <BIcon icon="#sienna solid circle-exclamation_">{{ prospectStore.issue.message }}</BIcon>
  </div>

  <div v-if="prospectStore.isLoading" class="prospect_info LOADING">
    Loading...
  </div>
  <div v-if="!prospectStore.issue?.severity && !prospectStore.isLoading && prospectStore.prospect" class="prospect_info AAA">
    Prospect ID: {{ prospectStore.prospect.id }}
    <BInfo pos="R2B" heading="Prospect Details">
      <ul>
        <li>Agent of Record: {{ prospectStore.prospect.agent_id }}</li>
        <li>Subscribers Estimate: {{ prospectStore.prospect.subs_estimate }}
          <ul>
            <li v-if="!prospectStore.prospect.census || prospectStore.prospect.census.length == 0">Census: <span style='color: red;'>None</span></li>
            <li v-else>Census: {{ prospectStore.prospect.census.length }}</li>
          </ul>
        </li>
        <li>Size Code: {{ prospectStore.prospect.size_cd }}, Type: {{ prospectStore.prospect.group_type }}</li>
        <li>Created By: {{ prospectStore.prospect.created_by }}<ul>
          <li>On: {{ B.format.ts(prospectStore.prospect.created_ts) }}</li>
        </ul></li>
        <li v-if="prospectStore.prospect.last_quoted_ts">Last Quoted: {{ B.format.ts(prospectStore.prospect.last_quoted_ts) }}</li>
        <li v-if="prospectStore.prospect.enrolled_ts">Enrolled: {{ B.format.ts(prospectStore.prospect.enrolled_ts) + " as " + prospectStore.prospect.grpnum }}</li>
      </ul> </BInfo
    >
    &nbsp;&nbsp;&nbsp;
    <BIcon tt="Toggle Bookmark" :icon="isCurrentlyFavorite() ? '#darkred solid bookmark_' : '#gray regular bookmark_'"
      @click="fave(prospectStore.prospect.id, !isCurrentlyFavorite())" />
    <div style="display: flex; align-items: flex-start;">
      <table class="form-table">
        <tbody>
          <tr><td>
            <BIcon v-if="prospectStore.prospect" as="anchor"
              @click="prospHandler.edit()"
              icon="edit_">{{ prospectStore.prospect ? prospectStore.prospect.name : '&nbsp;' }}</BIcon>
          </td></tr>
          <tr><td>{{ prospectStore.prospect.addr1 }}{{ prospectStore.prospect.addr2 ? ', ' + prospectStore.prospect.addr2 : '' }}</td></tr>
          <tr><td v-html="prospectCSZ(prospectStore.prospect)"></td></tr>
        </tbody>
      </table>
      <table class="form-table" style="margin-left: 2em;">
        <tbody>
          <tr><td>{{prospectStore.prospect.contact}}</td></tr>
          <tr><td><a v-if="prospectStore.prospect.email" style="cursor: pointer"
            :href="'mailto:' + encodeURI(`${prospectStore.prospect.contact} <${prospectStore.prospect.email}>`)">{{prospectStore.prospect.email}}</a></td></tr>
          <tr><td>{{prospectStore.prospect.phone}}</td></tr>
        </tbody>
      </table>
      <table class="form-table" style="margin-left: 2em;">
        <tbody>
          <tr><th>Created:</th><td>{{ B.format.ts(prospectStore.prospect.created_ts) }}</td></tr>
          <tr><th>Last Quoted:</th><td>{{ B.ifNull(B.format.ts(prospectStore.prospect.last_quote?.crttms), 'No quotes') }}
            <BInfo v-if="prospectStore.prospect.last_quote" pos="L" heading="Last Quote Details">
              <ul>
                <li>Quote ID: {{ prospectStore.prospect.last_quote.id }} ({{ prospectStore.prospect.last_quote.qtype }} {{ prospectStore.prospect.last_quote.funding }} {{ prospectStore.prospect.last_quote.rlob }})</li>
                <li>Effective: {{ B.format.effdat(prospectStore.prospect.last_quote.effdat) }}</li>
                <li v-if="prospectStore.prospect.last_quote.med_plan">MED Plan: {{ prospectStore.prospect.last_quote.med_plan }}</li>
                <li v-if="prospectStore.prospect.last_quote.dru_plan">DRU Plan: {{ prospectStore.prospect.last_quote.dru_plan }}</li>
                <li v-if="prospectStore.prospect.last_quote.den_plan">DEN Plan: {{ prospectStore.prospect.last_quote.den_plan }}</li>
                <li v-if="prospectStore.prospect.last_quote.vis_plan">VIS Plan: {{ prospectStore.prospect.last_quote.vis_plan }}</li>
                <li>Created: {{ B.format.ts(prospectStore.prospect.last_quote.crttms) }}</li>
                <li>By: {{ prospectStore.prospect.last_quote.crtusr }}</li>
              </ul>
            </BInfo>

          </td></tr>
          <tr><th>Enrolled:</th><td>{{ B.ifNull(B.format.ts(prospectStore.prospect.enolled_ts), 'Not enrolled') }}</td></tr>
        </tbody>
      </table>
    </div>
    <!-- </div> -->
  </div>
  <div v-if="!prospectStore.issue?.severity && !prospectStore.isLoading && !prospectStore.prospect" class="prospect_info BBB">
    No prospect is currently selected.
    <ul style="margin-top: .5em">
      <li>Use the [ <BIcon icon="square-plus_">New Prospect...</BIcon>] button to create a new Prospect</li>
      <li>Use the [ <BIcon icon="solid list-ul_">Recent</BIcon> ] link to show a history of your recent Prospects</li>
      <li>Use the [ <BIcon icon="bookmark_">Bookmarked</BIcon> ] link to pick from one of your bookmarked Prospects</li>
      <li>Use the [ <BIcon icon="solid magnifying-glass_">Search...</BIcon> ] Search button above to find prospects by ID or by name</li>
    </ul>
  </div>
  <dialog v-if="prospectStore.prospect" :id="prospHandler.id">
    <form @submit.prevent="prospHandler.save()">
    <div class="titlebar">
      Edit Prospect {{ prospectStore.prospect.id }}
    </div>
    <table class="form-table">
      <tbody>
        <tr><th>Group Name:</th><td><input name="grpname" style="width: 30em;" v-model="prospHandler.temp.name"></td></tr>
        <tr><th>Contact:</th><td><input name="grpcontact" style="width: 30em;" v-model="prospHandler.temp.contact"></td></tr>
        <tr><th>Email:</th><td><input name="grpemail" style="width: 30em;" v-model="prospHandler.temp.email"></td></tr>
        <tr><th>Phone:</th><td><input name="grpphone" style="width: 12em;" v-model="prospHandler.temp.phone"></td></tr>
        <tr><th>Subscribers:</th><td><input name="estimate" style="width: 5em;" v-model="prospHandler.temp.subs_estimate"> <span class="info">(estimate)</span></td></tr>
        <tr><th>Address:</th><td><input name="grpaddr1" style="width: 30em;" v-model="prospHandler.temp.addr1"></td></tr>
        <tr><th></th><td><input name="grpaddr2" style="width: 30em;" v-model="prospHandler.temp.addr2"></td></tr>
        <tr><th></th><td>
          <input name="grpcity" style="width: 12em; margin-right: .3em;" v-model="prospHandler.temp.city">
          <input name="grpstate" style="width: 3em; margin-right: .3em;" v-model="prospHandler.temp.state_cd">
          <input name="grpzip" style="width: 6em;" v-model="prospHandler.temp.zip_cd">
        </td></tr>
        <tr><th>Enroll Date:</th><td><input name="enrollDate" style="width: 10em;" v-model="prospHandler.temp.enroll_date"></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <BButton class="anchor" style="margin-right: .6em;" @click="prospHandler.abort()" icon="#red solid x">Cancel</BButton>
            <BButton type="submit" class="action" icon="floppy-disk_"> Save Prospect</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
    </form>
  </dialog>
</template>
