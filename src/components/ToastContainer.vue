<!-- components/ToastContainer.vue -->
<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast-item', toast.type]"
      >
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<!-- Update the <style> section in components/ToastContainer.vue -->
<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px; /* Anchored to the bottom instead of top */
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse; /* Inverts stack order so new items appear at the bottom */
  gap: 10px;
  width: 320px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  padding: 12px 16px;
  border-radius: 6px;
  color: #fff;
  font-family: sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Toast Variant Colors */
.success { background-color: #2e7d32; }
.error { background-color: #d32f2f; }
.info { background-color: #0288d1; }
.warning { background-color: #ed6c02; }

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
}
.toast-close:hover {
  opacity: 1;
}

/* Updated Transition Group Styles for Bottom Slide-Up */
.toast-list-enter-from {
  opacity: 0;
  transform: translateY(30px); /* Starts lower down */
}
.toast-list-leave-to {
  opacity: 0;
  transform: scale(0.9); /* Gracefully shrinks as it fades away */
}
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}
.toast-list-move {
  transition: transform 0.3s ease; /* Smoothly animates the layout shift when an item disappears */
}
</style>
