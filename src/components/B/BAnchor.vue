<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { useAttrs } from 'vue'
import BIcon from './BIcon.vue'
const attrs = useAttrs()
defineOptions({
  inheritAttrs: false // Stops Vue from automatically applying parent classes/attributes to the root element
})

const props = defineProps({
  working: {
    type: String,
    required: false,
    default: null
  },
  icon: {
    type: String,
    required: true,
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
  color: {
    type: String,
    required: false,
    default: ''
  },
})

const emit = defineEmits(["click"])
const handleClick = () => {
  if (props.disabled) return
  emit('click')
}
</script>

<template>
  <label
      :class="{anchor: !props.disabled}"
      :style="{color: props.disabled ? 'var(--ui-disabled-text)' : 'var(--anchor-color)'}"
      @click.prevent="handleClick()">
    <BIcon :working="props.working" :disabled="props.disabled" :icon="props.icon" :color="props.color" :class="[attrs.classes]" :style="[attrs.style]" />
    <slot/>
  </label>
</template>

<style lang="css" scoped>
</style>
