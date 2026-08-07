<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import HomePage from "./HomePage.vue";
import SidebarPage from "./SidebarPage.vue";
import { countersStore } from "../stores/CountersStore";
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
            <td style="text-align: left; width: 10em">v2.0.01</td>
            <td style="text-align: center">Something</td>
            <td style="text-align: right; width: 10em">
              {{ "⌛️".repeat(counters.apiCalls.active) }}
              <!-- ✅: {{ counters.apiCalls.success }} -->
              <span v-if="counters.apiCalls.error > 0"> ❌: {{ counters.apiCalls.error }} </span>
            </td>
          </tr>
        </tbody>
      </table>
    </footer>
  </div>
</template>
