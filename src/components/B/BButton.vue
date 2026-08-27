<script setup lang="ts">
import BIcon from './BIcon.vue'

const emit = defineEmits(["click"])

const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: ''
  },
  gapleft: {
    type: Boolean,
    required: false,
    defalt: false
  },
  source: {
    type: String,
    required: false,
    default: 'fa',
    validator(value: string) {
      return ['fa', 'mat'].includes(value)
    }
  },
})
</script>

<template>
  <button @click="emit('click')" :style="{marginLeft: props.gapleft ? '.4em' : ''}">
    <BIcon as="icon" :icon="props.icon" :source="props.source"><slot/></BIcon>
  </button>
</template>

<style lang="css" scoped>

</style>
