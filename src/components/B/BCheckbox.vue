<script setup lang="ts">
import { computed } from 'vue'
import BIcon from './BIcon.vue';

// Supports standard v-model="myBool" in Vue 3.4+
const checked = defineModel<boolean>({ default: false })

const props = withDefaults(
  defineProps<{
    checkedIcon?: string
    uncheckedIcon?: string
    disabled?: boolean
  }>(),
  {
    checkedIcon: 'square-check', // Font Awesome checked box icon name
    uncheckedIcon: 'square',     // Font Awesome unchecked box icon name
    disabled: false,
  }
)

const currentIcon = computed(() => {
  if (checked.value) {
    return "#green solid square-check_"
  } else {
    return "square_"
  }
})
</script>

<template>
  <label class="icon-checkbox" :class="{ 'is-disabled': disabled }">
    <input
      v-model="checked"
      type="checkbox"
      class="sr-only-input"
      :disabled="disabled"
    />
    <BIcon :icon="currentIcon" class="checkbox-icon" ><slot/></BIcon>
    <!-- <span v-if="$slots.default" class="checkbox-label">
      <slot />
    </span> -->
  </label>
</template>

<style scoped>
.icon-checkbox {
  display: inline-flex;
  align-items: center;
  /* gap: 0.1em; */
  cursor: pointer;
  user-select: none;
}

.icon-checkbox.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Visually hidden, but stays focusable via keyboard (Tab / Space) */
.sr-only-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Optional: Show focus ring on the icon when tabbed to via keyboard */
.sr-only-input:focus-visible + .checkbox-icon {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: 2px;
}
</style>
