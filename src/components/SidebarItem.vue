<script setup lang="ts">
const props = defineProps({
  current: {
    type: Boolean,
    required: false,
    default: false
  }
})
</script>

<template>
  <div class="content" :class="{'current_style': props.current, 'non_current_style': !props.current}">
    <slot />
  </div>
</template>

<style lang="css">
  .content {
    display: block;
    padding-top: .3em;

    padding-bottom: .3em;
    border-bottom: 1px solid black;
    padding-left: .3em;
    border-left: 3px solid transparent;

    &:hover {
      border-left-color: dodgerblue;
    }
  }
</style>
