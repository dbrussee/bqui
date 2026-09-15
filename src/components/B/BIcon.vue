<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
const attrs = useAttrs()
defineOptions({
  inheritAttrs: false // Stops Vue from automatically applying parent classes/attributes to the root element
})

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: false,
    default: 'fa',
    validator(value: string) {
      return ['fa', 'mat'].includes(value)
    }
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  color: {
    type: String,
    required: false,
    default: ''
  },
})

const emit = defineEmits(["click"])
const iconcolor = ref()

const getClasses = computed(() => {
  if (props.source == 'fa') {
    return getClasses_fa()
  } else if (props.source == 'mat') {
    // do mat stuff
  }
  return ""
})
const getClasses_fa = () => {
  // icon='name' -> <i class='fa-regular fa-name'/>
  // icon='solid name' -> <i class='fa-solid fa-name'/>
  // icon='name_' -> <i class='fa-regular fa-name gapright'/>
  // icon='_name' -> <i class='fa-regular fa-name gapleft'/>
  let vers = "fa-regular"
  const classes = new Set()
  classes.add("fa")
  iconcolor.value = props.disabled ? 'var(--ui-disabled-text)' : props.color
  let parts:string[] = []
  try {
    parts = props.icon.split(" ")
  } catch(e) {
    console.error(e)
  }
  parts.forEach(part => {
    // Underscore modifies the icon but does not change the item
    // envelope_ means an 'envelope' icon with a gap to the right
    if (part.startsWith("_")) {
      classes.add("gapleft")
      part = part.substring(1)
    }
    if (part.endsWith("_")) {
      classes.add("gapright")
      part = part.substring(0, part.length - 1)
    }
    if (part.startsWith("#")) {
      if (!props.disabled) iconcolor.value = part.substring(1)
    } else if (part == "regular") {
      vers = " fa-regular"
    } else if (part == "solid") {
      vers = " fa-solid"
    } else {
      classes.add("fa-" + part)
    }
  })
  classes.add(vers)

  // if (props.hoverstyle == 'light') classes.add('hoverlight')
  // if (props.hoverstyle == 'dark') classes.add('hoverdark')

  return ([...classes].join(' '))
}

const getStyle = computed(() => {
  if (props.source == 'fa') {
    return getStyle_fa()
  } else if (props.source == 'mat') {
    // Material stuff
  }
  return ""
})
const getStyle_fa = () => {
  const stuff:any = {}
  if (iconcolor.value) stuff['color'] = iconcolor.value
  return stuff
}

</script>

<template>
  <i v-if="props.icon != ''"
    :class="[getClasses, attrs.classes]"
    :style="[getStyle, attrs.style]"
    @click="emit('click')"
  /><slot/>
</template>

<style lang="css" scoped>

</style>
