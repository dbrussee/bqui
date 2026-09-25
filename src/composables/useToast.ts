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
        // check if duration was changed
        const toast = findToast(id)
        if (!toast || (toast.duration && toast?.duration > 0)) removeToast(id)
      }, duration)
    }
  }

  const findToast = (id: number):Toast => {
    const list:Toast[] = toasts.value.filter((toast) => toast.id == id)
    return list[0] as Toast
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }
  const lockToast = (id: number) => {
    console.log(`Trying to lock Toast ID ${id}`)
    const toast = findToast(id)
    if (toast) {
      console.log("Found Toast:", toast)
      toast.duration = 0
      console.log(`Locked Toast ID ${id}`)
    } else {
      console.log(`Could not find Toast ID ${id}`)
    }
  }

  return {
    toasts,
    addToast,
    removeToast,
    lockToast
  }
}
