/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import BQAPIFetcher from '@/components/BQAPI'
import { ref } from 'vue'

export const appUserStore = defineStore('appUserStore', () => {
  const user = ref<any>(null)
  const otherUser = ref<any>(null)
  const meta = ref<any>({
    ip: 'UNKNOWN',
    name: 'UNKNOWN',
    os: 'UNKNOWN',
    arch: 'UNKNOWN',
    tz: 'UNKNOWN',
    times: {
      start: new Date(),
      end: new Date(),
      ms: 0,
    },
  })
  const issue = ref<any>({})

  initialize()

  function initialize() {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      login(storedUser)
    }
  }

  async function getOtherUser(uid: string) {
    otherUser.value = null
    const fetcher = await new BQAPIFetcher().callAPI(`/user/${uid}`, 'GET')
    otherUser.value = fetcher.resp
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    return otherUser.value
  }
  async function login(uid: string) {
    user.value = null
    const fetcher = await new BQAPIFetcher().callAPI(`/user/login/${uid}`, 'POST')
    user.value = fetcher.resp
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    if (user.value) {
      localStorage.setItem('user', uid)
    } else {
      localStorage.removeItem('user')
    }
    return user.value
  }
  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }

  return { getOtherUser, login, logout, otherUser, user, meta, issue }
})
