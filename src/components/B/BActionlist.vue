<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useAttrs, useId, type PropType } from 'vue'
import BIcon from './BIcon.vue'
import BButton from './BButton.vue'
import BConfirm from './BConfirm.vue'
import BInfo from './BInfo.vue'
const attrs = useAttrs()
const popid = ref(useId())
defineOptions({
  inheritAttrs: false // Stops Vue from automatically applying parent classes/attributes to the root element
})

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
  actions: {
    type: Array as PropType<any[]>,
    required: false,
    default: () => [
      { seperator: false, confirm: '', text: 'Example', icon: 'lightbulb', disabled: false, action: () => console.log('Clicked example from BActionlist component') },
      { seperator: true, confirm: 'Are you absolutely certain?', text: 'Confirm This', icon: 'solid check-double', disabled: false, action: () => console.log('Clicked confirmed action') }
    ]
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

const handleAction = (itm:any) => {
  itm.action()
  doBlur()
  close();
}
</script>

<template>
  <button :popovertarget="popid" :disabled="props.disabled" :class="attrs.class" :style="attrs.style" @click="doBlur">
    <BIcon :icon="props.icon" :source="props.source">{{props.text}}</BIcon>
  </button>
  <div :id="popid" popover :class="props.pos" :style="{width:props.width,minWidth:props.width,maxWidth:props.width}">
    <div v-if="props.heading != ''" class="titlebar" v-html="props.heading" />
    <div class="list_container">
      <div v-for="(itm, i) in props.actions" :key="i">
        <hr v-if="itm.seperator" style="margin-bottom: .2em; border: none; border-top: 1px solid silver;"/>
        <BButton v-if="itm.confirm==''" class="anchor" :disabled="itm.disabled" :icon="itm.icon" @click="handleAction(itm)">{{ itm.text }}</BButton>
        <BInfo v-if="itm.info" pos="R2T" :text="itm.text" :heading="itm.info.heading"><span v-html="itm.info.body"/></BInfo>
        <BConfirm v-else @confirm="handleAction(itm)" :disabled="itm.disabled" :icon="itm.icon" class="anchor" pos="T">
          {{ itm.text }}
          <template #message>{{ itm.confirm }}</template>
        </BConfirm>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.list_container {
  margin-top: .2em;
  margin-bottom: .2em;
  display: flex;
  flex-direction: column; /* Stacks items vertically */
  gap: .3em;              /* Optional: adds space between items */
}

</style>
