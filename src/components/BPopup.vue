<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { useId, computed } from 'vue';
import UserConfirm from './UserConfirm.vue';
import FA from './FA.vue';
const popid = useId()
defineOptions({
  inheritAttrs: false
})
const emit = defineEmits(['buttonClicked'])

const props = defineProps({
  manual: {
    type: Boolean,
    required: false,
    default: false
  },
  buttons: {
    type: Array,
    required: false,
    default: () => []
  },
  linkicon: {
    type: String,
    required: false,
    default: ""
  },
  linktext: {
    type: String,
    required: false,
    default: "?"
  },
  width: {
    type: String,
    required: false,
    default: "fit-content",
  },
  title: {
    type: String,
    required: false,
    default: "",
  },
  as: {
    type: String,
    required: false,
    default: 'anchor',
    validator(value: string) {
      return ['anchor', 'button', 'help', 'text', 'info'].includes(value);
    }
  },
})


const buttonsList = computed(() => {
  const buttonsList:any[] = []
  props.buttons.forEach((itm:any) => {
    const btn = {...itm}
    if (!btn.code) btn.code = btn.text
    if (!btn.icon) btn.icon = ""
    if (!btn.class) btn.class = ""
    if (!btn.confirm) btn.confirm = ""
    if (!btn.action) btn.action = null
    if (!btn.color) btn.color = ""
    if (!btn.iconcolor) btn.iconcolor = btn.color
    if (btn.text != '') buttonsList.push(btn)
  })
  return buttonsList
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

function clickButton(btn:any):void {
  if (btn.action) {
    const rslt = btn.action()
    // if action method returns false... popup remains open
    if (rslt == null || rslt) close()
  } else {
    // No action provided on the button?
    emit('buttonClicked', btn)
    // If not manual... just close the popup
    if (!props.manual) close()
  }
}
function getIcon() {
  if (props.as == 'help') return "circle-question"
  if (props.as == 'info') return "lightbulb"
  return ""
}


</script>

<template>
  <button v-if="getIcon()" :popovertarget="popid" :class="{button_as_info:true}"><FA :icon="getIcon()"/></button>
  <button v-else :popovertarget="popid" :class="{dull:true, anchor:props.as=='anchor', icon:props.as=='icon', button_as_text:props.as=='text'}"><FA v-if="props.linkicon" :icon="props.linkicon"/><span v-html="props.linktext"/></button>
  <div :popover="props.manual ? 'manual' : ''" :id="popid" :class="(props.manual ? 'manual ' : '') + $attrs.class" :style="{'max-width': props.width}">
    <div style="width: fit-content">
      <div v-if="props.title != ''" class="info_title">
        <FA v-if="getIcon()" :icon="getIcon() + '_'"/><span v-html="props.title" />
      </div>
      <FA v-if="!props.title && getIcon()" :icon="getIcon() + '_'"/>
      <slot/>
      <div v-if="buttonsList.length > 0" class="buttonbar">
        <template v-for="(btn, i) in buttonsList" :key="i">
          <button v-if="btn.confirm == ''" :style="{color:btn.color}" :class="btn.class" @click="clickButton(btn)"><FA :style="{'margin-right': '.3em', color:btn.iconcolor}" v-if="btn.icon != ''" :icon="btn.icon"/>{{ btn.text }}</button>
          <UserConfirm v-else :linktext="btn.text" @confirm="clickButton(btn)" class="L2B">
            <span v-html="btn.confirm" />
          </UserConfirm>
        </template>

      </div>
    </div>
  </div>

</template>

<style lang="css" scoped>
button.anchor {
  margin-right: .3em;
}
button.anchor:hover span.info_icon {
  text-decoration: none;
}

button.button_as_text {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 0;
  font-size: inherit;

    &:focus,
    &:active {
      outline: transparent;
    }

    &:hover {
      text-decoration: underline;
    }
}
button.button_as_info {
  background: none;
  border: none;
  cursor: pointer;
  color: sienna;
  padding: 0;
  font-size: inherit;
  margin-right: .2em;

    &:focus,
    &:active {
      outline: transparent;
    }

    &:hover {
      color: dodgerblue;
    }
}
.icon {
  position: relative;
  bottom: 0.15em;
  font-size: .9em;
  border: 1px solid sienna;
  padding-left: .25em;
  padding-right: .25em;
  border-radius: 50%;
  color: sienna;
  background-color: transparent;

  &:hover {
    background-color: antiquewhite;
    /* border-color: transparent;
    color: black;
    text-decoration: none; */
  }
}


div[popover] {
  text-align: left;
  font-size: 11pt;
  line-height: 1.3;
}
div[popover]:popover-open {
  /* 1. Reset default popover centering styles */
  margin: 0;
  inset: auto;
  padding: .4em;
  border: 1px solid black;
  border-radius: 0.5rem;
  position-area: bottom;
  box-shadow: 3px 3px 3px gray;
}
div.manual[popover]:popover-open {
  border: 3px solid midnightblue;
}
div.CENTER[popover]:popover-open {
  position: fixed;
  inset: 0;
  position-area: unset;
  margin: auto;
  width: fit-content;
  height: fit-content;
}
div.B[popover]:popover-open {
  position-area: bottom;
}
div.B2R[popover]:popover-open {
  position-area: bottom span-right;
}
div.B2L[popover]:popover-open {
  position-area: bottom span-left;
}
div.T[popover]:popover-open {
  position-area: top;
}
div.T2R[popover]:popover-open {
  position-area: top span-right;
}
div.T2L[popover]:popover-open {
  position-area: top span-left;
}
div.L[popover]:popover-open {
  position-area: left span-all;
}
div.L2B[popover]:popover-open {
  position-area: left span-bottom;
}
div.L2T[popover]:popover-open {
  position-area: left span-top;
}
div.R[popover]:popover-open {
  position-area: right span-all;
}
div.R2B[popover]:popover-open {
  position-area: right span-bottom;
}
div.R2T[popover]:popover-open {
  position-area: right span-top;
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

.info_title {
  color: var(--form-prompt-color);
  font-size: 1.2em;
  font-style: normal;
  padding-bottom: 0.2em;
  /* margin-right: .5em; */
  border-bottom: 1px solid var(--form-prompt-color);
  margin-bottom: 0.2em;
}



</style>
