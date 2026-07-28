<script setup lang="ts">
import { appUserStore } from '../stores/AppUserStore'
const userStore = appUserStore()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ts(timestamp = Date.now()) {
  const date = new Date(timestamp);

  // 1. Format the date and time parts (excluding AM/PM)
  const mainFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });

  // 2. Extract parts to cleanly separate the AM/PM suffix
  const parts = mainFormatter.formatToParts(date);
  const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

  // 3. Assemble without commas or extra spaces before am/pm
  const month = partMap.month;
  const day = partMap.day;
  const year = partMap.year;
  const hour = partMap.hour;
  const minute = partMap.minute;
  const second = partMap.second;
  const ampm = partMap.dayPeriod?.toLowerCase().substring(0,1);

  return `${month} ${day}, ${year} ${hour}:${minute}:${second}${ampm}`;
}

</script>

<style scoped>
</style>

<template>
  <div v-if="userStore.user">
      User: {{userStore.user.id }} ({{ userStore.user.fstnam }} {{ userStore.user.lstnam }})
      &nbsp;
      <button @click="userStore.logout()">Logout</button>
  </div>
  <div v-else>
    <slot/>
  </div>
</template>
