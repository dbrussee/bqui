<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  clickable: {
    type: Boolean,
    required: false,
    default: false
  },
  color: {
    type: String,
    required: false,
    default: ''
  },
  bgcolor: {
    type: String,
    required: false,
    default: ''
  },
  iconcolor: {
    type: String,
    required: false,
    default: ''
  },
  tt: {
    type: String,
    required: false,
    default: ''
  },
    as: {
    type: String,
    required: false,
    default: '',
    validator(value: string) {
      return ['', 'tab', 'tab-current'].includes(value);
    }
  },
  hoverstyle: {
    type: String,
    required: false,
    default: '',
    validator(value: string) {
      return ['', 'dark', 'light'].includes(value);
    }
  }
})
const emit = defineEmits(["click"])
function getClasses() {
  // icon='name' -> <i class='fa-regular fa-name'/>
  // icon='solid name' -> <i class='fa-solid fa-name'/>
  // icon='name_' -> <i class='fa-regular fa-name gapright'/>
  // icon='_name' -> <i class='fa-regular fa-name gapleft'/>
  let vers = ""
  let icon = ""
  let classes = ""
  let parts:string[] = []
  try {
    parts = props.icon.split(" ")
  } catch(e) {
    console.error(e)
  }
  if (parts.length == 1) {
    vers = "regular"
    icon = parts[0] as string
  } else {
    vers = parts[0] as string
    icon = parts[1] as string
  }
  if (icon.startsWith("_")) {
    classes += " gapleft"
    icon = icon.substring(1)
  }
  if (icon.endsWith("_")) {
    classes += " gapright"
    icon = icon.substring(0, icon.length-1)
  }

  if (props.hoverstyle == 'light') classes += ' hoverlight'
  if (props.hoverstyle == 'dark') classes += ' hoverdark'
  return `fa-${vers.trim().toLowerCase()} fa-${icon.trim().toLowerCase()}` + classes
}
</script>
<template>
  <span @click="emit('click')" :class="{anchor: props.clickable, tab:props.as=='tab', 'tab-current':props.as=='tab-current'}" :style="{color:props.color, 'background-color':props.bgcolor}">
  <i :title="props.tt" :style="{color: props.iconcolor}" :class="getClasses()" aria-hidden="true" /><slot/>
  </span>
</template>
<style lang="css" scoped>
span.tab,
span.tab-current {
  padding: .2em .3em;
  border-radius: .3em;;
}
span.tab-current {
  background-color: var(--current-bgcolor);
  border-bottom: 1px solid black;
}
i.hoverlight:hover {
  color: var(--hover_light)
}
i.hoverdark:hover {
  color: var(--hover_dark)
}
i.gapleft {
  margin-left: .2em;
}
i.gapright {
  margin-right: .2em;
}
</style>
