// composables/useToast.ts
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

// Global reactive state
const toasts = ref<Toast[]>([])
let counter = 0

export function useToast() {
  const addToast = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = counter++
    const newToast: Toast = { id, message, type, duration }

    toasts.value.push(newToast)

    // Automatically remove the toast after the specified duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast
  }
}
