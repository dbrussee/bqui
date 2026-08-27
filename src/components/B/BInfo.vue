
<script setup lang="ts">
import { ref, useId } from 'vue'
import BIcon from './BIcon.vue'
const popid = ref(useId())

const props = defineProps({
  text: {
    type: String,
    required: false,
    default: ""
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
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
})

</script>

<template>
  <button tabindex="-1" onmousedown="event.preventDefault()" :popovertarget="popid" :disabled="props.disabled" class="anchor">
    <BIcon icon="#sienna lightbulb">{{props.text}}</BIcon>
  </button>
  <div :id="popid" popover :class="props.pos" :style="{width:props.width,minWidth:props.width,maxWidth:props.width}">
    <div v-if="props.heading != ''" class="titlebar" v-html="props.heading" />
    <div class="info"><slot/></div>
  </div>
</template>

<style lang="css" scoped>

</style>
