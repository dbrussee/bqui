import { defineStore } from 'pinia'
import { ref } from 'vue'

export const VALID_PAGES = ['PROSPECT', 'MSGS', 'SETTINGS', 'CENSUS', 'PROPOSALS', 'DASHBOARD'] as const

export const appPageStore = defineStore('appPageStore', () => {
  const page = ref("DASHBOARD")
  const setPage = (code:string) => {
    page.value = code
  }
  return { page, setPage }
})
