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
  <div :class="{item:true, disabled:props.disabled}" style="margin-bottom: .3em;" @click.stop="doClick">
    <div class="icon_container">
      <BIcon :disabled="props.disabled" :icon="props.icon" />
    </div>
    <span :class="{'my-disabled':props.disabled, 'anchor':!props.disabled}"><slot/></span>
  </div>
</template>

<style lang="css" scoped>
.my-disabled {
  cursor: default;
  color: silver;
  & * {
    color: silver;
  }
}
.my-anchor {
  color: var(--anchor-color);
  &:hover {
    text-decoration: underline;
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
