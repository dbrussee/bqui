
<script setup lang="ts">
import { useId, useAttrs } from 'vue';
const attrs = useAttrs()

import BIcon from './BIcon.vue';
const popid = useId()
defineOptions({
  inheritAttrs: false
})
// const emit = defineEmits(['buttonClicked'])

const props = defineProps({
  buttons: {
    type: Array,
    required: false,
    default: () => []
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  icon: {
    type: String,
    required: false,
    default: ""
  },
  width: {
    type: String,
    required: false,
    default: "fit-content",
  },
  heading: {
    type: String,
    required: false,
    default: "",
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
})

function open():void {
  document.getElementById(popid)?.showPopover();
}
function close():void {
  document.getElementById(popid)?.hidePopover();
}
function isOpen():boolean {
  const pop = document.getElementById(popid)
  if (!pop) return false
  return pop.matches(':popover-open')
}

defineExpose({
  open, close, isOpen
})


</script>

<template>
  <button :popovertarget="popid" :disabled="props.disabled" :style="attrs.style" :class="attrs.class"
    ><BIcon v-if="props.icon != ''" :icon="icon"/><slot/></button>
  <div popover="auto" :id="popid" :class="props.pos" :style="{'max-width': props.width}">
    <div style="width: fit-content">
      <div v-if="props.heading != ''" class="titlebar" v-html="props.heading" />
      <slot name="body"/>
    </div>
  </div>

</template>

<style lang="css" scoped>
button.anchor {
  margin-right: .3em;
}
</style>
