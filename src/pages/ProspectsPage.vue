<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { appProspectStore } from "@/stores/ProspectStore";
const prospectStore = appProspectStore();
import ProspectComponent from "@/components/ProspectComponent.vue";
import QuoteListComponent from "@/components/QuoteListComponent.vue";


</script>
<template>

  <ProspectComponent />
  <div style="margin-top: .5em;" v-if="prospectStore.prospect">
    <QuoteListComponent />
  </div>

</template>
<style lang="css" scoped></style>
