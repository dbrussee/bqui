import { defineStore } from 'pinia'
import { ref } from 'vue'

export const appStore = defineStore('qppStore', () => {
  const vers = ref({
    major: 2,
    minor: 0,
    sub: 0,
    special: "a",
    release: new Date(2027, 0, 1)
  })
  const version = () => {
    const v = vers.value
    return `${v.major}.${v.minor}.${v.sub}${v.special}`
  }

  return { vers, version }
})
