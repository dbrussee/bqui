<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import BIcon from './B/BIcon.vue';
const {copy, copied} = useClipboard()
const props = defineProps({
  cliptext: { // For confirm popover
    type: String,
    required: false,
    default: ''
  },
})

const handleCopy = () => {
  if (!props.cliptext || props.cliptext == '') return
  copy(props.cliptext)
}

</script>

<template>
    <BIcon
      v-if="props.cliptext && props.cliptext != ''"
      :icon="copied ? '#goldenrod solid _copy' : '_copy'"
      @click="handleCopy()"><slot/></BIcon>
</template>

<style lang="css" scoped>

</style>
