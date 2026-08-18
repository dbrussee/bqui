<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    required: true,
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
  // icon is one of the following formats
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
  <i :class="getClasses()" aria-hidden="true" @click="emit('click')"/>
</template>
<style lang="css" scoped>
i.hoverlight:hover {
  color: var(--hover_light)
}
i.hoverdark:hover {
  color: var(--hover_dark)
}
i.gapleft {
  padding-left: .2em;
}
i.gapright {
  padding-right: .2em;
}
</style>
