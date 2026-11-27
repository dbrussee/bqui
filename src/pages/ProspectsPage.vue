<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { useNewProspectPopup } from "@/popups/NewProspect/useNewProspectPopup.ts";
import { useSearchProspectPopup } from "@/popups/SearchProspect/useSearchProspectPopup.ts";
import { appProspectStore } from "../stores/ProspectStore.ts";
const pStore = appProspectStore();
import { proposalStore } from "@/stores/ProposalStore.ts";
const ppStore = proposalStore()
import { appUserStore } from "@/stores/AppUserStore.ts";
const uStore = appUserStore()
import { B } from "@/composables/BUtils";
import { useId, ref, toRaw, watch, onMounted, onUpdated } from "vue";
import BIcon from "@/components/B/BIcon.vue";
import BButton from "@/components/B/BButton.vue";
import type { Iprospect } from "@/types/prospect.schema.ts";
import BConfirm from "@/components/B/BConfirm.vue";

const cloneProspect = (p: typeof pStore.prospect):any => {
  if (!p) return
  const clone = structuredClone(toRaw(p))
  return clone
}

const handler = {
  popId: useId(),
  save() {
    // pStore.prospect = {...this.pclone.value as Iprospect}
    pStore.updateProspect(pStore.prospect)
    // this.pclone.value = cloneProspect(pStore.prospect)
  },
  reset() {
    pStore.reloadProspect()
    // this.pclone.value = cloneProspect(pStore.prospect)
  },
  deleteProspect() {
    pStore.deleteProspect()
  }
}
const prospectCSZ = (prosp:any) => {
  let cnty = prosp.county
  if (!cnty) cnty = "<span style='color:silver;'>No County</span>"
  return `${prosp.city}, ${prosp.state_cd}&nbsp; ${prosp.zip_cd} <i style='font-size: .9em'>(${cnty})</i>`
}

function getProposalsCount():string {
  if (!pStore.prospect?.id) return "No Prospect"
  if (!ppStore.proposaldata) return "None"
  const effCount = Object.keys(ppStore.proposaldata).length
  let pCount = 0
  for (const eff of Object.keys(ppStore.proposaldata)) {
    const node = ppStore.proposaldata[eff]
    pCount += node.length
  }
  return `${effCount} ${B.format.plural(effCount, "Eff Date")}, ${pCount} ${B.format.plural(pCount, "Proposal")}`
}

</script>

<style scoped>
.prospect_info {
  position: relative;
  min-height: 3.7em;
}
</style>
<template>
  <div v-if="!pStore.issue?.severity && !pStore.prospWorking && !pStore.prospect" class="prospect_info BBB">
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
      <li v-if="uStore.user?.recents && uStore.user?.recents.length > 0">Use the [ <BIcon icon="solid list-ul_">Recent</BIcon> ] link to show a history of your recent Prospects</li>
      <li v-if="uStore.user?.faves && uStore.user?.faves.length > 0">Use the [ <BIcon icon="bookmark_">Bookmarks</BIcon> ] link to pick from your bookmarked Prospects</li>
    </ul>
  </div>
  <div class="fieldset-container">
    <fieldset v-if="pStore.prospect && pStore.prospect">
      <legend>Prospect Details #{{ pStore.prospect.id }}</legend>
      <form @submit.prevent.stop="handler.save()" style="width:100%">
        <button type="submit" hidden></button>
        <table class="form-table" style="width: 100%">
          <tbody>
            <tr><th style="width:5em;">Name:</th><td><input :readonly="uStore.isUserReadOnly()" name="grpname" style="width: 100%;" v-model="pStore.prospect.name"></td></tr>
            <tr><th>DBA:</th><td><input :readonly="uStore.isUserReadOnly()" name="dba" style="width: 100%;" v-model="pStore.prospect.dba"></td></tr>
            <tr><th>Contact:</th><td><input :readonly="uStore.isUserReadOnly()" name="grpcontact" style="width: 100%;" v-model="pStore.prospect.contact"></td></tr>
            <tr><th>Email:</th><td><input :readonly="uStore.isUserReadOnly()" name="grpemail" style="width: 100%;" v-model="pStore.prospect.email"></td></tr>
            <tr><th>Phone:</th><td><input :readonly="uStore.isUserReadOnly()" name="grpphone" style="width: 100%;" v-model="pStore.prospect.phone"></td></tr>
            <tr><th>Eligible:</th><td><input :readonly="uStore.isUserReadOnly()" name="estimate" style="width: 5em;" v-model.number="pStore.prospect.subs_estimate">
              <span class="info">(estimate) Census: {{ B.format.valueWithUnits(pStore.prospect.census?.length ?? 0, 'sub') }}</span>
            </td></tr>
            <tr><th>Address:</th><td><input :readonly="uStore.isUserReadOnly()" name="grpaddr1" style="width: 100%;" v-model="pStore.prospect.addr1"></td></tr>
            <tr><th></th><td><input :readonly="uStore.isUserReadOnly()" name="grpaddr2" style="width: 100%;" v-model="pStore.prospect.addr2"></td></tr>
            <tr><th></th><td>
              <input :readonly="uStore.isUserReadOnly()" name="grpcity" style="width: 10em; margin-right: .3em;" v-model="pStore.prospect.city">
              <input :readonly="uStore.isUserReadOnly()" name="grpstate" style="width: 3em; margin-right: .3em;" v-model="pStore.prospect.state_cd">
              <input :readonly="uStore.isUserReadOnly()" name="grpzip" style="width: 6em;" v-model="pStore.prospect.zip_cd">
            </td></tr>

            <tr><th>Agent:</th><td><input class="info" :value="pStore.prospect.agent_id" readonly/></td></tr>
            <tr><td colspan="2"><hr style="margin-top:.3em; margin-bottom:.3em;"/></td></tr>
            <tr><th>Created:</th><td class="info">{{ B.format.ts(pStore.prospect.crttms) }} by {{ pStore.prospect.crtusr }}</td></tr>
            <tr><th>Updated:</th><td class="info">{{ B.format.ts(pStore.prospect.updtms) }} by {{ pStore.prospect.updusr }}</td></tr>

          </tbody>
        </table>
      </form>
      <div class="buttonbar" style="margin-top: .5em;">
        <BConfirm v-if="uStore.getUserRightValue('GROUP_DELETE') == 'Y'" @confirm="handler.deleteProspect()" :disabled="pStore.quotes.length > 0" class="anchor" icon="#red trash-can" style="float:left" pos="T2R"></BConfirm>
        <BConfirm v-if="!uStore.isUserReadOnly()" pos="T" class="anchor" style="margin-right: .6em;" @confirm="handler.reset()" icon="solid angles-left" gapright>Reset</BConfirm>
        <BButton v-if="!uStore.isUserReadOnly()" type="button" @click="handler.save()" class="modern" icon="floppy-disk_"> Save Changes</BButton>
      </div>
    </fieldset>
    <fieldset v-if="pStore.prospect && pStore.prospect" style="margin-top: 0;">
      <legend>General Information</legend>
      <table class="form-table">
        <tbody>
          <tr><th>REVA:</th><td>Not Enrolled</td></tr>
          <tr><th>Enrolled:</th><td>{{ B.format.ts(pStore.prospect.enroll_date) }}</td></tr>
          <tr><th>Proposals:</th><td>{{ getProposalsCount() }}</td></tr>
        </tbody>
      </table>
    </fieldset>
  </div>
</template>
<style lang="css" scoped>
fieldset {
  padding: .4em;
  border-radius: .4em;
  /* width: 100%; */
  backface-visibility: hidden;
  transform: translateZ(0);
  background-clip: padding-box;
  overflow: hidden;
  legend {
    margin-left: .7em;
    padding-left: .3em;
    padding-right: .3em;
    padding-bottom: .3rem;
    font-style: italic;
    font-size: 1.2em;
    color: var(--form-prompt-color) !important;
    /* border: 1px solid; */
    border-radius: .3em;
  }
}

.fieldset-container {
  display: flex;           /* Required to put child fieldsets side by side */
  align-items: flex-start; /* Aligns fieldsets cleanly at the top */
  gap: .3rem;
  width: 100%;
  box-sizing: border-box;
}

/* 2. Side-by-Side Fieldsets */
.fieldset-container > fieldset {
  flex: 1 1 0%;            /* Grow and shrink equally from a 0px basis */
  min-inline-size: 0;      /* Overrides browser's min-content lock on <fieldset> */
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}

/* 3. Form Bridge */
.fieldset-container > fieldset > form {
  width: 100%;
}


</style>
