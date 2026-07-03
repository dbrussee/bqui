import { defineStore } from 'pinia'
import { ref } from 'vue'

export const countersStore = defineStore('countersStore', () => {
  const apiCalls = ref({
    total: 0,
    active: 0,
    success: 0,
    error: 0,
  })

  return { apiCalls }
})
