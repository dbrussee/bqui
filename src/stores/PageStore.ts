import { defineStore } from 'pinia'
import { ref } from 'vue'

export const appPageStore = defineStore('appPageStore', () => {
  type PageCode = 'PROSPECTS' | 'MSGS' | 'SETTINGS' | 'CENSUS' | 'PROPOSALS' | 'DASHBOARD'
  const page = ref<PageCode>("DASHBOARD")

  return { page }
})
