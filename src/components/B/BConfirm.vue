<script setup lang="ts">
import { ref, useAttrs, useId } from 'vue'
import BIcon from './BIcon.vue'
import BButton from './BButton.vue'
const attrs = useAttrs()
const popid = ref(useId())
defineOptions({
  inheritAttrs: false // Stops Vue from automatically applying parent classes/attributes to the root element
})

const emit = defineEmits(["confirm"])

const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: ''
  },
  source: {
    type: String,
    required: false,
    default: 'fa',
    validator(value: string) {
      return ['fa', 'mat'].includes(value)
    }
  },
  pos: { // For confirm popover
    type: String,
    required: false,
    default: 'B',
    validator(value: string) {
      return [
        'T','T2L','T2R',
        'R','R2T','R2B',
        'B','B2L','B2R',
        'L','L2T','L2B'
      ].includes(value)
    }
  },
  heading: { // Title for confirm popover
    type: String,
    required: false,
    default: ''
  },
  width: {
    type: String,
    required: false,
    default: 'fit-content'
  },
  confirm_btn_text: {
    type: String,
    required: false,
    default: 'Confirm'
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
})
const open = ():void => {
  document.getElementById(popid.value)?.showPopover()
}
const close = ():void => {
  document.getElementById(popid.value)?.hidePopover()
}
const isOpen = ():boolean => {
  const pop = document.getElementById(popid.value)
  if (!pop) return false
  return pop.matches(':popover-open')
}

defineExpose({
  open, close, isOpen
})

const doBlur = ():void => {
  window.setTimeout(() => {
    const pop = document.getElementById(popid.value)
    const btn = pop?.querySelector('button')
    btn?.focus()
  })
}
</script>

<template>
  <button :popovertarget="popid" :disabled="props.disabled" :class="attrs.class" :style="attrs.style" @click="doBlur()">
    <BIcon :icon="props.icon" :source="props.source"><slot/></BIcon>
  </button>
  <div :id="popid" popover :class="props.pos" :style="{width:props.width,minWidth:props.width,maxWidth:props.width}">
    <div v-if="props.heading != ''" class="titlebar" v-html="props.heading" /><slot
      name="message">Are you sure?</slot>
    <div class="buttonbar">
      <BButton @click="emit('confirm'); close()" icon="#green solid check_">{{ props.confirm_btn_text }}</BButton>
    </div>
  </div>
</template>

<style lang="css" scoped>


</style>
