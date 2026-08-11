<script setup lang="ts">
import { useId } from 'vue';
const popid = useId()
defineOptions({
  inheritAttrs: false
})
const props = defineProps({
  linktext: {
    type: String,
    required: true,
  },
  width: {
    type: String,
    required: false,
    default: "fit-content",
  },
  as: {
    type: String,
    required: false,
    default: 'anchor',
    validator(value: string) {
      return ['anchor', 'button'].includes(value);
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
  <button :popovertarget="popid" :class="{anchor:props.as=='anchor'}" :innerHTML="props.linktext"></button>
  <div popover :id="popid" :class="$attrs.class" :style="{'max-width': props.width}">
    <slot/>
  </div>
</template>

<style lang="css" scoped>
div[popover]:popover-open {
  /* 1. Reset default popover centering styles */
  margin: 0;
  inset: auto;
  padding: .4em;
  border: 1px solid black;
  border-radius: 0.5rem;
  position-area: bottom span-right;
}
div.B[popover]:popover-open {
  position-area: bottom span-right;
}
div.T[popover]:popover-open {
  position-area: top span-right;
}
div.L[popover]:popover-open {
  position-area: left;
}
div.R[popover]:popover-open {
  position-area: right;
}
div.TL[popover]:popover-open {
  position-area: top left ;
}
div.TR[popover]:popover-open {
  position-area: top right;
}
div.BL[popover]:popover-open {
  position-area: bottom left;
}
div.BR[popover]:popover-open {
  position-area: bottom right;
}

div[popover]::backdrop {
  background-color: rgba(0, 0, 0, 0.15);
}
</style>
