import { defineStore } from 'pinia'
import { ref } from 'vue'

export const appPageStore = defineStore('appPageStore', () => {
  type PageCode = 'PROSPECTS' | 'MSGS' | 'SETTINGS'
  const page = ref<PageCode>("PROSPECTS")

  return { page }
})
