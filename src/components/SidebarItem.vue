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
  <div class="content" :class="{'picked': props.current}">
    <slot />
  </div>
</template>

<style lang="css">
  .content {
    display: block;
    padding-top: .3em;
    cursor: pointer;

    padding-bottom: .3em;
    border-bottom: 1px solid var(--table-row-border-color);
    padding-left: .3em;
    border-left: 3px solid transparent;

    &:hover {
      color: oklch(100% 0 0);
      background-color: var(--table-row-picked-bg);

      /* p { color: var(--form-prompt-color); } */
    }
    p { color: var(--form-prompt-color); }

  }
  .picked {
    color: var(--table-row-picked-text) !important;
    background-color: var(--table-row-picked-bg);

    /* p { color: var(--form-prompt-color); } */
  }
</style>
