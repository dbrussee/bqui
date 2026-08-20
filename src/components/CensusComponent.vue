<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import BTable from './BTable.vue';



</script>

<template>
  <BTable config="{
      height: '7em',
      columns: [
      { id: 'qid', heading: 'Quote ID', width: '6em' },
      { id: 'effdat', heading: 'Effective', width: '10em' },
    ]
  }" />
</template>

<style lang="css" scoped>
</style>
