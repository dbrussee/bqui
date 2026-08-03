<script setup lang="ts">
import UserComponent from '@/components/UserComponent.vue';
import { countersStore } from '../stores/CountersStore'
const counters = countersStore()

</script>

<template>
  <div class="container">
    <div class="logo-area">
      BlueQuote <span style="font-size: 0.8em;"><sup><i>v2.0.01</i></sup></span>
    </div>
    <div class="user-area">
      <UserComponent>Not logged in</UserComponent>
    </div>
    <div class="meta-area">
      <span v-if="counters.apiCalls.active > 0">
        ⌛️: {{ counters.apiCalls.active }}
      </span>
      <!-- ✅: {{ counters.apiCalls.success }} -->
      <span v-if="counters.apiCalls.error > 0">
        ❌: {{ counters.apiCalls.error }}
      </span>
    </div>
  </div>
</template>

<style scoped>
  .container {
    display: grid;
    grid-template-columns: 200px 1fr 100px;
  }
  .meta-area {
    text-align: right;
    font-size: .7em;
  }
</style>
