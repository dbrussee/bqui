<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  ver: {
    type: String,
    required: false,
    default: "regular"
  }
})
const emit = defineEmits(["click"])
function getClass():string {
  return `fa-${props.ver} fa-${props.icon}`
}
</script>
<template>
  <i :class="getClass()" aria-hidden="true" @click="emit('click')"/>
</template>
<style lang="css" scoped>
</style>
