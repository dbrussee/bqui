<script setup lang="ts">
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  ver: {
    type: String,
    required: false,
    default: "material-symbols-outlined"
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
  let hover = ''
  if (props.hoverstyle == 'light') hover = ' hoverlight'
  if (props.hoverstyle == 'dark') hover = ' hoverdark'
  return props.ver + hover
}
</script>
<template>
  <span :class="getClasses()" aria-hidden="true" @click="emit('click')" v-html="props.icon"/>
</template>
<style lang="css" scoped>
i.hoverlight:hover {
  color: var(--hover_light)
}
i.hoverdark:hover {
  color: var(--hover_dark)
}
</style>
