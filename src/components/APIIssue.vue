<script setup lang="ts">
type Issue = {
  severity: 'FATAL' | string
  message: string
}

const props = defineProps<{
  issue?: Issue | null
}>()
</script>

<style scoped>
.fatal {
  font-weight: bold;
  color: tomato;
}
div {
  color: darkred;
}
</style>

<template>
  <div v-if="props.issue != null">
    <span class="fatal" v-if="props.issue.severity == 'FATAL'">FATAL: </span>
    {{ props.issue.message }}
  </div>
</template>
