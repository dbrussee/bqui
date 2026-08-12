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
    padding-top: .2em;

    padding-bottom: .2em;
    border-bottom: 1px solid black;
    padding-left: .2em;
  }
</style>
