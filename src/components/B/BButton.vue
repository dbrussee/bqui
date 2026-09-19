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
  gapright: {
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
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  working: {
    type: Boolean,
    required: false,
    default: false
  }
})
</script>

<template>
  <button :disabled="props.disabled || props.working" @click="emit('click')"
      :style="{marginRight: props.gapright ? '.4em' : '', marginLeft: props.gapleft ? '.4em' : ''}">
    <BIcon :disabled="props.disabled || props.working" :icon="props.icon" :source="props.source"><slot/></BIcon>
  </button>
</template>

<style lang="css" scoped>

</style>
