<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import BIcon from './BIcon.vue'
import BButton from './BButton.vue';

const popid = ref(useId())


const props = defineProps({
  prompt: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
    default: ""
  },
  text: {
    type: String,
    required: false,
    default: ""
  },
  class: {
    type: String,
    required: false,
    default: 'anchor'
  },
  length: {
    type: Number,
    required: false,
    default: 20
  },
  icon: {
    type: String,
    required: false,
    default: "pen-to-square"
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
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

watch(
() => props.text,
  (newText, oldText) => {
    if (newText != oldText) modelValue.value = newText
  },
  { immediate: false } // Optional: Run the function immediately on component load
)
const modelValue = ref(props.text)

const emit = defineEmits(["change"])

const handleChange = () => {
  if (props.text == '' || modelValue.value != props.text) emit("change", modelValue.value)
  close()
}
const close = () => {
  document.getElementById(popid.value)?.hidePopover();
}
</script>

<template>
  <button
      v-bind="$attrs"
      tabindex="-1"
      onmousedown="event.preventDefault()"
      :popovertarget="popid"
      :disabled="props.disabled"
      :class="props.class">
    <BIcon :icon="props.icon"/><slot/>
  </button>
  <div :id="popid" popover :class="props.pos">
    <form @submit.prevent="handleChange()">
      <div class="titlebar">{{ props.prompt }}</div>
      <table class="form-table">
        <tbody>
          <tr><td>
            <input name="temp"
              :placeholder="props.placeholder"
              autofocus
              :style="{width: props.length + 'em'}"
              v-model="modelValue">
          </td></tr>
        </tbody>
      </table>
      <div class="buttonbar">
        <BButton class="anchor" @click="close()" icon="#red solid x" gapright>Cancel</BButton>
        <BButton class="modern" icon="solid check_">Save</BButton>
      </div>
    </form>
  </div>
</template>

<style lang="css" scoped>

</style>
