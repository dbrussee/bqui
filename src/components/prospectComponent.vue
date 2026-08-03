<script setup lang="ts">
import { appProspectStore } from '../stores/ProspectStore'
const store = appProspectStore()
import { B } from '@/composables/BUtils';

</script>

<style scoped>
</style>

<template>
  <div v-if="store.prospect.id">
      Prospect ID: {{ store.prospect.id }} ({{ store.prospect.subs_estimate }} {{ B.plural(store.prospect.subs_estimate, 'Sub') }}, Code: {{ store.prospect.size_cd }}, Type: {{ store.prospect.group_type }})<br/>
      Name: {{ store.prospect.name }}<br/>
      {{ store.prospect.addr1 }}<br/>
      <span v-if="store.prospect.addr2">{{ store.prospect.addr2 }}<br/></span>
      {{ store.prospect.city }}, {{ store.prospect.state_cd }}&nbsp; {{ store.prospect.zip_cd }} ({{ store.prospect.county }})<br/>
      Created By: {{ store.prospect.created_by }} on {{ B.ts(store.prospect.created_ts) }}<br/>
      <div v-if="store.prospect.last_quoted_ts">Last Quoted: {{ B.ts(store.prospect.last_quoted_ts) }}</div>
      <div v-if="store.prospect.enrolled_ts">Enrolled: {{ B.ts(store.prospect.enrolled_ts) + ' as ' + store.prospect.grpnum }}</div>
  </div>
  <div v-else>
    <slot/>
  </div>
</template>
