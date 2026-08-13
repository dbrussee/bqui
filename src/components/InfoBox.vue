<script setup lang="ts">
import BPopup from './BPopup.vue';
defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: "",
  },
});

</script>

<template>
  <BPopup as="info" :title="props.title" :class="'info ' + $attrs.class">
    <slot/>
  </BPopup>
</template>

<style lang="css" scoped>

</style>
