<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BButton from "@/components/B/BButton.vue";
import BIcon from "@/components/B/BIcon.vue";
import { appProspectStore } from "@/stores/ProspectStore";
const prospStore = appProspectStore();
import { appUserStore } from "@/stores/AppUserStore.ts";
const userStore = appUserStore()
import ProspectComponent from "@/components/ProspectComponent.vue";
import QuoteListComponent from "@/components/QuoteListComponent.vue";
import { useNewProspectPopup } from "@/popups/NewProspect/useNewProspectPopup.ts";
import { useSearchProspectPopup } from "@/popups/SearchProspect/useSearchProspectPopup.ts";


</script>
<template>


  <ProspectComponent v-if="prospStore.issue || prospStore.prospWorking != null || prospStore.prospect" />
  <div v-if="!prospStore.issue?.severity && !prospStore.prospWorking && !prospStore.prospect" class="prospect_info BBB">
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
      <li v-if="userStore.user.faves && userStore.user.faves.length > 0">Use the [ <BIcon icon="bookmark_">Bookmarks</BIcon> ] link to pick from your bookmarked Prospects</li>
    </ul>
  </div>
  <div style="margin-top: .5em;" v-if="prospStore.prospect?.id">
    <QuoteListComponent />
  </div>

</template>
<style lang="css" scoped></style>
