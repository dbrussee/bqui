<script setup lang="ts">
import { ref } from "vue";
import { appProspectStore } from "@/stores/ProspectStore";
const prospectStore = appProspectStore();
import ProspectComponent from "@/components/prospectComponent.vue";

const prospect_id = ref("");

</script>
<template>
  &nbsp;<input v-model="prospect_id" placeholder="Prospect ID" /> &nbsp;<button
    @click="prospectStore.getProspect(prospect_id)"
  >
    Load
  </button>
  <br />
  <ProspectComponent v-if="prospectStore.prospect" />
</template>
<style lang="css" scoped></style>
