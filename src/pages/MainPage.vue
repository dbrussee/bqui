<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import HomePage from "./HomePage.vue";
import SidebarPage from "./SidebarPage.vue";
import { countersStore } from "../stores/CountersStore";
import { appUserStore } from "@/stores/AppUserStore.ts";
const uStore = appUserStore()
import { appProspectStore } from "@/stores/ProspectStore.ts";
const pStore = appProspectStore()
import BConfirm from "@/components/B/BConfirm.vue";
const counters = countersStore();

</script>
<template>
  <div class="page-container">
    <header class="header"><AppHeader /></header>
    <aside class="sidebar">
      <SidebarPage />
    </aside>
    <main class="main-content">
      <HomePage />
    </main>
    <footer class="footer">
      <table style="width: 100%">
        <tbody>
          <tr>
            <td style="text-align: left;">
              <BConfirm v-if="uStore.user"
                  icon="solid arrow-right-from-bracket_"
                  :warning="pStore.censusDirty ? 'You will lose unsaved census changes!' : ''"
                  class="anchor"
                  pos="T2R"
                  @confirm="uStore.logout()">Logout?
                <template #message>
                  Log out user '{{ uStore.user.id }}'
                </template>
              </BConfirm>
            </td>
            <td style="text-align: center">
              Registered Trademark, blah, blah, blah
            </td>
            <td style="text-align: right; width: 15em;">
              <span v-if="counters.apiCalls.active > 0" class="working-message" role="status" aria-live="polite">
                {{ ".".repeat(counters.apiCalls.active)}}Working
              </span>&nbsp;
            </td>
          </tr>
        </tbody>
      </table>
    </footer>
  </div>
</template>

<style scoped>
.working-message {
  display: inline-block;
  animation: working-pulse 1.4s ease-in-out infinite;
}

@keyframes working-pulse {
  0%, 100% {
    color: goldenrod;
    opacity: 0.65;
  }
  50% {
    color: white;
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .working-message {
    animation: none;
    opacity: 1;
    color: white;
  }
}
</style>
