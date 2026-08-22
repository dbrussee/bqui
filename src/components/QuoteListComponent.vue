<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref } from 'vue';
import { appProspectStore } from '@/stores/ProspectStore.ts';
const prospStore = appProspectStore()
import BTable from './BTable.vue';
import { B } from '@/composables/BUtils.ts';
const props = defineProps({
  height: {
    type: String,
    required: true,
  },
  width: {
    type: String,
    required: true,
  },
})

const cfgQuotesList = ref({
  height: props.height,
  width: props.width,
  columns: [
    { id: "id", heading: "Quote", width: "5em", flags: "R" },
    { id: "effdat", heading: "Effective", width: "6em", flags: "C", formatter: (row:any) => {
      return B.effdat(row.effdat)
    }},
    { id: "rlob", heading: "Product", width: "8em", formatter: (row:any) => {
      return row.qtype + ' ' + row.rlob
    }},
    { id: "descr", heading: "Description" },
    { id: "status", heading: "Status", width: "10em" },
  ],
})

</script>

<template>
  <BTable
    @pick="(row:any) => {
      console.dir(row)
    }"
    :config="cfgQuotesList" :rows="prospStore.quotes"/>
</template>

<style lang="css" scoped>
</style>
