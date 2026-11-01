<script setup lang="ts">
import BIcon from './BIcon.vue'
import type { PropType,ButtonHTMLAttributes } from 'vue'

const emit = defineEmits(["click"])

const props = defineProps({
  prevent: { type: Boolean, required: false, default: false },
  type: { type: String as PropType<ButtonHTMLAttributes['type']>, required: false, default: 'button' },
  icon: { type: String, required: false, default: '' },
  gapleft: { type: Boolean, required: false, defalt: false },
  gapright: { type: Boolean, required: false, defalt: false },
  source: { type: String, required: false, default: 'fa',
    validator(value: string) {
      return ['fa', 'mat'].includes(value)
    }
  },
  disabled: { type: Boolean, required: false, default: false },
  working: { type: Boolean, required: false, default: false }
})
const handleClick = (event:MouseEvent) => {
  if (event && props.prevent) event.preventDefault()
  emit('click')
}
</script>

<template>
  <button :type="props.type" :disabled="props.disabled || props.working" @click="handleClick"
      :style="{marginRight: props.gapright ? '.4em' : '', marginLeft: props.gapleft ? '.4em' : ''}">
    <BIcon :disabled="props.disabled || props.working" :icon="props.icon" :source="props.source"><slot/></BIcon>
  </button>
</template>

<style lang="css" scoped>

</style>
