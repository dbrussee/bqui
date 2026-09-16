<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import HomePage from "./HomePage.vue";
import SidebarPage from "./SidebarPage.vue";
import { countersStore } from "../stores/CountersStore";
const counters = countersStore();
import { appStore } from "@/stores/AppStore.ts";
const app = appStore()
import { appUserStore } from "../stores/AppUserStore";
const userStore = appUserStore();
import { appProspectStore } from "@/stores/ProspectStore";
const prospStore = appProspectStore();
import BConfirm from "@/components/B/BConfirm.vue";
import BInfo from "@/components/B/BInfo.vue";

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
              &nbsp;&nbsp;
              <BConfirm v-if="userStore.user" :warning="prospStore.censusDirty ? 'You will lose unsaved census changes!' : ''" class="anchor" style="color:white;" pos="T" @confirm="userStore.logout()">
                Logout&hellip;
                <template #message>
                  Log out user '{{ userStore.user.id }}'
                </template>
              </BConfirm>
            </td>
            <td style="text-align: center">
              &nbsp;
            </td>
            <td style="text-align: right; width: 10em">
              <div v-if="counters.apiCalls.active > 0" class="spinner"></div>{{counters.apiCalls.active > 1 ? ':' + counters.apiCalls.active : ''}}&nbsp;
            </td>
          </tr>
        </tbody>
      </table>
    </footer>
  </div>
</template>
