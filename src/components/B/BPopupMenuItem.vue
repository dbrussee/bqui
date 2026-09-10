<script setup lang="ts">
import BIcon from './BIcon.vue';
const emit = defineEmits(["click"])
const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: "#green solid checkmark"
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  }
})
const doClick = () => {
  if (!props.disabled) emit('click')
}
</script>
<template>
  <div :class="{item:true, disabled:props.disabled}" @click.stop="doClick">
    <div class="icon_container">
      <BIcon :icon="props.icon" />
    </div>
    <span class="text_container anchor"><slot/></span>
  </div>
</template>

<style lang="css" scoped>
.disabled {
  cursor: default;
  color: silver;
  & * {
    color: silver;
  }
}
div.item {
  min-width: 8em;
  cursor: pointer;
}
div.icon_container {
  display: inline-block;
  width: 1.1em;
  text-align: right;
  padding-right: 1.4em;
}
</style>
