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
  <BPopup as="help" :title="props.title" :class="$attrs.class">
    <slot/>
  </BPopup>
</template>

<style lang="css" scoped>

</style>
