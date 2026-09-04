<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import HomePage from "./HomePage.vue";
import SidebarPage from "./SidebarPage.vue";
import { countersStore } from "../stores/CountersStore";
const counters = countersStore();
import { appStore } from "@/stores/AppStore.ts";
const app = appStore()
import BTable from "@/components/B/BTable.vue";
import BPopup from "@/components/B/BPopup.vue";
import BConfirm from "@/components/B/BConfirm.vue";
import BInfo from "@/components/B/BInfo.vue";
import BIcon from "@/components/B/BIcon.vue";
import UserComponent from "@/components/UserComponent.vue";

const errsGrid = {
  height: "15em",
  columns: [

    { id: "ts", heading: "Time", width: "5.5em", flags: "R" },
    { id: "method", heading: "Mth", width: "3em", flags: "C" },
    { id: "path", heading: "Path", width: "14em" },

    { id: "msg", heading: "Message", width: "25em" },
  ],
};


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
            <td style="text-align: left; width: 10em">
              v{{app.version()}}
              <BInfo pos="T2R" :heading="'Application Ver ' + app.version()">
                <ul>
                  <li>Ver: {{ app.versionDescription() }}</li>
                  <li>{{app.vers.release.getTime() < new Date().getTime() ? 'Released: ' : 'Scheduled Release: '}}{{app.vers.release.toLocaleDateString('en-US')}}</li>
                </ul>
              </BInfo></td>
            <td style="text-align: center">
              <UserComponent />
            </td>
            <td style="text-align: right; width: 10em">
              <div v-if="counters.apiCalls.active > 0" class="spinner"></div>{{counters.apiCalls.active > 1 ? ':' + counters.apiCalls.active : ''}}&nbsp;
              <!-- {{ "⏸️".repeat(counters.apiCalls.active) }} -->
              <span v-if="counters.apiCalls.error > 0">
                <BPopup v-if="counters.apiCalls.error > 0" class="clear" pos="TL"><BIcon icon="#red solid bugs"/>
                  <template #body>
                    Last Errors:
                    <BConfirm class="anchor" icon="#red solid x"
                      @confirm="counters.lastError.length = 0; counters.apiCalls.error = 0">Clear Errors?</BConfirm>
                    <BTable :rows="counters.lastError" :config="errsGrid">
                      <template #column_ts="{row}">
                        {{ row.ts.split(" ")[3] }}
                      </template>
                    </BTable>
                  </template>
                </BPopup>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </footer>
  </div>
</template>
