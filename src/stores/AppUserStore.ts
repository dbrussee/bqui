/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import BQAPIFetcher from '@/components/BQAPI'
import { ref } from 'vue'

export const appUserStore = defineStore('appUserStore', () => {
  const user = ref<any>(null)
  const otherUser = ref<any>(null)
  const meta = ref<any>(null)
  // const meta = ref<any>({
  //   ip: 'UNKNOWN',
  //   name: 'UNKNOWN',
  //   os: 'UNKNOWN',
  //   arch: 'UNKNOWN',
  //   tz: 'UNKNOWN',
  //   times: {
  //     start: new Date(),
  //     end: new Date(),
  //     ms: 0,
  //   },
  // })
  const issue = ref<any>(null)

  initialize()

  function initialize() {
    relogin()
    // const storedUser = localStorage.getItem('user')
    // if (storedUser) {
    //   login(storedUser)
    // }
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
    const fetcher = await new BQAPIFetcher().callAPI(`/login/${uid}`, 'POST')
    user.value = fetcher.resp
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    // if (user.value) {
    //   localStorage.setItem('user', uid)
    // } else {
    //   localStorage.removeItem('user')
    // }
    return user.value
  }
  async function relogin() {
    const fetcher = await new BQAPIFetcher().callAPI(`/relogin`, 'POST')
    user.value = fetcher.resp
    meta.value = fetcher.meta
    issue.value = fetcher.issue
    return user.value
  }
  async function logout() {
    await new BQAPIFetcher().callAPI(`/logout`, 'POST')
    user.value = null
    issue.value = null
    meta.value = null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function addFaveoriteProspect(pid:number) {
    const fetcher = await new BQAPIFetcher().callAPI(`/user_favorite/add/${pid}`, "POST")
    user.value.faves = fetcher.resp
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function removeFavoriteProspect(pid:number) {
    const fetcher = await new BQAPIFetcher().callAPI(`/user_favorite/remove/${pid}`, "POST")
    user.value.faves = fetcher.resp
  }
  return { getOtherUser, login, logout, otherUser, user, meta, issue }
})
