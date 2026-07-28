<script setup lang="ts">
import { appProspectStore } from '../stores/ProspectStore'
const store = appProspectStore()

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
  <div v-if="store.prospect.id">
      Prospect ID: {{ store.prospect.id }} (Subs: {{ store.prospect.subs_estimate }} : {{ store.prospect.group_type }})<br/>
      Name: {{ store.prospect.name }}<br/>
      {{ store.prospect.addr1 }}<br/>
      <span v-if="store.prospect.addr2">{{ store.prospect.addr2 }}<br/></span>
      {{ store.prospect.city }}, {{ store.prospect.state_cd }}&nbsp; {{ store.prospect.zip_cd }} ({{ store.prospect.county }})<br/>
      Created By: {{ store.prospect.created_by }} on {{ ts(store.prospect.created_ts) }}<br/>
      <div v-if="store.prospect.last_quoted_ts">Last Quoted: {{ ts(store.prospect.last_quoted_ts) }}</div>
      <div v-if="store.prospect.enrolled_ts">Enrolled: {{ ts(store.prospect.enrolled_ts) + ' as ' + store.prospect.grpnum }}</div>
  </div>
  <div v-else>
    <slot/>
  </div>
</template>
