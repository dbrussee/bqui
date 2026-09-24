<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import HomePage from "./HomePage.vue";
import SidebarPage from "./SidebarPage.vue";
import { countersStore } from "../stores/CountersStore";
const counters = countersStore();
import { appStore } from "@/stores/AppStore.ts";
const app = appStore()
import BInfo from "@/components/B/BInfo.vue";
// import { appUserStore } from "../stores/AppUserStore";
// const userStore = appUserStore();
// import { appProspectStore } from "@/stores/ProspectStore";
// const prospStore = appProspectStore();
// import BConfirm from "@/components/B/BConfirm.vue";

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
              v{{app.version()}}
              <BInfo pos="T2R" :heading="'Application Ver ' + app.version()">
                <ul>
                  <li>Ver: {{ app.versionDescription() }}</li>
                  <li>{{app.vers.release.getTime() < new Date().getTime() ? 'Released: ' : 'Scheduled Release: '}}{{app.vers.release.toLocaleDateString('en-US')}}</li>
                </ul>
              </BInfo>
              <!-- &nbsp;&nbsp;
              <BConfirm v-if="userStore.user"
                  icon="solid arrow-right-from-bracket_"
                  :warning="prospStore.censusDirty ? 'You will lose unsaved census changes!' : ''"
                  class="anchor"
                  pos="T"
                  @confirm="userStore.logout()">Logout?
                <template #message>
                  Log out user '{{ userStore.user.id }}'
                </template>
              </BConfirm> -->
            </td>
            <td style="text-align: center">
              &nbsp;
            </td>
            <td style="text-align: right; width: 15em; color:goldenrod;">
              <span v-if="counters.apiCalls.active > 0" class="working-message" role="status" aria-live="polite">
                Working<span class="working-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>
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

.working-dots {
  display: inline-flex;
  width: 1.25em;
  overflow: hidden;
}

.working-dots span {
  animation: working-dot 1.2s steps(1, end) infinite;
  opacity: 0.2;
}

.working-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.working-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes working-pulse {
  0%, 100% {
    opacity: 0.65;
  }
  50% {
    opacity: 1;
  }
}

@keyframes working-dot {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .working-message,
  .working-dots span {
    animation: none;
    opacity: 1;
  }
}
</style>
