<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { appProspectStore } from "../stores/ProspectStore.ts";
const prospStore = appProspectStore();
import { appUserStore } from "@/stores/AppUserStore.ts";
const userStore = appUserStore()
import { B } from "@/composables/BUtils";
import { useId, ref } from "vue";
import BIcon from "./B/BIcon.vue";
import BButton from "./B/BButton.vue";
import BInfo from "./B/BInfo.vue";
import BPopup from "./B/BPopup.vue";
import BConfirm from "./B/BConfirm.vue";
// import BPopupMenuItem from "./B/BPopupMenuItem.vue";
import ClipboardIcon from "./ClipboardIcon.vue";


const menuPopup = ref()

const handler = {
  popId: useId(),
  temp: ref<any>({}),
  open() { (document.getElementById(this.popId) as HTMLDialogElement).showModal() },
  close() { (document.getElementById(this.popId) as HTMLDialogElement).close() },
  edit() {
    this.temp.value = {...prospStore.prospect}
    // B.deleteProperties(this.temp);
    this.open()
  },
  save() {
    prospStore.prospect = {...this.temp.value}
    prospStore.updateProspect(prospStore.prospect)
    this.close()
  },
  deleteProspect() {
    this.close()
    prospStore.deleteProspect()
  }
}
const prospectCSZ = (prosp:any) => {
  let cnty = prosp.county
  if (!cnty) cnty = "<span style='color:silver;'>No County</span>"
  return `${prosp.city}, ${prosp.state_cd}&nbsp; ${prosp.zip_cd} <i style='font-size: .9em'>(${cnty})</i>`
}

// const removeMeFromRecents = () => {
//   if (!prospStore.prospect) return
//   menuPopup.value?.close()
//   prospStore.removeMeFromRecents()
// }

// const handleBookmark = (isFav:boolean) => {
//   menuPopup.value?.close()
//   if (!prospStore.prospect) return
//   prospStore.setFavorite(prospStore.prospect.id, isFav)
// }
// const handleRefresh = () => {
//   prospStore.getProspect(prospStore.prospect.id, false)
// }

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

  <div v-if="!prospStore.prospect?.id && prospStore.prospWorking" class="prospect_info" style="text-align: center; padding-top: 3em;">
    <div class="spinner" />Loading...
  </div>
  <div v-if="!prospStore.issue?.severity && prospStore.prospect" class="prospect_info AAA">
    <div style="display: flex; align-items: flex-start;">
      <table class="form-table">
        <tbody>
          <tr><td>
            <BButton v-if="prospStore.prospect" class="anchor"
              @click="handler.edit()"
              icon="solid pen_">Edit Prospect Details</BButton>
          </td></tr>
          <tr><td>{{ prospStore.prospect.addr1 }}{{ prospStore.prospect.addr2 ? ', ' + prospStore.prospect.addr2 : '' }}</td></tr>
          <tr><td v-html="prospectCSZ(prospStore.prospect)"></td></tr>
        </tbody>
      </table>
      <table class="form-table" style="margin-left: 2em;">
        <tbody>
          <tr><td>{{prospStore.prospect.contact}}</td></tr>
          <tr><td><a v-if="prospStore.prospect.email" style="cursor: pointer"
            :href="'mailto:' + encodeURI(`${prospStore.prospect.contact} <${prospStore.prospect.email}>`)">{{prospStore.prospect.email}}</a>
            <ClipboardIcon :cliptext="prospStore.prospect.email"/>
          </td></tr>
          <tr><td>{{prospStore.prospect.phone}}</td></tr>
        </tbody>
      </table>
      <table class="form-table" style="margin-left: 2em;">
        <tbody>
          <!-- <tr><th>Created:</th><td>{{ B.format.ts(prospStore.prospect.crttms) }}</td></tr> -->
          <tr><th>Last Quoted:</th><td>{{ B.ifNull(B.format.ts(prospStore.prospect.last_quote?.crttms), 'No quotes') }}
            <BInfo v-if="prospStore.prospect.last_quote" pos="L" heading="Last Quote Details">
              <ul>
                <li>{{ B.codeToText.nonstd(prospStore.prospect.last_quote.nonstd) }}
                  {{ B.codeToText.qtype(prospStore.prospect.last_quote.qtype) }} Quote ID: {{ prospStore.prospect.last_quote.id }}
                  ({{ prospStore.prospect.last_quote.funding }} {{ prospStore.prospect.last_quote.rlob }})
                </li>
                <li>Effective: {{ B.format.effdat(prospStore.prospect.last_quote.effdat) }}</li>
                <li>Status: {{ B.codeToText.quoteStatus(prospStore.prospect.last_quote.status) }}</li>
                <li v-if="prospStore.prospect.last_quote.qtype == 'MED'">MED Plan: {{ prospStore.prospect.last_quote.med_plan }}</li>
                <li v-if="prospStore.prospect.last_quote.qtype == 'MED'">DRU Plan: {{ prospStore.prospect.last_quote.dru_plan }}</li>
                <li v-if="prospStore.prospect.last_quote.qtype == 'DEN'">DEN Plan: {{ prospStore.prospect.last_quote.den_plan }}</li>
                <li v-if="prospStore.prospect.last_quote.qtype == 'VIS'">VIS Plan: {{ prospStore.prospect.last_quote.vis_plan }}</li>
                <li>Created: {{ B.format.ts(prospStore.prospect.last_quote.crttms) }} ({{ prospStore.prospect.last_quote.crtusr }})</li>
                <li>Updated: {{ B.format.ts(prospStore.prospect.last_quote.updtms) }} ({{ prospStore.prospect.last_quote.updusr }})</li>
              </ul>
            </BInfo>

          </td></tr>
          <tr><th>Enrolled:</th><td>{{ B.ifNull(B.format.ts(prospStore.prospect.enrolled_ts), "Not Enrolled") }}</td></tr>
        </tbody>
      </table>
      <div style="position: absolute; right: 0;">
        <BPopup ref="menuPopup" class="anchor" icon="solid bars" style="font-size:1.5em" pos="L2B">
          <template #body>
            <div class="titlebar">Prospect Actions</div>
            <!-- <BPopupMenuItem icon="solid repeat" @click="handleRefresh()">Refresh Prospect</BPopupMenuItem> -->
            <!-- <BPopupMenuItem :icon="prospStore.isCurrentlyFavorite() ? '#goldenrod bookmark' : '#goldenrod solid bookmark'" @click="handleBookmark(!prospStore.isCurrentlyFavorite())">
              {{ prospStore.isCurrentlyFavorite() ? 'Un-Bookmark Prospect' : 'Bookmark Prospect' }}
            </BPopupMenuItem> -->
            <!-- <BPopupMenuItem icon="solid eject">
              <BConfirm @confirm="removeMeFromRecents()" width="30em" pos="L2B" class="anchor" heading="Forget Prospect">
                Forget Recent?
                <template #message>
                  <ul>
                    <li class="info">Remove this prospect from your Recents list</li>
                    <li v-if="userStore.user.recents && userStore.user.recents.length > 1" class="info">Load the next most recent prospect in the list.</li>
                    <li v-else class="info">There are no other prospects in your Recents list, so you will need to
                      create a new prospect, search for existing prospects or use your Bookmarks list.
                    </li>
                  </ul>
                  <p>
                    This prospect will <b style="color:red"><u>NOT</u></b> be changed in any way.
                    If it was bookmarked it will still be there, and you can search for and
                    find it again at any time.
                  </p>
                </template>
              </BConfirm>
            </BPopupMenuItem> -->
            <!-- <BPopupMenuItem v-if="userStore.getUserRightValue('GROUP_DELETE') == 'Y'"
                :disabled="prospStore.quotes.length > 0" icon="#red trash-can">
              <BConfirm :disabled="prospStore.quotes.length > 0" @confirm="handler.deleteProspect()" pos="L2B" class="anchor" heading="Delete Prospect">Delete Prospect?
                <template #message>
                  This will permanently delete this prospect.
                  <p style="color:red">This cannot be undone!</p>
                </template>
              </BConfirm>
            </BPopupMenuItem> -->
          </template>
        </BPopup>

      </div>
    </div>
    <!-- </div> -->
  </div>
  <!-- <div v-if="!prospStore.issue?.severity && !prospStore.prospWorking && !prospStore.prospect" class="prospect_info BBB">
    No prospect is currently selected.
    <ul style="margin-top: .5em">
      <li>
        Use the <BButton class="modern" icon="solid magnifying-glass_" @click="useSearchProspectPopup().openSearch()">Search&hellip;</BButton>
        button to find prospects by ID, Name, etc
      </li>
      <li>
        Use the <BButton class="action" icon="square-plus_" @click="useNewProspectPopup().openNewProspect()">New Prospect&hellip;</BButton>
        button to create a new Prospect
      </li>
      <li v-if="userStore.user.recents && userStore.user.recents.length > 0">Use the [ <BIcon icon="solid list-ul_">Recent</BIcon> ] link to show a history of your recent Prospects</li>
      <li v-if="userStore.user.faves && userStore.user.faves.length > 0">Use the [ <BIcon icon="bookmark_">Bookmarks</BIcon> ] link to pick from one of your bookmarked Prospects</li>
    </ul>
  </div> -->
  <Teleport to="body">
  <dialog v-if="prospStore.prospect" :id="handler.popId">
    <div class="titlebar">
      Edit Prospect #{{ prospStore.prospect.id }}
    </div>
    <div v-if="userStore.getUserRightValue('GROUP_DELETE') == 'Y'" style="position: absolute; top: .5em; right: .5em;" class="info">
      <BConfirm
      :disabled="prospStore.quotes.length > 0"
      icon="trash-can"
      @confirm="handler.deleteProspect()"
      pos="L2B"
      class="anchor"
      :heading="'Delete Prospect #' + prospStore.prospect.id"
      ><template #message>
        <ul>
          <li>You are granted the right to delete prospects</li>
          <li>There are no quotes related to this prospect</li>
        </ul>
        <p>This prospect will be <b style="color:red"><u>permanently</u></b> deleted!.</p>
        <p style="color:sienna"><BIcon icon="#red solid warning">This cannot be undone!</BIcon></p>
      </template>
      </BConfirm>
    </div>
    <form @submit.stop.prevent="handler.save()">
    <table class="form-table">
      <tbody>
        <tr><th>Created:</th><td class="info">{{ B.format.ts(handler.temp.value.crttms) }} by {{ handler.temp.value.crtusr }}</td></tr>
        <tr><th>Updated:</th><td class="info">{{ B.format.ts(handler.temp.value.updtms) }} by {{ handler.temp.value.updusr }}</td></tr>
        <tr><th>Agent of Record:</th><td class="info">{{ handler.temp.value.agent_id }}</td></tr>

        <tr><td colspan="2"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>

        <tr><th>Group Name:</th><td><input name="grpname" style="width: 30em;" v-model="handler.temp.value.name"></td></tr>
        <tr><th>Contact:</th><td><input name="grpcontact" style="width: 30em;" v-model="handler.temp.value.contact"></td></tr>
        <tr><th>Email:</th><td><input name="grpemail" style="width: 30em;" v-model="handler.temp.value.email"></td></tr>
        <tr><th>Phone:</th><td><input name="grpphone" style="width: 12em;" v-model="handler.temp.value.phone"></td></tr>
        <tr><th>Eligible:</th><td><input name="estimate" style="width: 5em;" v-model="handler.temp.value.subs_estimate">
          <span class="info">(estimate) - Census has {{ B.format.valueWithUnits(prospStore.prospect.census?.length, 'subscriber') }}</span>
        </td></tr>
        <tr><th>Address:</th><td><input name="grpaddr1" style="width: 30em;" v-model="handler.temp.value.addr1"></td></tr>
        <tr><th></th><td><input name="grpaddr2" style="width: 30em;" v-model="handler.temp.value.addr2"></td></tr>
        <tr><th></th><td>
          <input name="grpcity" style="width: 12em; margin-right: .3em;" v-model="handler.temp.value.city">
          <input name="grpstate" style="width: 3em; margin-right: .3em;" v-model="handler.temp.value.state_cd">
          <input name="grpzip" style="width: 6em;" v-model="handler.temp.value.zip_cd">
        </td></tr>
        <tr><th>Enroll Date:</th><td><input name="enrollDate" style="width: 10em;" v-model="handler.temp.value.enroll_date"></td></tr>
        <tr><td colspan="2">
          <div class="buttonbar">
            <BButton type="button" class="anchor" style="margin-right: .6em;" @click="handler.close()" icon="#red solid x">Cancel</BButton>
            <BButton type="submit" class="action" icon="floppy-disk_"> Save Changes</BButton>
          </div>
        </td></tr>
      </tbody>
    </table>
    </form>
  </dialog>
  </Teleport>
</template>
