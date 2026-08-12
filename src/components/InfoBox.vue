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
  <BPopup as="icon" :title="props.title" :class="'info ' + $attrs.class" linktext="?">
    <slot/>
  </BPopup>
<!-- <button :popovertarget="popid" class="anchor"><span class="info_icon">?</span></button>
<div :id="popid" popover>
  <div v-if="props.title != ''" class="info_title">
    {{ props.title }}
  </div>
  <div class="local-info">
    <slot />
  </div>
</div> -->
</template>

<style lang="css" scoped>

</style>
