<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import HomePage from "./HomePage.vue";
import SidebarPage from "./SidebarPage.vue";
import { countersStore } from "../stores/CountersStore";
const counters = countersStore();
import InfoBox from "@/components/InfoBox.vue";
import BTable from "@/components/BTable.vue";
import UserConfirm from "@/components/UserConfirm.vue";

const errsGrid = {
  columns: [
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
            <td style="text-align: left; width: 10em">v2.0.01</td>
            <td style="text-align: center">Something</td>
            <td style="text-align: right; width: 10em">
              {{ "⏸️".repeat(counters.apiCalls.active) }}
              <span v-if="counters.apiCalls.error > 0">
              ❌: {{ counters.apiCalls.error }}
              <!-- ✅: {{ counters.apiCalls.success }} -->
              <InfoBox v-if="counters.lastError.length > 0">
                Last Errors:
                <UserConfirm @confirm="counters.lastError.length = 0; counters.apiCalls.error = 0" title="Clear Errors">Clear errors?</UserConfirm>
                <BTable :rows="counters.lastError" :config="errsGrid" />
              </InfoBox>
              </span>
              <!-- <span v-if="counters.apiCalls.error > 0"> ❌: {{ counters.apiCalls.error }} </span> -->
            </td>
          </tr>
        </tbody>
      </table>
    </footer>
  </div>
</template>
