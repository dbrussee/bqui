<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useId } from 'vue'
import BIcon from './BIcon.vue'
import BButton from './BButton.vue';

const popid = ref(useId())


const props = defineProps({
  prompt: { type: String, required: true },
  required: { type: Boolean, required: false, default: false },
  placeholder: { type: String, required: false, default: "" },
  text: { type: String, required: false, default: "" },
  class: { type: String, required: false, default: 'anchor' },
  length: { type: Number, required: false, default: 9999 },
  icon: { type: String, required: false, default: "pen-to-square" },
  disabled: { type: Boolean, required: false, default: false },
  pos: {
    type: String,
    required: false,
    default: 'B',
    validator(value: string) {
      return [
        'T','T2L','T2R',
        'R','R2T','R2B',
        'B','B2L','B2R',
        'L','L2T','L2B'
      ].includes(value)
    }
  },
})
const modelValue = ref(props.text)
// watch(() => props.text, (newValue) => {
//   modelValue.value = newValue
// }, { immediate: true })

const emit = defineEmits(["change"])

const getNewText = (event: ToggleEvent) => {
  // 'newState' is a native property of ToggleEvent ('open' or 'closed')
  if (event.newState === 'open') {
    // Re-sync local state with the parent prop right as it reveals on screen
    modelValue.value = props.text
  }
}

const handleChange = () => {
  if (isDisabled()) return
  emit("change", modelValue.value)
  close()
}

const isDisabled = () => {
  if (props.required && modelValue.value == '') return true
  return false
}
const close = () => {
  document.getElementById(popid.value)?.hidePopover();
}
</script>

<template>
  <button
      type="button"
      v-bind="$attrs"
      tabindex="-1"
      onmousedown="event.preventDefault()"
      :popovertarget="popid"
      :disabled="props.disabled"
      :class="props.class">
    <BIcon :icon="props.icon"/><slot/>
  </button>
  <div :id="popid" popover :class="props.pos" @beforetoggle="getNewText">
    <form @submit.prevent="handleChange">
      <div class="titlebar">{{ props.prompt }}</div>
      <table class="form-table">
        <tbody>
          <tr><td>
            <input name="temp"
            :required="props.required"
            :placeholder="props.placeholder"
            :maxlength="props.length"
            autofocus
            :style="{width: '20em'}"
            v-model="modelValue">
          </td></tr>
        </tbody>
      </table>
      <div class="buttonbar">
        <BButton type="button" class="anchor" @click="close()" icon="#red solid x" gapright>Cancel</BButton>
        <BButton type="submit" :disabled="isDisabled()" class="modern" icon="solid check_">Save</BButton>
      </div>
    </form>
  </div>
</template>

<style lang="css" scoped>
input:required::placeholder {
  color: red;
}
</style>
