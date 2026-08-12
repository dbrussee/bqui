<script setup lang="ts">
import { useId, computed } from 'vue';
import UserConfirm from './UserConfirm.vue';
const popid = useId()
defineOptions({
  inheritAttrs: false
})
const emit = defineEmits(['buttonClicked'])
const props = defineProps({
  buttons: {
    type: String,
    required: false,
    default: ""
  },
  linktext: {
    type: String,
    required: true,
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
      return ['anchor', 'button', 'icon'].includes(value);
    }
  },
})

interface PopupButton {
  id: string,
  text: string,
  confirm: string,
}

const buttonsList = computed(() => {
  const buttonsList:PopupButton[] = []
  const main_list = props.buttons.split(",")
  // "Button A,Button B"
  // "A/ButtonA,B/Button B"
  // "Button A:Are you sure you wnat to choose option A?""
  main_list.forEach((raw_button:string) => {
    if (raw_button == '') return
    let code = ''
    let text = ''
    let conf = ''
    const parts = raw_button.split("|")
      // Button A or A/Button A
    const parts2 = parts[0]?.split("/")
    if (parts2?.length == 1) {
      code = parts2[0] as string
      text = parts2[0] as string
    } else if (parts2?.length == 2) {
      code = parts2[0] as string
      text = parts2[1] as string
    }
    if (parts.length == 2) {
      // Button A:Confirm Text
      conf = parts[1] as string
    }
    if (code != '') {
      buttonsList.push({id: code, text: text, confirm: conf})
    }
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

function clickButton(id:string):void {
  emit('buttonClicked', id)
  close()
}

</script>

<template>
  <button :popovertarget="popid" :class="{anchor:props.as=='anchor', icon:props.as=='icon'}" :innerHTML="props.linktext"></button>
  <div popover :id="popid" :class="$attrs.class" :style="{'max-width': props.width}">
    <div v-if="props.title != ''" class="info_title">
      <span v-html="props.title" />
    </div>
    <slot/>
    <div v-if="buttonsList.length > 0" class="buttonbar">
      <template v-for="(btn, i) in buttonsList" :key="i">
        <button v-if="btn.confirm == ''" @click="clickButton(btn.id)">{{ btn.text }}</button>
        <UserConfirm v-else :linktext="btn.text" @confirm="clickButton(btn.id)" class="L2B">
          <span v-html="btn.confirm" />
        </UserConfirm>
      </template>

    </div>
  </div>
</template>

<style lang="css" scoped>
button.anchor:hover span.info_icon {
  text-decoration: none;
}

div.buttonbar {
  padding-top: .3em;
  padding-right: .5em;
  margin-top: .3em;
  text-align: right;

  button {
    margin-left: 3px;
  }
}
div[popover] {
  text-align: left;
}
div[popover]:popover-open {
  /* 1. Reset default popover centering styles */
  margin: 0;
  inset: auto;
  padding: .4em;
  border: 1px solid black;
  border-radius: 0.5rem;
  position-area: bottom;
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
  padding-bottom: 0.2em;
  margin-right: .5em;
  border-bottom: 1px solid black;
  margin-bottom: 0.2em;
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


</style>
