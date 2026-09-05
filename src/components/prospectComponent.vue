<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { appProspectStore } from "../stores/ProspectStore.ts";
const prospStore = appProspectStore();
import { B } from "@/composables/BUtils";
import { useId, ref } from "vue";
import BIcon from "./B/BIcon.vue";
import BButton from "./B/BButton.vue";
import BInfo from "./B/BInfo.vue";
import BPopup from "./B/BPopup.vue";
import BConfirm from "./B/BConfirm.vue";

const menuPopup = ref()

const prospHandler = ref({
  id: useId(),
  temp: {} as any,
  edit: () => {
    prospHandler.value.temp = {...prospStore.prospect}
    const popup = document.getElementById(prospHandler.value.id) as HTMLDialogElement
    popup?.showModal()
  },
  save: () => {
    prospStore.prospect = {...prospHandler.value.temp}
    prospStore.updateProspect(prospStore.prospect)
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

const removeMeFromRecents = () => {
  if (!prospStore.prospect) return
  menuPopup.value?.close()
  prospStore.removeMeFromRecents()
}

const handleBookmark = (isFav:boolean) => {
  menuPopup.value?.close()
  if (!prospStore.prospect) return
  prospStore.setFavorite(prospStore.prospect.id, isFav)
}
</script>

<style scoped>
.prospect_info {
  position: relative;
  min-height: 3.7em;
  /* background-color: pink; */
}
</style>

<template>
  <!-- <div class="prospect_info"> -->
  <div v-if="prospStore.issue?.severity == 'FATAL'">
    <BIcon icon="#red solid bug_">{{ prospStore.issue.message }}</BIcon>
  </div>
  <div v-if="prospStore.issue?.severity == 'INFO'">
    <BIcon icon="#sienna solid circle-exclamation_">{{ prospStore.issue.message }}</BIcon>
  </div>

  <div v-if="prospStore.isLoading" class="prospect_info LOADING">
    Loading...
  </div>
  <div v-if="!prospStore.issue?.severity && !prospStore.isLoading && prospStore.prospect" class="prospect_info AAA">
    <div style="display: flex; align-items: flex-start;">
      <table class="form-table">
        <tbody>
          <tr><td>
            <BIcon v-if="prospStore.prospect" as="anchor"
              @click="prospHandler.edit()"
              icon="edit_">{{ prospStore.prospect ? prospStore.prospect.name : '&nbsp;' }}</BIcon>
          </td></tr>
          <tr><td>{{ prospStore.prospect.addr1 }}{{ prospStore.prospect.addr2 ? ', ' + prospStore.prospect.addr2 : '' }}</td></tr>
          <tr><td v-html="prospectCSZ(prospStore.prospect)"></td></tr>
        </tbody>
      </table>
      <table class="form-table" style="margin-left: 2em;">
        <tbody>
          <tr><td>{{prospStore.prospect.contact}}</td></tr>
          <tr><td><a v-if="prospStore.prospect.email" style="cursor: pointer"
            :href="'mailto:' + encodeURI(`${prospStore.prospect.contact} <${prospStore.prospect.email}>`)">{{prospStore.prospect.email}}</a></td></tr>
          <tr><td>{{prospStore.prospect.phone}}</td></tr>
        </tbody>
      </table>
      <table class="form-table" style="margin-left: 2em;">
        <tbody>
          <tr><th>Created:</th><td>{{ B.format.ts(prospStore.prospect.created_ts) }}</td></tr>
          <tr><th>Last Quoted:</th><td>{{ B.ifNull(B.format.ts(prospStore.prospect.last_quote?.crttms), 'No quotes') }}
            <BInfo v-if="prospStore.prospect.last_quote" pos="L" heading="Last Quote Details">
              <ul>
                <li>{{ B.codeToText.nonstd(prospStore.prospect.last_quote.nonstd) }}
                  {{ B.codeToText.qtype(prospStore.prospect.last_quote.qtype) }} Quote ID: {{ prospStore.prospect.last_quote.id }}
                  ({{ prospStore.prospect.last_quote.funding }} {{ prospStore.prospect.last_quote.rlob }})
                </li>
                <li>Effective: {{ B.format.effdat(prospStore.prospect.last_quote.effdat) }}</li>
                <li>Status: {{ B.codeToText.quoteStatus(prospStore.prospect.last_quote.status) }}</li>
                <li v-if="prospStore.prospect.last_quote.med_plan">MED Plan: {{ prospStore.prospect.last_quote.med_plan }}</li>
                <li v-if="prospStore.prospect.last_quote.dru_plan">DRU Plan: {{ prospStore.prospect.last_quote.dru_plan }}</li>
                <li v-if="prospStore.prospect.last_quote.den_plan">DEN Plan: {{ prospStore.prospect.last_quote.den_plan }}</li>
                <li v-if="prospStore.prospect.last_quote.vis_plan">VIS Plan: {{ prospStore.prospect.last_quote.vis_plan }}</li>
                <li>Created: {{ B.format.ts(prospStore.prospect.last_quote.crttms) }}</li>
                <li>By: {{ prospStore.prospect.last_quote.crtusr }}</li>
              </ul>
            </BInfo>

          </td></tr>
          <tr><th>Enrolled:</th><td>{{ B.ifNull(B.format.ts(prospStore.prospect.enolled_ts), 'Not enrolled') }}</td></tr>
        </tbody>
      </table>
      <div style="position: absolute; right: 0;">
        <BPopup ref="menuPopup" class="anchor" icon="solid bars" style="font-size:1.5em" pos="L2B">
          <template #body>
            <p>
              <BButton v-if="!prospStore.isCurrentlyFavorite()" @click="handleBookmark(true)" class="anchor" icon="#gold solid bookmark_">Bookmark Prospect</BButton>
              <BButton v-else @click="handleBookmark(false)" class="anchor" icon="#gold bookmark_">Un-Bookmark Prospect</BButton>
            </p>
            <hr/>
            <p><BConfirm @confirm="removeMeFromRecents()" width="30em" pos="L" class="anchor" icon="#black solid eject_" heading="Forget Prospect">
              Forget Prospect&hellip;
              <template #message>
                <ul>
                  <li class="info">Remove this prospect from your Recents list</li>
                  <li class="info">Load the next most recent prospect in the list.</li>
                </ul>
                <p>
                  It will <b style="color:red"><u>NOT</u></b> delete the prospect from the system,
                  so it can be found in your Bookmarks or searched
                  for at any time.
                </p>
                <p>Continue?</p>
              </template>
            </BConfirm></p>
          </template>
        </BPopup>

      </div>
    </div>
    <!-- </div> -->
  </div>
  <div v-if="!prospStore.issue?.severity && !prospStore.isLoading && !prospStore.prospect" class="prospect_info BBB">
    No prospect is currently selected.
    <ul style="margin-top: .5em">
      <li>Use the [ <BIcon icon="square-plus_">New Prospect...</BIcon>] button to create a new Prospect</li>
      <li>Use the [ <BIcon icon="solid list-ul_">Recent</BIcon> ] link to show a history of your recent Prospects</li>
      <li>Use the [ <BIcon icon="bookmark_">Bookmarked</BIcon> ] link to pick from one of your bookmarked Prospects</li>
      <li>Use the [ <BIcon icon="solid magnifying-glass_">Search...</BIcon> ] Search button above to find prospects by ID or by name</li>
    </ul>
  </div>
  <dialog v-if="prospStore.prospect" :id="prospHandler.id">
    <form @submit.prevent="prospHandler.save()">
    <div class="titlebar">
      Edit Prospect Number {{ prospStore.prospect.id }}
    </div>
    <table class="form-table">
      <tbody>
        <tr><th>Group Name:</th><td><input name="grpname" style="width: 30em;" v-model="prospHandler.temp.name"></td></tr>
        <tr><th>Contact:</th><td><input name="grpcontact" style="width: 30em;" v-model="prospHandler.temp.contact"></td></tr>
        <tr><th>Email:</th><td><input name="grpemail" style="width: 30em;" v-model="prospHandler.temp.email"></td></tr>
        <tr><th>Phone:</th><td><input name="grpphone" style="width: 12em;" v-model="prospHandler.temp.phone"></td></tr>
        <tr><th>Eligible:</th><td><input name="estimate" style="width: 5em;" v-model="prospHandler.temp.subs_estimate"> <span class="info">(estimate)</span></td></tr>
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
            <BButton type="submit" class="action" icon="floppy-disk_"> Save Changes</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
    </form>
  </dialog>
</template>
